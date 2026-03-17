import * as z from 'zod';

export const emailVerificationSchema = z.object({
    email: z.email().nonempty().trim().toLowerCase(),
    token: z.string().min(6)
});


// Lowkey nie widze sensu robic 5 plików schematów do weryfikcji
// wiec wszystkie bedą tutaj, chyba ze nie moga
// to porobie w osobnych :(

export const emailVerificationResendSchema = z.object({
    email: z.email().nonempty().trim().toLowerCase(),
});

export const passwordChangeSchema = z.object({
    email: z.email().nonempty().trim().toLowerCase(),
    token: z.string().length(6),
    password: z.string().min(6)
});

export const VerifyEmailSchema = z.object({
    token: z.string().length(6)
});