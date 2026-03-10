"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /gaps – recurring patterns across interviews (WF-20)
router.get('/', async (req, res) => {
    const userId = req.userId;
    try {
        const analyzedCount = await client_1.db.query("SELECT COUNT(*) FROM interviews WHERE user_id = $1 AND status = 'ANALYZED'", [userId]);
        const weaknesses = await client_1.db.query(`SELECT * FROM patterns WHERE user_id = $1 AND pattern_type = 'WEAKNESS'
       ORDER BY occurrence DESC, severity DESC`, [userId]);
        const strengths = await client_1.db.query(`SELECT * FROM patterns WHERE user_id = $1 AND pattern_type = 'STRENGTH'
       ORDER BY occurrence DESC`, [userId]);
        return res.json({
            analyzed_count: parseInt(analyzedCount.rows[0].count),
            weaknesses: weaknesses.rows,
            strengths: strengths.rows,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to load gap analysis' });
    }
});
exports.default = router;
//# sourceMappingURL=gaps.routes.js.map