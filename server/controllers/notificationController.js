import prisma from "../db.js";
import { createCommentSchema } from '../schemas/createCommentSchema.js';


export async function showNotifications(req, res) {

    const userId = req.user.userId;
    const onlyUnread = req.query.onlyUnread === 'true';

    try {
        const notifications = await  prisma.Notification.findMany({
            where: { 
                userId, 
                ...(onlyUnread && { isRead: false }) 
            },
            orderBy: { createdAt: 'asc' }
        }); // Zliczamy wszystkie powiadomienia

        if (!data) return res.status(404).json({ success: false, error: "No notifications to show" });
        
        const notifications = data.map((comment) => ({
            commentId: comment.commentId,
            textContent: comment.textContent,
            createdAt: comment.createdAt,
            author: {
                nickname: comment.userCredentials.userProfile.nickname,
                avatar: comment.userCredentials.userProfile.avatar?.url ?? null
            },
            replies: comment.replies.map((reply) => ({
                commentId: reply.commentId,
                textContent: reply.textContent,
                createdAt: reply.createdAt,
                parentId: reply.parentId,
                author: {
                    nickname: reply.userCredentials.userProfile.nickname,
                    avatar: reply.userCredentials.userProfile.avatar?.url ?? null
                }
            }))
        }));

        return res.status(200).json({ 
            success: true, 
            message: `Pomyślnie zebrano i wyświetlono ${limit} komentarzy z ${total} odnośnie postu ${postId}`,
            data: comments,
            pagination: { total, page, limit }
        });
            
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function readAllNotifications(req, res) {
    const commentId = parseInt(req.params.commentId);
  
    // Walidacja
    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
    
    const { textContent } = validation.data;

    if (textContent === undefined) return res.status(404).json({ success: false, error: "No changes to apply" });

    try {
        const updated = await prisma.comment.update({
            where: { commentId },
            data: { textContent }
        });

        return res.status(200).json({ 
            success: true, 
            message: "Komentarz został zaktualizowany.",
            data: {
                commentId: commentId,
                textContent: updated.textContent
            }
        });

    } catch (err) {
        console.error("Nastąpił błąd podczas zapisywania zmian w komentarzu.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function readNotification(req, res) {
    const commentId = parseInt(req.params.commentId);
  
    // Walidacja
    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
    
    const { textContent } = validation.data;

    if (textContent === undefined) return res.status(404).json({ success: false, error: "No changes to apply" });

    try {
        const updated = await prisma.comment.update({
            where: { commentId },
            data: { textContent }
        });

        return res.status(200).json({ 
            success: true, 
            message: "Komentarz został zaktualizowany.",
            data: {
                commentId: commentId,
                textContent: updated.textContent
            }
        });

    } catch (err) {
        console.error("Nastąpił błąd podczas zapisywania zmian w komentarzu.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}