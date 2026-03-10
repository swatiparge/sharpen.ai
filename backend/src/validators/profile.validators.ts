import { z } from 'zod';

export const updateProfileSchema = z.object({
    full_name: z.string().min(1, 'Name cannot be empty').optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
}).refine((data) => data.full_name || data.password, {
    message: 'At least one of full_name or password must be provided',
});
