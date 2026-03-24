import { Router, Response } from 'express';
import { db } from '../db/client';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /usage/analytics
 * Returns a summary of user activity:
 * - Total users logged in (with last_login_at)
 * - Total audio analysis time used per user
 */
router.get('/analytics', async (req: AuthRequest, res: Response) => {
    try {
        // 1. User Login Analytics
        const userStats = await db.query(`
            SELECT 
                full_name, 
                email, 
                last_login_at, 
                created_at 
            FROM users 
            ORDER BY last_login_at DESC NULLS LAST
        `);

        // 2. Audio Analysis Usage per User
        // Sum of duration_secs from interview_media
        const usageStats = await db.query(`
            SELECT 
                u.full_name,
                u.email,
                COUNT(i.id) as total_interviews,
                COALESCE(SUM(m.duration_secs), 0) as total_audio_seconds,
                COALESCE(AVG(EXTRACT(EPOCH FROM (i.analysis_completed_at - i.analysis_started_at))), 0) as avg_analysis_latency_seconds
            FROM users u
            LEFT JOIN interviews i ON i.user_id = u.id
            LEFT JOIN interview_media m ON m.interview_id = i.id AND m.media_type = 'AUDIO'
            GROUP BY u.id, u.full_name, u.email
            ORDER BY total_audio_seconds DESC
        `);

        return res.json({
            users_activity: userStats.rows,
            usage_by_user: usageStats.rows.map(row => ({
                ...row,
                total_audio_minutes: Math.round(row.total_audio_seconds / 60 * 10) / 10,
                avg_analysis_latency_seconds: Math.round(row.avg_analysis_latency_seconds * 10) / 10
            }))
        });
    } catch (err) {
        console.error('[UsageAnalytics] Error:', err);
        return res.status(500).json({ error: 'Failed to fetch usage analytics' });
    }
});

export default router;
