import * as z from 'zod';

export const createCommentSchema = z.object({
    textContent: z.string().min(1).max(512)
});