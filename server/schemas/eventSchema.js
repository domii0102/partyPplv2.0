import * as z from 'zod';

export const eventSchema = z.object({
    eventName: z.string().trim().min(5).max(128),
    description: z.string().trim().min(8).max(512),
    isPublic: z.coerce.boolean(),
    eventDateTime: z.iso.datetime({ offset: true }),
    locationLatitude: z.preprocess(val => {
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.number().gte(-90).lte(90).optional()),
    locationLongitude: z.preprocess(val => {
        const num = parseFloat(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.number().gte(-180).lte(180).optional()),
    ageRestriction: z.preprocess(val => {
        const num = parseInt(val);
        return Number.isNaN(num) ? undefined : num;
    }, z.int().gte(13).lte(99).optional())
});

export const updateEventSchema = eventSchema.partial();