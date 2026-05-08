import prisma from "../db.js";
import { createCommentSchema } from '../schemas/createCommentSchema.js';


export async function showNotifications(req, res) {

    const userId = req.user.userId;
    const onlyUnread = req.query.onlyUnread === 'true';

    try {
        const data = await  prisma.notification.findMany({
            where: { 
                userId, 
                ...(onlyUnread && { isRead: false }) 
            },
            include: {
                triggeredBy: {
                    select: {
                        userProfile: {
                            select: {
                                nickname: true,
                                name: true,
                                surname: true,
                                avatar: { select: { url: true } }
                            }
                        }
                    }
                },
                relatedEvent: {
                    select: { eventName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
  
        const notifications = data.map((notification) => ({
            notificationId: notification.notificationId,
            type: notification.type,
            isRead: notification.isRead,
            relatedEvent: {
                relatedEventId: notification.relatedEventId,
                relatedEventName: notification.relatedEvent.eventName
            },
            relatedPostId: notification.relatedPostId,
            relatedCommentId: notification.relatedCommentId,
            createdAt: notification.createdAt,
            author: {
                triggeredById: notification.triggeredById,
                triggeredByName: notification.triggeredBy.userProfile.nickname,
                triggeredByNickname: notification.triggeredBy.userProfile.name,
                triggeredByProfilePicture: notification.triggeredBy.userProfile.avatar?.url ?? null
            }
        }));

        return res.status(200).json({ 
            success: true, 
            message: `Pomyślnie zebrano i wyświetlono powiadomienia`,
            data: notifications
        });
            
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function readAllNotifications(req, res) {
    const userId = req.user.userId;
  
    try {
        const data = await  prisma.notification.findMany({
            where: { 
                userId, 
                ...({ isRead: false })
            },
            isRead: true
        });

        return res.status(204).json({ 
            success: true, 
            message: "Powiadomienia zostały odczytane."
        });
    } catch (err) {
        console.error("Nastąpił błąd podczas zmiany stanu powiadomień.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function readNotification(req, res) {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.notificationId);
  
    try {
        const data = await  prisma.notification.findMany({
            where: { 
                notificationId,
                ...({ isRead: false })
            },
            isRead: true
        });

        return res.status(204).json({ 
            success: true, 
            message: "Powiadomienie zostało odczytane."
        });
    } catch (err) {
        console.error("Nastąpił błąd podczas zmiany stanu powiadomień.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function sendReminder(req, res) {
    const eventId = parseInt(req.event.eventId);

    try {
        const guests = await prisma.eventGuest.findMany({
            where: { eventId },
            select: {
                userId: true
            }
        });

        if (!guests.length) return res.status(404).json({ success: false, error: "No user to send reminders to" });

        const notifictions = guests.map(guest => ({
            userId: guest.userId,
            type: "reminder",
            relatedEvent: guest.eventId,
            triggeredById: req.user.userId
        }));

        await prisma.notification.createMany({
            data: notifictions
        });


        return res.status(201).json({ 
            success: true, 
            message: `Pomyślnie utworzono przypomnienia.`,
            data: {
                sentTo: guests.length
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}