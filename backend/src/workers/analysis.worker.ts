import { Worker, Job } from 'bullmq';
import { getRedis } from '../config/redis';
import { config } from '../config';
import { db } from '../db/client';
import { getDownloadSignedUrl } from '../services/storage.service';
import { AnalyzeJobPayload, ReconstructionAnalyzeJobPayload, SimulationAnalyzeJobPayload } from '../types';

// ── Metric names expected by the system ─────────────────────────
const METRIC_NAMES = [
    'communication_clarity',
    'structural_thinking',
    'technical_depth',
    'tradeoff_awareness',
    'quantification_impact',
    'followup_handling',
    'seniority_alignment',
    'confidence_signal',
];

// ── Shared: Save analysis results to DB ─────────────────────────

interface AnalysisResult {
    overall_score: number;
    summary: string;
    badge: string;
    vocal_signals?: any;
    metrics?: Record<string, { score: number; explanation: string; examples?: { text: string; label: string; question_text?: string }[] }>;
    transcript?: { speaker: string; text: string; start_ms: number; end_ms: number }[];
    top_strengths?: { title: string; description: string }[];
    key_improvement_areas?: { title: string; description: string }[];
    roadmap?: { week_label: string; theme: string; tasks: string[] }[];
}

export async function saveAnalysisResults(
    interviewId: string,
    userId: string,
    analysis: AnalysisResult
): Promise<void> {
    // START TRANSACTION
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Save transcript if provided
        if (analysis.transcript && analysis.transcript.length > 0) {
            await client.query('DELETE FROM transcript_segments WHERE interview_id = $1', [interviewId]);
            const rawText = analysis.transcript.map((t: any) => t.text).join(' ');
            await client.query(
                'INSERT INTO transcripts (interview_id, raw_text) VALUES ($1, $2) ON CONFLICT (interview_id) DO UPDATE SET raw_text = EXCLUDED.raw_text',
                [interviewId, rawText]
            );

            // Optimized batch insertion for N items
            const values: any[] = [];
            const placeholders = analysis.transcript.map((t: any, i: number) => {
                const offset = i * 6;
                values.push(interviewId, i + 1, t.speaker, t.text, t.start_ms || 0, t.end_ms || 0);
                return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
            }).join(', ');
            
            await client.query(
                `INSERT INTO transcript_segments (interview_id, segment_order, speaker, text, start_ms, end_ms) VALUES ${placeholders}`,
                values
            );
        }

        // 2. Save metrics
        const metricsToSave = Object.entries(analysis.metrics || {});
        console.log(`[AnalysisWorker] 📊 Attempting to save ${metricsToSave.length} metrics (Atomic Transaction)...`);

        // First, clean up all existing examples for these metrics to avoid duplication
        await client.query(`
            DELETE FROM metric_examples 
            WHERE metric_id IN (SELECT id FROM metrics WHERE interview_id = $1)
        `, [interviewId]);

        for (const [metricName, data] of metricsToSave) {
            const metric = await client.query(
                `INSERT INTO metrics (interview_id, metric_name, score, explanation_summary)
                 VALUES ($1,$2,$3,$4) 
                 ON CONFLICT (interview_id, metric_name) 
                 DO UPDATE SET score = EXCLUDED.score, explanation_summary = EXCLUDED.explanation_summary
                 RETURNING id`,
                [interviewId, metricName, data.score, data.explanation]
            );
            const metricId = metric.rows[0]?.id;

            if (metricId && data.examples) {
                for (const ex of data.examples) {
                    await client.query(
                        'INSERT INTO metric_examples (metric_id, label, comment, question_text) VALUES ($1,$2,$3,$4)',
                        [metricId, ex.label, ex.text, ex.question_text || null]
                    );
                }
            }
        }

        // 3. Generate/update roadmap
        let roadmapResult = await client.query('SELECT id FROM roadmaps WHERE user_id = $1', [userId]);
        let roadmapId: string;
        if (!roadmapResult.rows[0]) {
            const r = await client.query('INSERT INTO roadmaps (user_id) VALUES ($1) RETURNING id', [userId]);
            roadmapId = r.rows[0].id;
        } else {
            roadmapId = roadmapResult.rows[0].id;
            await client.query('DELETE FROM roadmap_tasks WHERE roadmap_id = $1', [roadmapId]);
        }

        let orderIndex = 0;
        for (const week of analysis.roadmap || []) {
            for (const task of week.tasks || []) {
                await client.query(
                    `INSERT INTO roadmap_tasks (roadmap_id, week_label, theme, task_text, order_index)
                     VALUES ($1,$2,$3,$4,$5)`,
                    [roadmapId, week.week_label, week.theme, task, orderIndex++]
                );
            }
        }

        // 4. CRITICAL: Update overall score + status to 'ANALYZED' ONLY AT THE END
        await client.query(
            'UPDATE interviews SET overall_score=$1, summary_text=$2, badge_label=$3, vocal_signals=$4, status=$5, top_strengths=$6, key_improvement_areas=$7, analysis_completed_at=NOW() WHERE id=$8',
            [
                analysis.overall_score,
                analysis.summary,
                analysis.badge,
                JSON.stringify(analysis.vocal_signals || null),
                'ANALYZED',
                JSON.stringify(analysis.top_strengths || []),
                JSON.stringify(analysis.key_improvement_areas || []),
                interviewId,
            ]
        );

        await client.query('COMMIT');
        console.log(`[AnalysisWorker] 💎 Transaction committed. Database is now consistent.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[AnalysisWorker] ❌ Transaction rolled back due to error:', err);
        throw err;
    } finally {
        client.release();
    }
}

// ── Job Handlers ────────────────────────────────────────────────

export async function handleAudioAnalysis(job: Job<AnalyzeJobPayload>): Promise<void> {
    const { interviewId, userId } = job.data;
    console.log(`[AnalysisWorker] Processing audio analysis for interview ${interviewId}`);

    try {
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_started_at TIMESTAMPTZ;`);
        await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMPTZ;`);
        
        await db.query("UPDATE interviews SET status = 'ANALYZING', analysis_started_at = NOW() WHERE id = $1", [interviewId]);

        // Fetch interview + media path
        const interviewResult = await db.query('SELECT * FROM interviews WHERE id = $1', [interviewId]);
        const mediaResult = await db.query(
            "SELECT storage_path FROM interview_media WHERE interview_id = $1 AND media_type = 'AUDIO' LIMIT 1",
            [interviewId]
        );
        const storagePath = mediaResult.rows[0]?.storage_path;

        if (!storagePath) {
            throw new Error(`No audio media found for interview ${interviewId}`);
        }

        // Fetch user profile for context
        const profileResult = await db.query(
            'SELECT current_role, target_level FROM onboarding_profiles WHERE user_id = $1',
            [userId]
        );
        const metadata = { ...interviewResult.rows[0], ...profileResult.rows[0] };

        // 1. Generate presigned GET URL for the audio file
        const audioUrl = await getDownloadSignedUrl(storagePath);
        console.log(`[AnalysisWorker] Generated presigned URL for audio`);

        // 2. Call Python AI service with Webhook URL
        const aiServiceUrl = config.aiService.url;
        const backendUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${config.port}`;
        const webhookUrl = `${backendUrl}/interviews/webhook/analyze`;

        console.log(`[AnalysisWorker] Dispatching AI service async task to ${aiServiceUrl}/analyze`);

        const response = await fetch(`${aiServiceUrl}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audio_url: audioUrl,
                interview_id: interviewId,
                webhook_url: webhookUrl,
                metadata: {
                    current_role: metadata.current_role || '',
                    target_level: metadata.target_level || '',
                    company: metadata.company || '',
                    round: metadata.round || '',
                    name: metadata.name || '',
                },
            }),
        });

        console.log(`[AnalysisWorker] AI service dispatched with status: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`AI service returned ${response.status}: ${errorBody}`);
        }

        // Webhook pattern: The AI service returns 202 instantly.
        // We DO NOT await `saveAnalysisResults` here. The DB stays in 'ANALYZING' state.
        console.log(`[AnalysisWorker] 🚀 Audio analysis successfully dispatched. Awaiting Webhook callback.`);
    } catch (err: any) {
        console.error(`[AnalysisWorker] ❌ Audio analysis failed for ${interviewId}:`, err);
        console.error(`[AnalysisWorker] Error details:`, {
            message: err.message,
            code: err.code,
            cause: err.cause,
            stack: err.stack?.substring(0, 500),
        });
        await db.query(
            "UPDATE interviews SET status = 'FAILED', failure_reason = $2 WHERE id = $1",
            [interviewId, err.message || 'Unknown error']
        );
        throw err;
    }
}

export async function handleReconstructionAnalysis(job: Job<ReconstructionAnalyzeJobPayload>): Promise<void> {
    const { interviewId, userId } = job.data;
    console.log(`[AnalysisWorker] Processing reconstruction analysis for interview ${interviewId}`);

    try {
        await db.query("UPDATE interviews SET status = 'ANALYZING' WHERE id = $1", [interviewId]);

        // Fetch reconstruction Q&A
        const questionsResult = await db.query(
            'SELECT * FROM reconstruction_questions WHERE interview_id = $1 ORDER BY question_order',
            [interviewId]
        );

        if (questionsResult.rows.length === 0) {
            throw new Error(`No reconstruction questions found for interview ${interviewId}`);
        }

        // Fetch user profile for context
        const profileResult = await db.query(
            'SELECT current_role, target_level FROM onboarding_profiles WHERE user_id = $1',
            [userId]
        );
        const metadata = profileResult.rows[0] || {};

        // Format QA pairs for AI service
        const qaPairs = questionsResult.rows.map((q: any) => ({
            question_number: q.question_order,
            question: q.question_text,
            answer: q.answer_text,
            follow_ups: q.followup_text ? [q.followup_text] : [],
            follow_up_answers: [],
        }));

        // Call Python AI service for structured reconstruction
        const aiServiceUrl = config.aiService.url;
        const response = await fetch(`${aiServiceUrl}/analyze-reconstruction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interview_id: interviewId,
                qa_pairs: qaPairs,
                metadata: {
                    current_role: metadata.current_role || '',
                    target_level: metadata.target_level || '',
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`AI service returned ${response.status}: ${errorBody}`);
        }

        const analysis = (await response.json()) as AnalysisResult;
        await saveAnalysisResults(interviewId, userId, analysis);

        console.log(`[AnalysisWorker] ✅ Reconstruction analysis complete for interview ${interviewId}`);
    } catch (err: any) {
        console.error(`[AnalysisWorker] ❌ Reconstruction analysis failed for ${interviewId}:`, err);
        await db.query(
            "UPDATE interviews SET status = 'FAILED', failure_reason = $2 WHERE id = $1",
            [interviewId, err.message || 'Unknown error']
        );
        throw err;
    }
}

async function handleSimulationAnalysis(job: Job<SimulationAnalyzeJobPayload>): Promise<void> {
    const { sessionId, userId } = job.data;
    console.log(`[AnalysisWorker] Processing simulation analysis for session ${sessionId}`);

    try {
        // Fetch session + simulation info
        const sessionResult = await db.query(
            `SELECT ss.*, s.title, s.focus_area FROM simulation_sessions ss
             JOIN simulations s ON s.id = ss.simulation_id
             WHERE ss.id = $1`,
            [sessionId]
        );

        if (!sessionResult.rows[0]) {
            throw new Error(`Simulation session not found: ${sessionId}`);
        }

        const session = sessionResult.rows[0];

        // Fetch all answers
        const answersResult = await db.query(
            'SELECT * FROM simulation_answers WHERE session_id = $1 ORDER BY created_at',
            [sessionId]
        );

        if (answersResult.rows.length === 0) {
            throw new Error(`No answers found for simulation session ${sessionId}`);
        }

        // Fetch user profile for context
        const profileResult = await db.query(
            'SELECT current_role, target_level FROM onboarding_profiles WHERE user_id = $1',
            [userId]
        );
        const metadata = profileResult.rows[0] || {};

        // Format Q&A
        const qaBlock = answersResult.rows
            .map((a: any, i: number) => `Q${i + 1}: ${a.question_text}\nA${i + 1}: ${a.answer_text || '(no answer provided)'}`)
            .join('\n\n');

        // Call Python AI service
        const aiServiceUrl = config.aiService.url;
        const response = await fetch(`${aiServiceUrl}/analyze-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `SIMULATION: ${session.title}\n\n${qaBlock}`,
                analysis_type: 'simulation',
                metadata: {
                    current_role: metadata.current_role || '',
                    target_level: metadata.target_level || '',
                },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`AI service returned ${response.status}: ${errorBody}`);
        }

        const analysis = (await response.json()) as AnalysisResult;

        // Save simulation-specific results
        await db.query(
            'UPDATE simulation_sessions SET overall_score = $1, summary_text = $2 WHERE id = $3',
            [analysis.overall_score, analysis.summary, sessionId]
        );

        console.log(`[AnalysisWorker] ✅ Simulation analysis complete for session ${sessionId}`);
    } catch (err) {
        console.error(`[AnalysisWorker] ❌ Simulation analysis failed for session ${sessionId}:`, err);
        throw err;
    }
}

// ── Worker Setup ────────────────────────────────────────────────

export const analysisWorker = new Worker(
    'interview',
    async (job: Job) => {
        switch (job.name) {
            case 'analyze':
                return handleAudioAnalysis(job as Job<AnalyzeJobPayload>);
            case 'analyze-reconstruction':
                return handleReconstructionAnalysis(job as Job<ReconstructionAnalyzeJobPayload>);
            case 'analyze-simulation':
                return handleSimulationAnalysis(job as Job<SimulationAnalyzeJobPayload>);
            default:
                console.warn(`[AnalysisWorker] Unknown job name: ${job.name}`);
        }
    },
    { connection: getRedis()!, concurrency: 2 }
);

analysisWorker.on('completed', (job) =>
    console.log(`[AnalysisWorker] Job ${job.id} (${job.name}) completed`)
);
analysisWorker.on('failed', (job, err) =>
    console.error(`[AnalysisWorker] Job ${job?.id} (${job?.name}) failed:`, err.message)
);
