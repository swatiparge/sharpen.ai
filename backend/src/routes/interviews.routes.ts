import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getUploadSignedUrl } from '../services/storage.service';
import { config } from '../config';
import { interviewQueue } from '../workers/queues';
import { validate } from '../validators';
import { createInterviewSchema, mediaUrlSchema, reconstructionSchema } from '../validators/interviews.validators';
import { saveAnalysisResults } from '../workers/analysis.worker';

const router = Router();
router.use(authMiddleware);

// POST /interviews – create interview + metadata
router.post('/', validate(createInterviewSchema), async (req: AuthRequest, res: Response) => {
    const { name, company, round, interview_type, interviewed_at } = req.body;
    if (!name || !interview_type) {
        return res.status(400).json({ error: 'name and interview_type are required' });
    }
    try {
        const result = await db.query(
            `INSERT INTO interviews (user_id, name, company, round, interview_type, interviewed_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
            [req.userId, name, company, round, interview_type, interviewed_at || new Date()]
        );
        return res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create interview' });
    }
});

// GET /interviews – list all interviews for user
router.get('/', async (req: AuthRequest, res: Response) => {
    const result = await db.query(
        'SELECT * FROM interviews WHERE user_id = $1 ORDER BY interviewed_at DESC',
        [req.userId]
    );
    return res.json(result.rows);
});

// GET /interviews/:id – interview with metrics + calibration context
router.get('/:id', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const interview = await db.query(
        'SELECT * FROM interviews WHERE id = $1 AND user_id = $2',
        [id, req.userId]
    );
    if (!interview.rows[0]) return res.status(404).json({ error: 'Interview not found' });

    const metrics = await db.query(
        'SELECT * FROM metrics WHERE interview_id = $1',
        [id]
    );

    // Fetch experience level for calibration badge
    const profile = await db.query(
        'SELECT target_level FROM onboarding_profiles WHERE user_id = $1',
        [req.userId]
    );
    const experienceLevel = profile.rows[0]?.target_level || null;

    console.log(`[API] Returning interview ${id}. Metrics count: ${metrics.rows.length}`);
    if (metrics.rows.length > 0) {
        console.log(`[API] Metrics: ${metrics.rows.map(m => m.metric_name).join(', ')}`);
    }

    return res.json({ ...interview.rows[0], metrics: metrics.rows, experience_level: experienceLevel });
});

// POST /interviews/:id/media-url – get signed S3 upload URL
router.post('/:id/media-url', validate(mediaUrlSchema), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { media_type, content_type } = req.body; // media_type: 'AUDIO' | 'SCREEN'
    if (!media_type || !content_type) {
        return res.status(400).json({ error: 'media_type and content_type required' });
    }
    try {
        const storageKey = `interviews/${req.userId}/${id}/${uuidv4()}-${media_type.toLowerCase()}`;
        const uploadUrl = await getUploadSignedUrl(storageKey, content_type);

        // Save media record
        await db.query(
            'INSERT INTO interview_media (interview_id, media_type, storage_path) VALUES ($1,$2,$3)',
            [id, media_type, storageKey]
        );
        return res.json({ upload_url: uploadUrl, storage_key: storageKey });
    } catch (err: any) {
        console.error('Failed to generate upload URL:', err?.message || err);
        console.error('S3 Config:', {
            endpoint: config.aws.endpoint,
            region: config.aws.region,
            bucket: config.aws.bucketName,
            hasAccessKey: !!config.aws.accessKeyId,
            hasSecretKey: !!config.aws.secretAccessKey,
        });
        return res.status(500).json({ error: 'Failed to generate upload URL', details: err?.message });
    }
});

// POST /interviews/:id/analyze – trigger transcription + analysis pipeline
router.post('/:id/analyze', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    console.log(`[Analyze] Starting analysis for interview ${id}, user ${req.userId}`);
    
    const interview = await db.query(
      'SELECT * FROM interviews WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (!interview.rows[0]) return res.status(404).json({ error: 'Interview not found' });

    const interviewType = interview.rows[0].interview_type;
    console.log(`[Analyze] Interview type: ${interviewType}`);

    await db.query("UPDATE interviews SET status = 'ANALYZING' WHERE id = $1", [id]);

    if (interviewType === 'RECONSTRUCTED') {
      // Text-based analysis for reconstructed interviews (fire-and-forget)
      console.log(`[Analyze] Queuing text-based analysis`);
      interviewQueue.add('analyze-reconstruction', {
        interviewId: id,
        userId: req.userId,
      }).catch(err => console.error('[Analyze] Queue add failed:', err));
    } else {
      // Audio-based analysis for recorded interviews
      const media = await db.query(
        "SELECT * FROM interview_media WHERE interview_id = $1 AND media_type = 'AUDIO' LIMIT 1",
        [id]
      );
      const mediaPath = media.rows[0]?.storage_path;
      console.log(`[Analyze] Media path: ${mediaPath || 'NOT FOUND'}`);

      if (!mediaPath) {
        console.error(`[Analyze] No audio media found for interview ${id}`);
        await db.query(
          "UPDATE interviews SET status = 'FAILED', failure_reason = 'No audio file found' WHERE id = $1",
          [id]
        );
        return res.status(400).json({ error: 'No audio file found for this interview' });
      }

      // Fire-and-forget — analysis runs in background
      console.log(`[Analyze] Queuing audio analysis`);
      interviewQueue.add('analyze', {
        interviewId: id,
        userId: req.userId,
        mediaUrl: mediaPath,
      }).catch(err => console.error('[Analyze] Queue add failed:', err));
    }

    return res.json({ message: 'Analysis pipeline started', status: 'ANALYZING' });
  } catch (err: any) {
    console.error('[Analyze] Error:', err);
    return res.status(500).json({ error: 'Failed to start analysis', details: err.message });
  }
});

// GET /interviews/:id/transcript – full transcript with segments
router.get('/:id/transcript', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const ownership = await db.query(
        'SELECT id FROM interviews WHERE id = $1 AND user_id = $2',
        [id, req.userId]
    );
    if (!ownership.rows[0]) return res.status(404).json({ error: 'Not found' });

    const transcript = await db.query('SELECT * FROM transcripts WHERE interview_id = $1', [id]);
    const segments = await db.query(
        'SELECT * FROM transcript_segments WHERE interview_id = $1 ORDER BY segment_order',
        [id]
    );
    return res.json({ transcript: transcript.rows[0], segments: segments.rows });
});

// GET /interviews/:id/metrics/:metricName – metric detail (WF-17)
router.get('/:id/metrics/:metricName', async (req: AuthRequest, res: Response) => {
    const { id, metricName } = req.params;
    const metric = await db.query(
        'SELECT * FROM metrics WHERE interview_id = $1 AND metric_name = $2',
        [id, metricName]
    );
    if (!metric.rows[0]) return res.status(404).json({ error: 'Metric not found' });

    const examples = await db.query(
        'SELECT me.*, ts.text as segment_text, ts.speaker FROM metric_examples me LEFT JOIN transcript_segments ts ON ts.id = me.segment_id WHERE me.metric_id = $1',
        [metric.rows[0].id]
    );
    return res.json({ ...metric.rows[0], examples: examples.rows });
});

// POST /interviews/:id/reconstruction – save reconstructed Q&A (WF-13, WF-14)
router.post('/:id/reconstruction', validate(reconstructionSchema), async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { questions } = req.body; // Array of question objects
    if (!Array.isArray(questions)) {
        return res.status(400).json({ error: 'questions must be an array' });
    }
    try {
        const ownership = await db.query('SELECT id FROM interviews WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (!ownership.rows[0]) return res.status(403).json({ error: 'Forbidden access to this interview' });

        // Delete existing reconstruction questions and re-insert as batch
        await db.query('DELETE FROM reconstruction_questions WHERE interview_id = $1', [id]);
        
        if (questions.length > 0) {
            const values: any[] = [];
            const placeholders = questions.map((q: any, i: number) => {
                const offset = i * 6;
                values.push(id, i + 1, q.question_text, q.answer_text, q.followup_text || null, q.confidence_score || null);
                return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6})`;
            }).join(', ');

            await db.query(
                `INSERT INTO reconstruction_questions (interview_id, question_order, question_text, answer_text, followup_text, confidence_score) VALUES ${placeholders}`,
                values
            );
        }

        return res.json({ message: 'Reconstruction saved', count: questions.length });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save reconstruction' });
    }
});

// POST /interviews/:id/metrics/:metricName/feedback – user-feedback on scoring (trust building)
router.post('/:id/metrics/:metricName/feedback', async (req: AuthRequest, res: Response) => {
    const { id, metricName } = req.params;
    const { feedback_type, user_score, comment } = req.body; // feedback_type: 'AGREE' | 'DISAGREE'

    try {
        const ownership = await db.query('SELECT id FROM interviews WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (!ownership.rows[0]) return res.status(403).json({ error: 'Forbidden access to this interview' });

        // Find the metric
        const metric = await db.query(
            'SELECT id FROM metrics WHERE interview_id = $1 AND metric_name = $2',
            [id, metricName]
        );
        if (!metric.rows[0]) return res.status(404).json({ error: 'Metric not found' });

        await db.query(
            'INSERT INTO metric_feedback (metric_id, user_id, feedback_type, user_score, comment) VALUES ($1, $2, $3, $4, $5)',
            [metric.rows[0].id, req.userId, feedback_type, user_score, comment]
        );

        return res.json({ message: 'Feedback saved' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save feedback' });
    }
});

export default router;
