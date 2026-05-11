import * as z from 'zod';

export const createPostSchema = z.object({
    textContent: z.string().min(1).max(512),
    images: z.array(z.object({
        url: z.string().url(),
        publicId: z.string()
    })).optional()
});

export const editPostSchema = z.object({
    textContent: z.string().min(1).max(512).optional(),
    images: z.array(z.object({
        url: z.string().url(),
        publicId: z.string()
    })).optional()
});