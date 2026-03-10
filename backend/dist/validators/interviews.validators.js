"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconstructionSchema = exports.mediaUrlSchema = exports.createInterviewSchema = void 0;
const zod_1 = require("zod");
exports.createInterviewSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Interview name is required'),
    company: zod_1.z.string().optional(),
    round: zod_1.z.enum(['SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'OTHER']).optional(),
    interview_type: zod_1.z.enum(['RECORDED', 'RECONSTRUCTED', 'SIMULATION']),
    interviewed_at: zod_1.z.string().datetime().optional(),
});
exports.mediaUrlSchema = zod_1.z.object({
    media_type: zod_1.z.enum(['AUDIO', 'SCREEN']),
    content_type: zod_1.z.string().min(1, 'content_type is required'),
});
const reconstructionQuestionSchema = zod_1.z.object({
    question_text: zod_1.z.string().min(1, 'Question text is required'),
    answer_text: zod_1.z.string().optional(),
    followup_text: zod_1.z.string().optional(),
    confidence_score: zod_1.z.number().int().min(0).max(10).optional(),
});
exports.reconstructionSchema = zod_1.z.object({
    questions: zod_1.z.array(reconstructionQuestionSchema).min(1, 'At least one question is required'),
});
//# sourceMappingURL=interviews.validators.js.map