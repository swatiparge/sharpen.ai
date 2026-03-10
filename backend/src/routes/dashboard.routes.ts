import { Router, Response } from 'express';
import { db } from '../db/client';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authMiddleware);

// GET /dashboard – performance trend, skill snapshot, recent interviews, recommendations (WF-19)
router.get('/', async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    try {
        // Recent interviews with scores
        const recentInterviews = await db.query(
            `SELECT id, name, company, round, overall_score, badge_label, interviewed_at
       FROM interviews WHERE user_id = $1 AND status = 'ANALYZED'
       ORDER BY interviewed_at DESC LIMIT 5`,
            [userId]
        );

        // Performance trend – overall scores vs date
        const trend = await db.query(
            `SELECT interviewed_at, overall_score FROM interviews
       WHERE user_id = $1 AND status = 'ANALYZED' AND overall_score IS NOT NULL
       ORDER BY interviewed_at ASC LIMIT 20`,
            [userId]
        );

        // Skill snapshot – latest avg score per metric
        const skillSnapshot = await db.query(
            `SELECT m.metric_name, ROUND(AVG(m.score)::numeric, 2) as avg_score
       FROM metrics m
       JOIN interviews i ON i.id = m.interview_id
       WHERE i.user_id = $1
       GROUP BY m.metric_name`,
            [userId]
        );

        // Top weakness patterns for recommendations
        const topWeakness = await db.query(
            `SELECT title, description FROM patterns
       WHERE user_id = $1 AND pattern_type = 'WEAKNESS' AND severity = 'HIGH'
       ORDER BY occurrence DESC LIMIT 1`,
            [userId]
        );

        return res.json({
            recent_interviews: recentInterviews.rows,
            trend: trend.rows,
            skill_snapshot: skillSnapshot.rows,
            top_weakness: topWeakness.rows[0] || null,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load dashboard' });
    }
});

export default router;
