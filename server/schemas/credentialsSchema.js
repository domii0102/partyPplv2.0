import * as z from 'zod';

export const credentialsSchema = z.object({
    email: z.email().nonempty().trim().toLowerCase(),
    password: z.string().min(6)
});

export const emailSchema = z.object({ email: z.email().nonempty().trim().toLowerCase() });