"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulationAnswerSchema = void 0;
const zod_1 = require("zod");
exports.simulationAnswerSchema = zod_1.z.object({
    question_text: zod_1.z.string().min(1, 'Question text is required'),
    answer_text: zod_1.z.string().optional(),
    content_type: zod_1.z.string().optional(),
});
//# sourceMappingURL=simulations.validators.js.map