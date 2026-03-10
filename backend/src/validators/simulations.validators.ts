import { z } from 'zod';

export const simulationAnswerSchema = z.object({
    question_text: z.string().min(1, 'Question text is required'),
    answer_text: z.string().optional(),
    content_type: z.string().optional(),
});
