import { Router, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// GET /gaps – recurring patterns across interviews (WF-20)
router.get('/', async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    try {
        const analyzedCount = await db.query(
            "SELECT COUNT(*) FROM interviews WHERE user_id = $1 AND status = 'ANALYZED'",
            [userId]
        );

        const weaknesses = await db.query(
            `SELECT * FROM patterns WHERE user_id = $1 AND pattern_type = 'WEAKNESS'
       ORDER BY occurrence DESC, severity DESC`,
            [userId]
        );

        const strengths = await db.query(
            `SELECT * FROM patterns WHERE user_id = $1 AND pattern_type = 'STRENGTH'
       ORDER BY occurrence DESC`,
            [userId]
        );

        return res.json({
            analyzed_count: parseInt(analyzedCount.rows[0].count),
            weaknesses: weaknesses.rows,
            strengths: strengths.rows,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load gap analysis' });
    }
});

export default router;
