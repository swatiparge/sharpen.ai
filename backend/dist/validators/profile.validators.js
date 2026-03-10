"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    full_name: zod_1.z.string().min(1, 'Name cannot be empty').optional(),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters').optional(),
}).refine((data) => data.full_name || data.password, {
    message: 'At least one of full_name or password must be provided',
});
//# sourceMappingURL=profile.validators.js.map