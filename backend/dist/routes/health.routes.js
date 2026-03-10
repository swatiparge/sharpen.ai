"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../config");
const router = (0, express_1.Router)();
// Health check for AI service connectivity
router.get('/ai-service', async (req, res) => {
    try {
        console.log('[Health] Checking AI service health...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${config_1.config.aiService.url}/health`, {
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
            return res.status(503).json({
                status: 'unhealthy',
                error: `AI service returned ${response.status}`,
                url: config_1.config.aiService.url,
            });
        }
        const data = await response.json();
        return res.json({
            status: 'healthy',
            aiService: data,
            url: config_1.config.aiService.url,
        });
    }
    catch (err) {
        console.error('[Health] AI service check failed:', err.message);
        return res.status(503).json({
            status: 'unhealthy',
            error: err.message || 'Cannot connect to AI service',
            url: config_1.config.aiService.url,
            code: err.code,
        });
    }
});
// Test endpoint to verify backend auth
router.get('/auth', async (req, res) => {
    return res.json({
        status: 'authenticated',
        userId: req.userId,
        message: 'Token is valid',
    });
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map