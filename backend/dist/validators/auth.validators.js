"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuthSchema = exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
    full_name: zod_1.z.string().min(1, 'Full name is required'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.googleAuthSchema = zod_1.z.object({
    credential: zod_1.z.string().min(1, 'Google credential is required'),
});
//# sourceMappingURL=auth.validators.js.map