import * as z from 'zod';

export const profileSchema = z.object({
    nickname: z.string().min(5).max(30).regex(/^[a-zA-Z0-9]+$/, {
        message: "Nickname can consist of letters and numbers only"
    }),
    name: z.string().min(3).max(20),
    surname: z.string().min(3).max(30),
    dateOfBirth: z.preprocess(val => {
        const date = new Date(val);
        return isNaN(date) ? undefined : date;
    }, z.date())
});