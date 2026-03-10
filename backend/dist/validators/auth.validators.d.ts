import { z } from 'zod';
export declare const signupSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    full_name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    full_name: string;
}, {
    email: string;
    password: string;
    full_name: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const googleAuthSchema: z.ZodObject<{
    credential: z.ZodString;
}, "strip", z.ZodTypeAny, {
    credential: string;
}, {
    credential: string;
}>;
//# sourceMappingURL=auth.validators.d.ts.map