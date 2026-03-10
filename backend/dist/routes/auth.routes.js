"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
const client_1 = require("../db/client");
const config_1 = require("../config");
const validators_1 = require("../validators");
const auth_validators_1 = require("../validators/auth.validators");
const router = (0, express_1.Router)();
const googleClient = new google_auth_library_1.OAuth2Client(config_1.config.google.clientId);
// POST /auth/google – Google OAuth login/signup
router.post('/google', (0, validators_1.validate)(auth_validators_1.googleAuthSchema), async (req, res) => {
    const { credential } = req.body;
    try {
        // Verify the Google ID token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: config_1.config.google.clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(401).json({ error: 'Invalid Google token' });
        }
        const { sub: googleId, email, name, picture } = payload;
        // Check if user exists (by google_id or email)
        let userResult = await client_1.db.query('SELECT * FROM users WHERE google_id = $1 OR email = $2', [googleId, email]);
        let user = userResult.rows[0];
        if (!user) {
            // Create new user
            const result = await client_1.db.query(`INSERT INTO users (email, full_name, google_id, avatar_url)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, email, full_name, google_id, avatar_url, created_at`, [email, name || email, googleId, picture]);
            user = result.rows[0];
        }
        else if (!user.google_id) {
            // Link Google account to existing email user
            await client_1.db.query('UPDATE users SET google_id = $1, avatar_url = $2, updated_at = NOW() WHERE id = $3', [googleId, picture, user.id]);
            user.google_id = googleId;
            user.avatar_url = picture;
        }
        // Check if onboarding is done
        const onboarding = await client_1.db.query('SELECT onboarding_done FROM onboarding_profiles WHERE user_id = $1', [user.id]);
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        return res.json({
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                avatar_url: user.avatar_url,
            },
            token,
            onboarding_done: onboarding.rows[0]?.onboarding_done || false,
        });
    }
    catch (err) {
        console.error('Google auth error:', err);
        return res.status(401).json({ error: 'Google authentication failed' });
    }
});
// POST /auth/signup (kept as fallback)
router.post('/signup', (0, validators_1.validate)(auth_validators_1.signupSchema), async (req, res) => {
    const { email, password, full_name } = req.body;
    try {
        const existing = await client_1.db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const password_hash = await bcryptjs_1.default.hash(password, 12);
        const result = await client_1.db.query('INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at', [email, password_hash, full_name]);
        const user = result.rows[0];
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        return res.status(201).json({ user, token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during signup' });
    }
});
// POST /auth/login (kept as fallback)
router.post('/login', (0, validators_1.validate)(auth_validators_1.loginSchema), async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await client_1.db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user || !user.password_hash)
            return res.status(401).json({ error: 'Invalid credentials' });
        const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        return res.json({
            user: { id: user.id, email: user.email, full_name: user.full_name },
            token,
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error during login' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map