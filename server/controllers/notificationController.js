import prisma from "../db.js";
import { io } from '../app.js';


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
            relatedEvent: notification.relatedEvent ? {
                relatedEventId: notification.relatedEventId,
                relatedEventName: notification.relatedEvent.eventName
            } : null,
            relatedPostId: notification.relatedPostId,
            relatedCommentId: notification.relatedCommentId,
            relatedInvitationId: notification.relatedInvitationId,
            createdAt: notification.createdAt,
            author: notification.triggeredById ? {
                triggeredById: notification.triggeredById,
                triggeredByName: notification.triggeredBy?.userProfile
                    ? `${notification.triggeredBy.userProfile.name} ${notification.triggeredBy.userProfile.surname}`
                    : null,
                triggeredByNickname: notification.triggeredBy?.userProfile?.nickname ?? null,
                triggeredByProfilePicture: notification.triggeredBy?.userProfile?.avatar?.url ?? null
            } : null
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
        const data = await  prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });

        return res.status(200).json({ success: true, message: "Powiadomienia zostały odczytane." });
    } catch (err) {
        console.error("Nastąpił błąd podczas zmiany stanu powiadomień.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function readNotification(req, res) {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.notificationId);
  
    try {
        const notification = await prisma.notification.findUnique({ where: { notificationId } });

        if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
        if (notification.userId !== userId) return res.status(403).json({ success: false, error: "Access denied" });

        await prisma.notification.update({
            where: { notificationId },
            data: { isRead: true }
        });

        return res.status(200).json({ success: true, message: "Powiadomienie zostało odczytane." });
    } catch (err) {
        console.error("Nastąpił błąd podczas zmiany stanu powiadomień.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function sendReminder(req, res) {
    const eventId = req.event.eventId;

    try {
        const guests = await prisma.eventGuest.findMany({
            where: { eventId },
            select: { userId: true, eventId: true }
        });

        if (!guests.length) return res.status(404).json({ success: false, error: "No user to send reminders to" });

        const notifictions = guests.map(guest => ({
            userId: guest.userId,
            type: "reminder",
            relatedEventId: guest.eventId,
            triggeredById: req.user.userId
        }));

        await prisma.notification.createMany({ data: notifictions });

        guests.forEach(guest => {
            io.to(`user_${guest.userId}`).emit('notification', {
                type: 'reminder',
                relatedEventId: eventId
            });
        });

        return res.status(201).json({ 
            success: true, 
            message: `Pomyślnie utworzono przypomnienia.`,
            data: { sentTo: guests.length }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function deleteNotification(req, res) {
    const userId = req.user.userId;
    const notificationId = parseInt(req.params.notificationId);

    if (Number.isNaN(notificationId)) {
        return res.status(400).json({ success: false, error: "Invalid notification id" });
    }

    try {
        const notification = await prisma.notification.findUnique({ where: { notificationId } });

        if (!notification) return res.status(404).json({ success: false, error: "Notification not found" });
        if (notification.userId !== userId) return res.status(403).json({ success: false, error: "Access denied" });

        await prisma.notification.delete({ where: { notificationId } });

        return res.status(200).json({ success: true, message: "Powiadomienie zostało usunięte." });
    } catch (err) {
        console.error("Nastąpił błąd podczas usuwania powiadomienia.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}