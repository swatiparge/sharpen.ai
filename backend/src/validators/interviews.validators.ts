import { z } from 'zod';

export const createInterviewSchema = z.object({
    name: z.string().min(1, 'Interview name is required'),
    company: z.string().optional(),
    round: z.enum(['SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'OTHER']).optional(),
    interview_type: z.enum(['RECORDED', 'RECONSTRUCTED', 'SIMULATION']),
    interviewed_at: z.string().datetime().optional(),
});

export const mediaUrlSchema = z.object({
    media_type: z.enum(['AUDIO', 'SCREEN']),
    content_type: z.string().min(1, 'content_type is required'),
});

const reconstructionQuestionSchema = z.object({
    question_text: z.string().min(1, 'Question text is required'),
    answer_text: z.string().optional(),
    followup_text: z.string().optional(),
    confidence_score: z.number().int().min(0).max(10).optional(),
});

export const reconstructionSchema = z.object({
    questions: z.array(reconstructionQuestionSchema).min(1, 'At least one question is required'),
});
