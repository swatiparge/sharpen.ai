"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const storage_service_1 = require("../services/storage.service");
const config_1 = require("../config");
const queues_1 = require("../workers/queues");
const validators_1 = require("../validators");
const interviews_validators_1 = require("../validators/interviews.validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// POST /interviews – create interview + metadata
router.post('/', (0, validators_1.validate)(interviews_validators_1.createInterviewSchema), async (req, res) => {
    const { name, company, round, interview_type, interviewed_at } = req.body;
    if (!name || !interview_type) {
        return res.status(400).json({ error: 'name and interview_type are required' });
    }
    try {
        const result = await client_1.db.query(`INSERT INTO interviews (user_id, name, company, round, interview_type, interviewed_at)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [req.userId, name, company, round, interview_type, interviewed_at || new Date()]);
        return res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create interview' });
    }
});
// GET /interviews – list all interviews for user
router.get('/', async (req, res) => {
    const result = await client_1.db.query('SELECT * FROM interviews WHERE user_id = $1 ORDER BY interviewed_at DESC', [req.userId]);
    return res.json(result.rows);
});
// GET /interviews/:id – interview with metrics
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const interview = await client_1.db.query('SELECT * FROM interviews WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (!interview.rows[0])
        return res.status(404).json({ error: 'Interview not found' });
    const metrics = await client_1.db.query('SELECT * FROM metrics WHERE interview_id = $1', [id]);
    return res.json({ ...interview.rows[0], metrics: metrics.rows });
});
// POST /interviews/:id/media-url – get signed S3 upload URL
router.post('/:id/media-url', (0, validators_1.validate)(interviews_validators_1.mediaUrlSchema), async (req, res) => {
    const { id } = req.params;
    const { media_type, content_type } = req.body; // media_type: 'AUDIO' | 'SCREEN'
    if (!media_type || !content_type) {
        return res.status(400).json({ error: 'media_type and content_type required' });
    }
    try {
        const storageKey = `interviews/${req.userId}/${id}/${(0, uuid_1.v4)()}-${media_type.toLowerCase()}`;
        const uploadUrl = await (0, storage_service_1.getUploadSignedUrl)(storageKey, content_type);
        // Save media record
        await client_1.db.query('INSERT INTO interview_media (interview_id, media_type, storage_path) VALUES ($1,$2,$3)', [id, media_type, storageKey]);
        return res.json({ upload_url: uploadUrl, storage_key: storageKey });
    }
    catch (err) {
        console.error('Failed to generate upload URL:', err?.message || err);
        console.error('S3 Config:', {
            endpoint: config_1.config.aws.endpoint,
            region: config_1.config.aws.region,
            bucket: config_1.config.aws.bucketName,
            hasAccessKey: !!config_1.config.aws.accessKeyId,
            hasSecretKey: !!config_1.config.aws.secretAccessKey,
        });
        return res.status(500).json({ error: 'Failed to generate upload URL', details: err?.message });
    }
});
// POST /interviews/:id/analyze – trigger transcription + analysis pipeline
router.post('/:id/analyze', async (req, res) => {
    const { id } = req.params;
    try {
        console.log(`[Analyze] Starting analysis for interview ${id}, user ${req.userId}`);
        const interview = await client_1.db.query('SELECT * FROM interviews WHERE id = $1 AND user_id = $2', [id, req.userId]);
        if (!interview.rows[0])
            return res.status(404).json({ error: 'Interview not found' });
        const interviewType = interview.rows[0].interview_type;
        console.log(`[Analyze] Interview type: ${interviewType}`);
        await client_1.db.query("UPDATE interviews SET status = 'ANALYZING' WHERE id = $1", [id]);
        if (interviewType === 'RECONSTRUCTED') {
            // Text-based analysis for reconstructed interviews (fire-and-forget)
            console.log(`[Analyze] Queuing text-based analysis`);
            queues_1.interviewQueue.add('analyze-reconstruction', {
                interviewId: id,
                userId: req.userId,
            }).catch(err => console.error('[Analyze] Queue add failed:', err));
        }
        else {
            // Audio-based analysis for recorded interviews
            const media = await client_1.db.query("SELECT * FROM interview_media WHERE interview_id = $1 AND media_type = 'AUDIO' LIMIT 1", [id]);
            const mediaPath = media.rows[0]?.storage_path;
            console.log(`[Analyze] Media path: ${mediaPath || 'NOT FOUND'}`);
            if (!mediaPath) {
                console.error(`[Analyze] No audio media found for interview ${id}`);
                await client_1.db.query("UPDATE interviews SET status = 'FAILED', failure_reason = 'No audio file found' WHERE id = $1", [id]);
                return res.status(400).json({ error: 'No audio file found for this interview' });
            }
            // Fire-and-forget — analysis runs in background
            console.log(`[Analyze] Queuing audio analysis`);
            queues_1.interviewQueue.add('analyze', {
                interviewId: id,
                userId: req.userId,
                mediaUrl: mediaPath,
            }).catch(err => console.error('[Analyze] Queue add failed:', err));
        }
        return res.json({ message: 'Analysis pipeline started', status: 'ANALYZING' });
    }
    catch (err) {
        console.error('[Analyze] Error:', err);
        return res.status(500).json({ error: 'Failed to start analysis', details: err.message });
    }
});
// GET /interviews/:id/transcript – full transcript with segments
router.get('/:id/transcript', async (req, res) => {
    const { id } = req.params;
    const ownership = await client_1.db.query('SELECT id FROM interviews WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (!ownership.rows[0])
        return res.status(404).json({ error: 'Not found' });
    const transcript = await client_1.db.query('SELECT * FROM transcripts WHERE interview_id = $1', [id]);
    const segments = await client_1.db.query('SELECT * FROM transcript_segments WHERE interview_id = $1 ORDER BY segment_order', [id]);
    return res.json({ transcript: transcript.rows[0], segments: segments.rows });
});
// GET /interviews/:id/metrics/:metricName – metric detail (WF-17)
router.get('/:id/metrics/:metricName', async (req, res) => {
    const { id, metricName } = req.params;
    const metric = await client_1.db.query('SELECT * FROM metrics WHERE interview_id = $1 AND metric_name = $2', [id, metricName]);
    if (!metric.rows[0])
        return res.status(404).json({ error: 'Metric not found' });
    const examples = await client_1.db.query('SELECT me.*, ts.text as segment_text, ts.speaker FROM metric_examples me LEFT JOIN transcript_segments ts ON ts.id = me.segment_id WHERE me.metric_id = $1', [metric.rows[0].id]);
    return res.json({ ...metric.rows[0], examples: examples.rows });
});
// POST /interviews/:id/reconstruction – save reconstructed Q&A (WF-13, WF-14)
router.post('/:id/reconstruction', (0, validators_1.validate)(interviews_validators_1.reconstructionSchema), async (req, res) => {
    const { id } = req.params;
    const { questions } = req.body; // Array of question objects
    if (!Array.isArray(questions)) {
        return res.status(400).json({ error: 'questions must be an array' });
    }
    try {
        // Delete existing reconstruction questions and re-insert
        await client_1.db.query('DELETE FROM reconstruction_questions WHERE interview_id = $1', [id]);
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            await client_1.db.query(`INSERT INTO reconstruction_questions
          (interview_id, question_order, question_text, answer_text, followup_text, confidence_score)
         VALUES ($1,$2,$3,$4,$5,$6)`, [id, i + 1, q.question_text, q.answer_text, q.followup_text, q.confidence_score]);
        }
        return res.json({ message: 'Reconstruction saved', count: questions.length });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save reconstruction' });
    }
});
exports.default = router;
//# sourceMappingURL=interviews.routes.js.map