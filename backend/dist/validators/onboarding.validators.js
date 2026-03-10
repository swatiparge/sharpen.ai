"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onboardingProfileSchema = void 0;
const zod_1 = require("zod");
exports.onboardingProfileSchema = zod_1.z.object({
    current_role: zod_1.z.string().optional(),
    years_experience: zod_1.z.string().optional(),
    current_company: zod_1.z.string().optional(),
    target_level: zod_1.z.string().optional(),
    target_companies: zod_1.z.array(zod_1.z.string()).optional(),
    interview_stage: zod_1.z.string().optional(),
    struggle_areas: zod_1.z.array(zod_1.z.string()).optional(),
    resume_path: zod_1.z.string().optional(),
    consent_given: zod_1.z.boolean().optional().default(false),
    onboarding_done: zod_1.z.boolean().optional().default(false),
});
//# sourceMappingURL=onboarding.validators.js.map