import prisma from "../db.js";

export const canCreateInvites = async (req, res, next) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
        where: { eventId: parseInt(eventId) },
        include: { eventGuests: true }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.organizerId === userId) return next();

    if (event.isPublic) {
        const isGuest = event.eventGuests.some(guest => guest.userId === userId);
        if (isGuest) return next();
    }

    return res.status(403).json({ error: "No permission to send invites." });
};

export const canManageInvites = async (req, res, next) => {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const event = await prisma.event.findUnique({
        where: { eventId: parseInt(eventId) }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (event.organizerId === userId) return next();

    return res.status(403).json({ error: "Only the organizer can manage invitations." });
}