"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const storage_service_1 = require("../services/storage.service");
const validators_1 = require("../validators");
const onboarding_validators_1 = require("../validators/onboarding.validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// POST /onboarding/profile – create or update onboarding data
router.post('/profile', (0, validators_1.validate)(onboarding_validators_1.onboardingProfileSchema), async (req, res) => {
    const { current_role, years_experience, current_company, target_level, target_companies, interview_stage, struggle_areas, resume_path, consent_given, onboarding_done, } = req.body;
    try {
        // Check if profile already exists
        const existing = await client_1.db.query('SELECT id FROM onboarding_profiles WHERE user_id = $1', [req.userId]);
        let result;
        if (existing.rows.length > 0) {
            // UPDATE existing profile (only set fields that are provided)
            result = await client_1.db.query(`UPDATE onboarding_profiles SET
                    "current_role" = COALESCE($2, "current_role"),
                    years_experience = COALESCE($3, years_experience),
                    current_company = COALESCE($4, current_company),
                    target_level = COALESCE($5, target_level),
                    target_companies = COALESCE($6, target_companies),
                    interview_stage = COALESCE($7, interview_stage),
                    struggle_areas = COALESCE($8, struggle_areas),
                    resume_path = COALESCE($9, resume_path),
                    consent_given = COALESCE($10, consent_given),
                    onboarding_done = COALESCE($11, onboarding_done),
                    updated_at = NOW()
                 WHERE user_id = $1
                 RETURNING *`, [
                req.userId,
                current_role || null,
                years_experience || null,
                current_company || null,
                target_level || null,
                target_companies || null,
                interview_stage || null,
                struggle_areas || null,
                resume_path || null,
                consent_given ?? null,
                onboarding_done ?? null,
            ]);
        }
        else {
            // INSERT new profile — "current_role" is a reserved keyword, must be quoted
            result = await client_1.db.query(`INSERT INTO onboarding_profiles
                    (user_id, "current_role", years_experience, current_company, target_level,
                     target_companies, interview_stage, struggle_areas, resume_path,
                     consent_given, onboarding_done)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                 RETURNING *`, [
                req.userId,
                current_role || null,
                years_experience || null,
                current_company || null,
                target_level || null,
                target_companies || null,
                interview_stage || null,
                struggle_areas || null,
                resume_path || null,
                consent_given ?? false,
                onboarding_done ?? false,
            ]);
        }
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error('Onboarding save error:', err.message, err.code, err.detail);
        return res.status(500).json({
            error: 'Failed to save onboarding profile',
            debug: { message: err.message, code: err.code, detail: err.detail }
        });
    }
});
// GET /onboarding/profile
router.get('/profile', async (req, res) => {
    const result = await client_1.db.query('SELECT * FROM onboarding_profiles WHERE user_id = $1', [req.userId]);
    return res.json(result.rows[0] || null);
});
// POST /onboarding/resume-url – get pre-signed S3 upload URL for resume
router.post('/resume-url', async (req, res) => {
    const { content_type } = req.body;
    if (!content_type) {
        return res.status(400).json({ error: 'content_type is required' });
    }
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(content_type)) {
        return res.status(400).json({ error: 'Only PDF and DOCX files are supported' });
    }
    try {
        const ext = content_type === 'application/pdf' ? 'pdf' : 'docx';
        const storageKey = `resumes/${req.userId}/${(0, uuid_1.v4)()}.${ext}`;
        const uploadUrl = await (0, storage_service_1.getUploadSignedUrl)(storageKey, content_type);
        return res.json({ upload_url: uploadUrl, storage_key: storageKey });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
});
exports.default = router;
//# sourceMappingURL=onboarding.routes.js.map