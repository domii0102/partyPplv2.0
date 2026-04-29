import * as z from 'zod';

export function calculateAge(birthDate) {

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();

    if (today.getMonth() < birthDate.getMonth()) {
        age -= 1;
    }

    if (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) {
        age -= 1;
    }

    return age;
};

export const profileSchema = z.object({
    email: z.email().nonempty().trim().toLowerCase(),
    nickname: z.string().min(5).max(30).regex(/^[a-zA-Z0-9_]+$/, {
        message: "Nickname can consist of letters, numbers and \"_\" only"
    }),
    name: z.string().min(3).max(20),
    surname: z.string().min(3).max(30),
    dateOfBirth: z.preprocess(
        val => {
            const date = new Date(val);
            return isNaN(date.getTime()) ? undefined : date;
        },
        z.date().refine(date => {
            const age = calculateAge(date);
            return age >= 13 && age <= 100;
        }, {
            message: "Age must be between 13 and 100"
        })
    )
});


