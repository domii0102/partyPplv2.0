import prisma from '../db.js';
import { io } from '../app.js';

// Powiadomienia mogą być emitowane do:
// A: 1 użytkownika (np. reakcja pod jego postem)
// B: wszystkich użytkowników zainteresowanych eventem (np. nowy post)
// C: wszystkich użytkowników z otwartą stroną eventu (np. zmiana licznika + nowy komentarz)
// D: autora posta, autora komentarza i odpowiadających na ten komentarz

export async function notify(userId, type, triggeredById, relatedIds = {}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                triggeredById,
                relatedEventId: relatedIds.eventId      ?? null,
                relatedPostId: relatedIds.postId       ?? null,
                relatedCommentId: relatedIds.commentId    ?? null
            }
        });
        io.to(`user_${userId}`).emit('notification', notification);
        return notification;
    } catch (err) { console.error('Notification error: ', err); }
}

export async function notifyAllMembers(eventId, type, triggeredById, relatedIds = {}) {
    try {
        const guests = await prisma.eventGuest.findMany({
            where: { eventId },
            select: { userId: true }
        });

        // Organizator nie jest gościem
        const event = await prisma.event.findUnique({
            where: { eventId },
            select: { organizerId: true }
        });

        const receivers = [ // Odbiorcy bez duplikatów i powodującego powiadomienie
            ...guests.map(guest => guest.userId),
            event.organizerId
        ].filter((userId, index, self) => userId !== triggeredById && self.indexOf(userId) === index );
        if (!receivers.length) return;

        await prisma.notification.createMany({
            data: receivers.map(userId => ({
                userId,
                type,
                triggeredById,
                relatedEventId:   relatedIds.eventId    ?? null,
                relatedPostId:    relatedIds.postId     ?? null,
                relatedCommentId: relatedIds.commentId  ?? null
            }))
        });

        receivers.forEach(userId => {
            io.to(`user_${userId}`).emit('notification', {
                type,
                triggeredById,
                ...relatedIds
            });
        });
    } catch (err) { console.error('Notification error: ', err); }
}

export function emitToEvent(eventId, event, data) {
    io.to(`event_${eventId}`).emit(event, data);
}

export async function notifyAboutReply(postId, parentId, type, triggeredById, relatedIds = {}) {
    try {
        const [replies, parentComment, post] = await Promise.all([
            prisma.comment.findMany({
                where: { parentId },
                select: { authorId: true },
                distinct: ['authorId']
            }),
            prisma.comment.findUnique({
                where: { commentId: parentId },
                select: { authorId: true }
            }),
            prisma.post.findUnique({
                where: { postId },
                select: { authorId: true }
            })
        ]);

        const receivers = [
            ...replies.map(reply => reply.authorId),
            parentComment.authorId,
            post.authorId
        ].filter((userId, index, self) => 
            userId !== triggeredById && self.indexOf(userId) === index );
        if (!receivers.length) return;

        await prisma.notification.createMany({
            data: receivers.map(userId => ({
                userId,
                type,
                triggeredById,
                relatedEventId:   relatedIds.eventId    ?? null,
                relatedPostId:    relatedIds.postId     ?? null,
                relatedCommentId: relatedIds.commentId  ?? null
            }))
        });

        receivers.forEach(userId => {
            io.to(`user_${userId}`).emit('notification', {
                type,
                triggeredById,
                ...relatedIds
            });
        });
    } catch (err) { console.error('Notification error: ', err); }
}