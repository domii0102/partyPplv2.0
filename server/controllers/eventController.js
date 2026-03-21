import * as z from 'zod';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';
import { eventSchema } from '../schemas/eventSchema.js';
import { eventStatusOptions, userRoleOptions } from '../enums.js';
import prisma from '../db.js';
import cloudinary from 'cloudinary';

export async function getEvent(req, res) {

    const eventId = parseInt(req.params.id);

    try {
        const event = await prisma.event.findUnique({
            where: { eventId: eventId, deletedAt: null },
            include: { image: true }
        });
        if (!event) {
            return res.status(404).json({ success: false, error: "Event not found" });
        }
        return res.status(200).json({ success: true, data: event });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
};

//POPRAWIĆ JAK BĘDZIE DOŁĄCZANIE DO WYDARZEŃ
export async function getEvents(req, res) {

    const userId = req.user.userId;
    const visibility = req.query.visibility || null;

    try {
        let events;
        if (visibility === "public") {

            events = await prisma.event.findMany({
                where: { deletedAt: null, isPublic: true },
                include: { image: true }
            })
            return res.status(200).json({ success: true, data: events });
        }
        else {
            events = await prisma.event.findMany({
                where: { deletedAt: null, organizerId: userId },
                include: { image: true } //tutaj jeszcze dodać te, w których uczestniczymy
            })
            return res.status(200).json({ success: true, data: events });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
};


export async function createEvent(req, res) {

    const userId = req.user.userId;
    const image = req.file || null;

    if (!image) {
        return res.status(400).json({ success: false, error: "One image is required" });
    }

    const result = eventSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    const { eventName, description, isPublic, eventDateTime, locationLatitude = null, locationLongitude = null, ageRestriction = null } = result.data;

    let imageId = null;

    try {
        imageId = await uploadImage(intoBase64(image));
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An attempt to save event image was unsuccessful" });
    }

    const newEvent = {
        organizerId: userId,
        eventName: eventName,
        description: description,
        isPublic: isPublic,
        eventDateTime: eventDateTime,
        locationLatitude: locationLatitude,
        locationLongitude: locationLongitude,
        ageRestriction: ageRestriction,
        eventStatus: eventStatusOptions.UPCOMING,
        createdAt: new Date(),
        deletedAt: null
    };


    let transactionResult;
    try {

        transactionResult = await prisma.$transaction(async (tx) => {
            const savedEvent = await tx.event.create({
                data: newEvent
            });

            const savedImage = await tx.image.create({
                data: {
                    eventId: savedEvent.eventId,
                    publicId: imageId,
                    url: cloudinary.url(imageId)
                }
            });

            return { event: savedEvent, image: savedImage }
        });
    }
    catch (err) {
        console.error(err);
        await deleteUploadedFiles([imageId]);
        return res.status(500).json({ success: false, error: "An error occurred while trying to insert the record into the database" });
    }


    return res.status(201).json({ success: true, data: transactionResult });
};

export async function updateEvent(req, res) {

    console.log(req.body);
    const userId = req.user.userId;
    const eventId = parseInt(req.params.id);
    const result = eventSchema.safeParse(req.body);
    let currentEvent;
    let updatedEvent;


    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    const { eventName, description, isPublic, eventDateTime, locationLatitude, locationLongitude, ageRestriction } = result.data;

    try {
        currentEvent = await prisma.event.findUnique({
            where: { eventId: eventId }
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (!currentEvent) {
        return res.status(404).json({ success: false, error: "Event not found" });
    }


    if (currentEvent.organizerId !== userId) {
        return res.status(403).json({ success: false, error: "Invalid permissions to update this resource - you are not the owner" });
    }

    try {

        updatedEvent = await prisma.event.update({
            where: { eventId: eventId },
            data: {
                eventName: eventName,
                description: description,
                isPublic: isPublic,
                eventDateTime: eventDateTime,
                locationLatitude: locationLatitude,
                locationLongitude: locationLongitude,
                ageRestriction: ageRestriction
            },
            include: { image: true }
        });

        return res.status(200).json({ success: true, data: updatedEvent });


    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An attempt to save changes in the database was unsuccessful" });

    }

}

export async function updateImage(req, res) {

    

    const eventId = parseInt(req.params.id);
    const userId = req.user.userId;
    const image = req.file || null;
    let newImageId;
    let updatedImage;
    let oldImageId;
    let event;

    

    if (!image) {
        return res.status(400).json({ success: false, error: "No image received" });
    }

    try {
        event = await prisma.event.findUnique({
            where: { eventId: eventId },
            select: { organizerId: true, image: true }
        });
    }
    catch (err) {
        return res.status(404).json({ success: false, error: "A database error has occurred" });
    }

    if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
    }

    if (userId !== event.organizerId) {
        return res.status(403).json({ success: false, error: "Invalid permissions to update this resource - you are not the owner" });
    }

    if (!event.image) {
        return res.status(404).json({ success: false, error: "Current event image not found" });
    }

    oldImageId = event.image.publicId;

    try {
        newImageId = await uploadImage(intoBase64(image));

        updatedImage = await prisma.image.update({
            where: { imageId: event.image.imageId },
            data: {
                publicId: newImageId,
                url: cloudinary.url(newImageId)
            }
        });

        if (newImageId && updatedImage) {
            await deleteUploadedFiles([oldImageId]);
        }

        return res.status(200).json({ success: true, data: updatedImage });
    }
    catch (err) {
        console.error(err);
        if (newImageId) {
            await deleteUploadedFiles([oldImageId]);
        }
        return res.status(500).json({ success: false, error: "An error occurred while updating the image" });
    }

}

export async function deleteEvent(req, res) {

    const eventId = parseInt(req.params.id);
    const userId = req.user.userId;

    let event;
    try {
        event = await prisma.event.findUnique({
            where: { eventId: eventId }
        });
        if (!event || event.deletedAt !== null) {
            return res.status(404).json({ success: false, error: "Event not found" })
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    //Tylko twórca albo admin może usunąć, dlatego sprawdzamy kim jest użytkownik usuwający
    let userRole;
    try {
        userRole = await prisma.userCredentials.findUnique({
            where: { userId: userId },
            select: { userRole: true }
        });
        if (!userRole) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }

    if (event.organizerId !== userId && userRole.userRole !== userRoleOptions.ADMIN) {
        return res.status(403).json({ success: false, error: "Invalid permissions to delete this resource" });
    }

    let deletedEvent;
    try {
        deletedEvent = await prisma.event.update({
            where: { eventId: eventId },
            data: { deletedAt: new Date() }
        })
        return res.status(200).json({ success: true, data: deletedEvent });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Could not delete resource" });
    }
}


