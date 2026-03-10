"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        console.log('[Auth] No authorization header provided');
        res.status(401).json({ error: 'No authorization header' });
        return;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        console.log('[Auth] No token provided in authorization header');
        res.status(401).json({ error: 'No token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.userId = decoded.userId;
        console.log(`[Auth] Token validated for user: ${decoded.userId}`);
        next();
    }
    catch (err) {
        console.log(`[Auth] Token validation failed: ${err.message}`);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
//# sourceMappingURL=auth.middleware.js.map