import prisma from "../db.js";
import { createPostSchema, editPostSchema } from "../schemas/createPostSchema.js"
import { notify, notifyAllMembers, emitToEvent } from '../services/notificationService.js';


export async function showEventPosts(req, res) {
    const forumId = req.event.forum.forumId;
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const [data, total] = await Promise.all([
            prisma.post.findMany({
                where: { forumId },
                skip,           // Pomijanie X wyświetlonych już postów
                take: limit,    // Limit ilości pobieranych postów
                orderBy: { createdAt: 'desc' },
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
                    images: {
                        select: { url: true, publicId: true }
                    },
                    postLikes: {
                        where: { authorId: userId },
                        select: { likeId: true }
                    },
                    _count: {
                        select: {
                            postLikes: true,
                            comments: true
                        }
                    }
                }
            }),
            prisma.post.count({ where: { forumId } }) // Zliczanie wszystkich postów z danego forum
        ]);

        const posts = data.map((post) => ({
            postId: post.postId,
            authorId: post.authorId,
            textContent: post.textContent,
            createdAt: post.createdAt,
            images: post.images,
            author: {
                nickname: post.userCredentials.userProfile.nickname,
                avatar: post.userCredentials.userProfile.avatar?.url ?? null
            },
            likesCount: post._count.postLikes,
            commentsCount: post._count.comments,
            isLiked: post.postLikes.length > 0 
        }));

        return res.status(200).json({ 
            success: true, 
            message: `Pomyślnie zebrano i wyświetlono ${limit} postów z ${total} odnośnie wydarzenia ${req.event.eventName}`,
            data: posts,
            pagination: { total, page, limit }
        });
            
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function showPost(req, res) {
    const postId = parseInt(req.params.postId);
    const forumId = req.event.forum.forumId;

    try {
        const data = await prisma.post.findUnique({
            where: { postId, forumId },
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
                images: {
                    select: { url: true, publicId: true }
                },
                _count: {
                    select: {
                        postLikes: true,
                        comments: true
                    }
                }
            }
        });

        if (!data) return res.status(404).json({ success: false, error: "Post not found" });
        
        const post = {
            postId: data.postId,
            textContent: data.textContent,
            createdAt: data.createdAt,
            images: data.images,
            author: {
                nickname: data.userCredentials.userProfile.nickname,
                avatar: data.userCredentials.userProfile.avatar?.url ?? null
            },
            likesCount: data._count.postLikes,
            commentsCount: data._count.comments
        };

        return res.status(200).json({ 
            success: true, 
            message: `Pomyślnie pobrano post ${postId} odnośnie wydarzenia ${req.event.eventName}`,
            data: post
        });
            
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function createPost(req, res) {
    const forumId = req.event.forum.forumId;
    
    // Walidacja
    const validation = createPostSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
    const { textContent, images } = validation.data;

    try {
        const post = await prisma.post.create({
            data: {
                forumId,
                authorId: req.user.userId,
                textContent,
                images: images && images.length > 0 ? { // Jeżeli są jakieś zdjęcia to tworzy je w Images i dołącz
                    create: images.map(img => ({
                        url: img.url,
                        publicId: img.publicId
                    }))
                } : undefined // jeżeli nie ma zdjęć - pomija
            },
            include: {
                images: { select: { url: true, publicId: true } },
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

        // Powiadomienia
        await notifyAllMembers(req.event.eventId, 'new_post', req.user.userId, {
            eventId: req.event.eventId,
            postId: post.postId
        });

        emitToEvent(req.event.eventId, 'new_post', {
            postId: post.postId,
            authorId: req.user.userId,
            textContent: post.textContent,
            createdAt: post.createdAt,
            author: {
                nickname: post.userCredentials.userProfile.nickname,
                avatar: post.userCredentials.userProfile.avatar?.url ?? null
            }
        });

        return res.status(201).json({ 
            success: true, 
            message: `Pomyślnie stworzono post.`,
            data: {
                postId: post.postId,
                textContent: post.textContent,
                createdAt: post.createdAt,
                authorId: req.user.userId,
                images: post.images ?? [],
                author: {
                    nickname: post.userCredentials.userProfile.nickname,
                    avatar: post.userCredentials.userProfile.avatar?.url ?? null
                }
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}

export async function editPost(req, res) {
    const postId = parseInt(req.params.postId);
    const forumId = req.event.forum.forumId;
  
    // Walidacja
    const validation = editPostSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ success: false, details: validation.error.format() });
    const { textContent, images } = validation.data;

    const updatedData = {};
    if (textContent !== undefined) updatedData.textContent = textContent;
    if (images !== undefined) updatedData.images = {
        deleteMany: {},
        create: images.map(img => ({ url: img.url, publicId: img.publicId }) )
    }

    // Sprawdzanie czy są jakieś pola do zmiany
    if (Object.keys(updatedData).length === 0) { // Czy updatedData ma jakieś pola/klucze biektu
        return res.status(400).json({ success: false, error: "No fields to update" });
    }

    try {
        const updated = await prisma.post.update({
            where: { postId, forumId },
            data: updatedData,
            include: { images: { select: { url: true, publicId: true } } }
        });

        emitToEvent(req.event.eventId, 'post_updated', {
            postId,
            textContent: updated.textContent,
            images: updated.images
        });

        return res.status(200).json({ 
            success: true, 
            message: "Post został zaktualizowany.",
            data: {
                postId: postId,
                textContent: updated.textContent,
                images: updated.images
            }
        });
    } catch (err) {
        console.error("Nastąpił błąd podczas zapisywania zmian w poście.", err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
    }
}

export async function deletePost(req, res) {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;
  const userRole = req.user.userRole;

  try {
    const post = await prisma.post.findUnique({ where: { postId } });
  
    if (!post) return res.status(404).json({ success: false, error: "Post not found" });

    if (post.authorId !== userId && req.event.organizerId !== userId && userRole !== 'admin') {
        return res.status(403).json({ success: false, error: "Access denied" });
    }

    await prisma.comment.deleteMany({ where: { postId } });
    await prisma.postLike.deleteMany({ where: { postId } });
    await prisma.post.delete({ where: { postId } });

    emitToEvent(req.event.eventId, 'post_deleted', { postId });

    return res.status(200).json({ success: true, message: "Post został usunięty." });
  } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "A database error has occurred" });
  }
}

export async function likePost(req, res) {
    const postId = parseInt(req.params.postId);
    const authorId = req.user.userId;

    try {
        const reactionCheck = await prisma.postLike.findUnique({ where: { authorId_postId: { authorId, postId } } });
        const post = await prisma.post.findUnique({ where: { postId } });
        if (!post) return res.status(404).json({ success: false, error: "Post not found" });

        if (reactionCheck) {
            await prisma.postLike.delete({ where: { authorId_postId: { authorId, postId } } });
        } else {
            await prisma.postLike.create({
                data: {
                    authorId: req.user.userId,
                    postId
                }
            });
        }

        const likesCount = await prisma.postLike.count({ where: { postId } });

        if (!reactionCheck && post.authorId !== req.user.userId) {
            await notify(post.authorId, 'new_like', req.user.userId, {
                eventId: req.event.eventId,
                postId
            });
        }

        emitToEvent(req.event.eventId, 'post_liked', {
            postId,
            liked: !reactionCheck,
            likesCount
        });

        return res.status(200).json({ 
            success: true, 
            message: `Pomyślnie plubiono post.`,
            data: {
                liked: !reactionCheck,
                likesCount
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: err.message });
    }
}