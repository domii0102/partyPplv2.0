import prisma from "../db.js";
import { createCommentSchema } from '../schemas/createCommentSchema.js';


export async function showComments(req, res) {

    const postId = parseInt(req.params.postId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [data, total] = await Promise.all([
            prisma.comment.findMany({
                where: { postId, parentId: null },
                skip,
                take: limit,
                include: {
                    userCredentials: {
                        select: {
                            userProfile: {
                                select: {
                                    nickname: true,
                                    avatar: { select: { url: true } }
                                }
                            }
                        }
                    },
                    replies: {
                        include: {
                            userCredentials: {
                                select: {
                                    userProfile: {
                                        select: {
                                            nickname: true,
                                            avatar: { select: { url: true, publicId: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }),
            prisma.comment.count({ where: { postId } }) // Zliczamy wszystkie komentarze, główne i odpowiedzi
        ]);

        if (!data) return res.status(404).json({ success: false, error: "No comments to show" });
        
        const comments = data.map((comment) => ({
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

export async function createComment(req, res) {
    const postId = parseInt(req.params.postId);
    
    // Walidacja
    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
      
    const { textContent } = validation.data;

    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                authorId: req.user.userId,
                textContent,
                parentId: null
            },
            include: {
                userCredentials: {
                    select: {
                        userProfile: {
                            select: {
                                nickname: true,
                                avatar: { select: { url: true } }
                            }
                        }
                    }
                }
            }
        });

        return res.status(201).json({ 
            success: true, 
            message: `Pomyślnie stworzono komentarz.`,
            data: {
                commentId: comment.commentId,
                textContent: comment.textContent,
                createdAt: comment.createdAt,
                author: {
                    nickname: comment.userCredentials.userProfile.nickname,
                    avatar: comment.userCredentials.userProfile.avatar?.url ?? null
                }
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function createReply(req, res) {
    const postId = parseInt(req.params.postId);
    const parentId = parseInt(req.params.commentId);

    // Walidacja
    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
      
    const { textContent } = validation.data;

    try {
        const comment = await prisma.comment.create({
            data: {
                postId,
                authorId: req.user.userId,
                textContent,
                parentId: parentId
            },
            include: {
                userCredentials: {
                    select: {
                        userProfile: {
                            select: {
                                nickname: true,
                                avatar: { select: { url: true } }
                            }
                        }
                    }
                }
            }
        });

        return res.status(201).json({ 
            success: true, 
            message: `Pomyślnie stworzono odpowiedź na komentarz.`,
            data: {
                commentId: comment.commentId,
                textContent: comment.textContent,
                createdAt: comment.createdAt,
                parentId,
                author: {
                    nickname: comment.userCredentials.userProfile.nickname,
                    avatar: comment.userCredentials.userProfile.avatar?.url ?? null
                }
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function editComment(req, res) {
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

export async function deleteComment(req, res) {

  const postId = parseInt(req.params.postId);
  const commentId = parseInt(req.params.commentId);
  const userId = req.user.userId;
  const userRole = req.user.userRole;

  try {
    const comment = await prisma.comment.findUnique({ where: { commentId } });
  
    if (!comment) return res.status(404).json({ success: false, error: "Comment not found" });

    if (comment.authorId !== userId && req.event.organizerId !== userId && userRole !== 'admin') {
        return res.status(403).json({ success: false, error: "Access denied" });
    }

    await prisma.comment.delete({
        where: { commentId }
    });

    return res.status(200).json({ 
        success: true, 
        message: "Komentarz został usunięty.",
     });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "A database error has occurred" });
  }
}