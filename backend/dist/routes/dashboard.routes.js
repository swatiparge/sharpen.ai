"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /dashboard – performance trend, skill snapshot, recent interviews, recommendations (WF-19)
router.get('/', async (req, res) => {
    const userId = req.userId;
    try {
        // Recent interviews with scores
        const recentInterviews = await client_1.db.query(`SELECT id, name, company, round, overall_score, badge_label, interviewed_at
       FROM interviews WHERE user_id = $1 AND status = 'ANALYZED'
       ORDER BY interviewed_at DESC LIMIT 5`, [userId]);
        // Performance trend – overall scores vs date
        const trend = await client_1.db.query(`SELECT interviewed_at, overall_score FROM interviews
       WHERE user_id = $1 AND status = 'ANALYZED' AND overall_score IS NOT NULL
       ORDER BY interviewed_at ASC LIMIT 20`, [userId]);
        // Skill snapshot – latest avg score per metric
        const skillSnapshot = await client_1.db.query(`SELECT m.metric_name, ROUND(AVG(m.score)::numeric, 2) as avg_score
       FROM metrics m
       JOIN interviews i ON i.id = m.interview_id
       WHERE i.user_id = $1
       GROUP BY m.metric_name`, [userId]);
        // Top weakness patterns for recommendations
        const topWeakness = await client_1.db.query(`SELECT title, description FROM patterns
       WHERE user_id = $1 AND pattern_type = 'WEAKNESS' AND severity = 'HIGH'
       ORDER BY occurrence DESC LIMIT 1`, [userId]);
        return res.json({
            recent_interviews: recentInterviews.rows,
            trend: trend.rows,
            skill_snapshot: skillSnapshot.rows,
            top_weakness: topWeakness.rows[0] || null,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load dashboard' });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.routes.js.map