import { z } from 'zod';
export declare const onboardingProfileSchema: z.ZodObject<{
    current_role: z.ZodOptional<z.ZodString>;
    years_experience: z.ZodOptional<z.ZodString>;
    current_company: z.ZodOptional<z.ZodString>;
    target_level: z.ZodOptional<z.ZodString>;
    target_companies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    interview_stage: z.ZodOptional<z.ZodString>;
    struggle_areas: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    resume_path: z.ZodOptional<z.ZodString>;
    consent_given: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    onboarding_done: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    consent_given: boolean;
    onboarding_done: boolean;
    current_role?: string | undefined;
    years_experience?: string | undefined;
    current_company?: string | undefined;
    target_level?: string | undefined;
    target_companies?: string[] | undefined;
    interview_stage?: string | undefined;
    struggle_areas?: string[] | undefined;
    resume_path?: string | undefined;
}, {
    current_role?: string | undefined;
    years_experience?: string | undefined;
    current_company?: string | undefined;
    target_level?: string | undefined;
    target_companies?: string[] | undefined;
    interview_stage?: string | undefined;
    struggle_areas?: string[] | undefined;
    resume_path?: string | undefined;
    consent_given?: boolean | undefined;
    onboarding_done?: boolean | undefined;
}>;
//# sourceMappingURL=onboarding.validators.d.ts.map