import * as z from "zod";

// Dla zapraszania konkretnych użytkowników
export const inviteUserSchema = z.object({
  receiverIds: z.array(z.string().uuid({ message: "Niepoprawne ID użytkownika" }))
    .min(1, "Musisz wybrać przynajmniej jednego użytkownika"),
  expiresAt: z.string().datetime({ offset: true }).optional().nullable()
});

// Dla generowania linku i zmiany daty
export const expirationSchema = z.object({
  expiresAt: z.string().datetime({ offset: true }).optional().nullable()
});