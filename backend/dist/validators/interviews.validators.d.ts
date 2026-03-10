import { z } from 'zod';
export declare const createInterviewSchema: z.ZodObject<{
    name: z.ZodString;
    company: z.ZodOptional<z.ZodString>;
    round: z.ZodOptional<z.ZodEnum<["SCREEN", "TECHNICAL", "SYSTEM_DESIGN", "BEHAVIORAL", "OTHER"]>>;
    interview_type: z.ZodEnum<["RECORDED", "RECONSTRUCTED", "SIMULATION"]>;
    interviewed_at: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    interview_type: "RECORDED" | "RECONSTRUCTED" | "SIMULATION";
    company?: string | undefined;
    round?: "SCREEN" | "TECHNICAL" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "OTHER" | undefined;
    interviewed_at?: string | undefined;
}, {
    name: string;
    interview_type: "RECORDED" | "RECONSTRUCTED" | "SIMULATION";
    company?: string | undefined;
    round?: "SCREEN" | "TECHNICAL" | "SYSTEM_DESIGN" | "BEHAVIORAL" | "OTHER" | undefined;
    interviewed_at?: string | undefined;
}>;
export declare const mediaUrlSchema: z.ZodObject<{
    media_type: z.ZodEnum<["AUDIO", "SCREEN"]>;
    content_type: z.ZodString;
}, "strip", z.ZodTypeAny, {
    content_type: string;
    media_type: "SCREEN" | "AUDIO";
}, {
    content_type: string;
    media_type: "SCREEN" | "AUDIO";
}>;
export declare const reconstructionSchema: z.ZodObject<{
    questions: z.ZodArray<z.ZodObject<{
        question_text: z.ZodString;
        answer_text: z.ZodOptional<z.ZodString>;
        followup_text: z.ZodOptional<z.ZodString>;
        confidence_score: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        question_text: string;
        answer_text?: string | undefined;
        followup_text?: string | undefined;
        confidence_score?: number | undefined;
    }, {
        question_text: string;
        answer_text?: string | undefined;
        followup_text?: string | undefined;
        confidence_score?: number | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    questions: {
        question_text: string;
        answer_text?: string | undefined;
        followup_text?: string | undefined;
        confidence_score?: number | undefined;
    }[];
}, {
    questions: {
        question_text: string;
        answer_text?: string | undefined;
        followup_text?: string | undefined;
        confidence_score?: number | undefined;
    }[];
}>;
//# sourceMappingURL=interviews.validators.d.ts.map