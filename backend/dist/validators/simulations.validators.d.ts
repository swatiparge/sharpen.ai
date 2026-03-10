import { z } from 'zod';
export declare const simulationAnswerSchema: z.ZodObject<{
    question_text: z.ZodString;
    answer_text: z.ZodOptional<z.ZodString>;
    content_type: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    question_text: string;
    content_type?: string | undefined;
    answer_text?: string | undefined;
}, {
    question_text: string;
    content_type?: string | undefined;
    answer_text?: string | undefined;
}>;
//# sourceMappingURL=simulations.validators.d.ts.map