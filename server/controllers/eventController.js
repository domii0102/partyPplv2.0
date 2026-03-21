import * as z from 'zod';
import { intoBase64 } from '../config/multerConfig.js';
import { uploadImage, deleteUploadedFiles } from '../config/cloudConfig.js';
import { eventSchema, updateEventSchema } from '../schemas/eventSchema.js';
import { eventStatusOptions, userRoleOptions } from '../enums.js';
import prisma from '../db.js';
import cloudinary from 'cloudinary';

export async function getEvent(req, res) {

    const eventId = parseInt(req.params.id);

    try {
        const event = await prisma.event.findUnique({
            where: { eventId: eventId, deletedAt: null },
            include: {image: true}
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
                include: {image: true}
            })
            return res.status(200).json({ success: true, data: events });
        }
        else {
            events = await prisma.event.findMany({
                where: { deletedAt: null, organizerId: userId },
                include: {image: true} //tutaj jeszcze dodać te, w których uczestniczymy
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

            return {event: savedEvent, image: savedImage}
        });
    }
    catch (err) {
        console.error(err);
        await deleteUploadedFiles([imageId]);
        return res.status(500).json({ success: false, error: "An error occurred while trying to insert the record into the database" });
    }


    return res.status(201).json({ success: true, data: transactionResult});
};

export async function updateEvent(req, res) {

    const userId = req.user.userId;
    const eventId = parseInt(req.params.id);
    const result = eventSchema.safeParse(req.body);
    const image = req.file || null;

    if (!result.success) {
        return res.status(400).json({ success: false, error: z.flattenError(result.error) });
    }

    const event = await prisma.event.findUnique({
        where: { eventId: eventId },
        include: {image: true}
    });

    if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
    }


    if (event.organizerId !== userId) {
        return res.status(403).json({ success: false, error: "Invalid permissions to update this resource - you are not the owner" });
    }

    console.log(event);
    let newImageId = null;

    if (image) {
        try {
            if (!event.image) {
                
                throw new Error("Event does not have an associated image");
            }
            newImageId = await uploadImage(intoBase64(image));

            try {

                const oldImagePublicId = event.image.publicId;
                const savedRecords = await prisma.$transaction([
                    prisma.event.update({
                        where: { eventId: eventId },
                        data: { ...result.data }
                    }),
                    prisma.image.update({
                        where: { imageId: event.image.imageId },
                        data: {
                            publicId: newImageId,
                            url: cloudinary.url(newImageId)
                        }
                    })
                ]);

                if (newImageId && event.image) {
                    await deleteUploadedFiles([oldImagePublicId]);
                }

                return res.status(201).json({ success: true, data: {event: savedRecords[0], image: savedRecords[1]} });

            } catch (err) {
                console.error(err);
                await deleteUploadedFiles([newImageId]);
                return res.status(500).json({ success: false, error: "An attempt to save changes in the database was unsuccessful" });

            }
        }
        catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: "An attempt to save event image in cloud was unsuccessful" });
        }
    }



    try {
        const updatedEvent = await prisma.event.update({
            where: { eventId: eventId },
            data: { ...result.data },
            include: { image: true }
        });
        return res.status(200).json({ success: true, data: updatedEvent });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "An attempt to save changes in the database was unsuccessful" });

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


