import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getUploadSignedUrl } from '../services/storage.service';
import { interviewQueue } from '../workers/queues';
import { validate } from '../validators';
import { simulationAnswerSchema } from '../validators/simulations.validators';

const router = Router();
router.use(authMiddleware);

// GET /simulations – list system simulations (recommended + all) (WF-22)
router.get('/', async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    try {
        // Get user's target role to filter recommendations
        const profile = await db.query(
            'SELECT current_role FROM onboarding_profiles WHERE user_id = $1',
            [userId]
        );
        const role = profile.rows[0]?.current_role;

        const all = await db.query('SELECT * FROM simulations WHERE is_system = true ORDER BY created_at DESC');
        const recommended = role
            ? all.rows.filter((s) => s.role === role || !s.role)
            : all.rows.slice(0, 3);

        return res.json({ recommended, all: all.rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load simulations' });
    }
});

// POST /simulations/:id/start – start a simulation session (WF-23)
router.post('/:id/start', async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const simulation = await db.query('SELECT * FROM simulations WHERE id = $1', [id]);
        if (!simulation.rows[0]) return res.status(404).json({ error: 'Simulation not found' });

        const session = await db.query(
            `INSERT INTO simulation_sessions (user_id, simulation_id, status)
       VALUES ($1, $2, 'IN_PROGRESS') RETURNING *`,
            [req.userId, id]
        );
        return res.status(201).json({ session: session.rows[0], simulation: simulation.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to start simulation' });
    }
});

// POST /simulations/sessions/:sessionId/answer – submit an answer
router.post('/sessions/:sessionId/answer', validate(simulationAnswerSchema), async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.params;
    const { question_text, answer_text, content_type } = req.body;
    try {
        let audioPath: string | undefined;
        let uploadUrl: string | undefined;

        if (content_type) {
            // Audio answer – generate upload URL
            audioPath = `simulations/${req.userId}/${sessionId}/${uuidv4()}.webm`;
            uploadUrl = await getUploadSignedUrl(audioPath, content_type);
        }

        const answer = await db.query(
            `INSERT INTO simulation_answers (session_id, question_text, answer_text, audio_path)
       VALUES ($1,$2,$3,$4) RETURNING *`,
            [sessionId, question_text, answer_text, audioPath]
        );
        return res.status(201).json({ answer: answer.rows[0], upload_url: uploadUrl });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to submit answer' });
    }
});

// POST /simulations/sessions/:sessionId/complete – submit simulation for analysis (WF-24)
router.post('/sessions/:sessionId/complete', async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.params;
    try {
        const result = await db.query(
            `UPDATE simulation_sessions SET status = 'COMPLETED', completed_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
            [sessionId, req.userId]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'Session not found' });

        // Enqueue simulation analysis
        await interviewQueue.add('analyze-simulation', {
            sessionId,
            userId: req.userId,
        });

        return res.json({ message: 'Simulation completed, analysis started', session: result.rows[0] });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to complete simulation' });
    }
});

// PATCH /simulations/answers/:answerId/save – mark answer as saved to library
router.patch('/answers/:answerId/save', async (req: AuthRequest, res: Response) => {
    const { answerId } = req.params;
    const result = await db.query(
        'UPDATE simulation_answers SET is_saved = true WHERE id = $1 RETURNING *',
        [answerId]
    );
    return res.json(result.rows[0]);
});

export default router;
