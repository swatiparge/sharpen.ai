"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("../db/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validators_1 = require("../validators");
const profile_validators_1 = require("../validators/profile.validators");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// GET /profile
router.get('/', async (req, res) => {
    const result = await client_1.db.query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0])
        return res.status(404).json({ error: 'User not found' });
    return res.json(result.rows[0]);
});
// PUT /profile – update name or password
router.put('/', (0, validators_1.validate)(profile_validators_1.updateProfileSchema), async (req, res) => {
    const { full_name, password } = req.body;
    try {
        if (password) {
            const hash = await bcryptjs_1.default.hash(password, 12);
            await client_1.db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
                hash,
                req.userId,
            ]);
        }
        if (full_name) {
            await client_1.db.query('UPDATE users SET full_name = $1, updated_at = NOW() WHERE id = $2', [
                full_name,
                req.userId,
            ]);
        }
        const result = await client_1.db.query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [req.userId]);
        return res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});
// DELETE /profile – account deletion
router.delete('/', async (req, res) => {
    try {
        await client_1.db.query('DELETE FROM users WHERE id = $1', [req.userId]);
        return res.json({ message: 'Account deleted successfully' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to delete account' });
    }
});
exports.default = router;
//# sourceMappingURL=profile.routes.js.map