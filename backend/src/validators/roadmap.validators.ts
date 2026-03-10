import { z } from 'zod';

export const updateTaskSchema = z.object({
    is_done: z.boolean(),
});
