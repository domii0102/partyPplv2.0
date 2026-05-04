import prisma from "../db.js";

export const isPostOwner = async (req, res, next) => {
    const userId = req.user.userId;
    const postId = parseInt(req.params.postId);

    try {
        const post = await prisma.post.findUnique({
            where: { postId }
        });

        if (!post) return res.status(404).json({ success: false, error: "Post not found" });
        if (post.authorId !== userId) return res.status(403).json({ success: false, error: "Access denied - not a post owner" });

        req.post = post; 
        next();

    } catch (err) {
        return res.status(500).json({ success: false, error: "Database error" });
    }
};

export const isEventOwner = (req, res, next) => {
    const userId = req.user.userId;
    const event = req.event;

    if (event.organizerId === userId) return next();
    else return res.status(403).json({ success: false, error: "Access denied - not an event owner" });

};

export const isAdmin = (req, res, next) => {
    if (req.user.userRole === "admin") return next();
    return res.status(403).json({ success: false, error: "Access denied - not an admin" });
};