import { z } from 'zod';

export const onboardingProfileSchema = z.object({
    current_role: z.string().optional(),
    years_experience: z.string().optional(),
    current_company: z.string().optional(),
    target_level: z.string().optional(),
    target_companies: z.array(z.string()).optional(),
    interview_stage: z.string().optional(),
    struggle_areas: z.array(z.string()).optional(),
    resume_path: z.string().optional(),
    consent_given: z.boolean().optional().default(false),
    onboarding_done: z.boolean().optional().default(false),
});
