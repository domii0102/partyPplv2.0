import * as z from 'zod';

export const eventSchema = z.object({
    eventName: z.string().trim().min(5).max(128),
    description: z.string().trim().min(8).max(512),
    isPublic: z.preprocess(val => {
        if (typeof val === "string") {
            return val.toLowerCase() === "true";
        }
        return Boolean(val);
    }, z.boolean()),
    eventDateTime: z.iso.datetime({ offset: true }),
    endDateTime: z.preprocess(
        val => {
            if (val === "" || val === null) return undefined;
            return val;
        },
        z.iso.datetime({ offset: true }).optional()
    ),
    locationLatitude: z.preprocess(val => {
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.number().gte(-90).lte(90).optional()),
    locationLongitude: z.preprocess(val => {
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.number().gte(-180).lte(180).optional()),
    locationName: z.string().max(64).optional(),
    locationAddress: z.string().max(128).optional(),
    guestLimit: z.preprocess(val => {
        const num = parseInt(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.int().gte(2).lte(10000).optional()), //idk czy taki maksymalny limit dać czy inny
    ageRestriction: z.preprocess(val => {
        const num = parseInt(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.int().gte(13).lte(99).optional()),
    hashtags: z.preprocess(val => {
        if (typeof val === "string") {
            try {
                const arr = JSON.parse(val);
                return Array.isArray(arr) ? arr : [];
            } catch {
                return [];
            }
        }
        return Array.isArray(val) ? val : [];
    }, z.array(z.string()))

});

