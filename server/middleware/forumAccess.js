import prisma from "../db.js";

export const eventExists = async (req, res, next) => {
    const eventId = parseInt(req.params.eventId);

    try {
        const event = await prisma.event.findUnique({
            where: { eventId },
            include: { forum: true }
        });

        if (!event || event.deletedAt) return res.status(404).json({ success: false, error: "Event not found" });

        req.event = event;
        next();
    } catch (err) { return res.status(500).json({ success: false, error: "Database error" }); }
};

export const isMember = async (req, res, next) => {
    const userId = req.user.userId;
    const event = req.event;

        console.log('userId:', userId);
    console.log('organizerId:', event.organizerId);
    console.log('są równe:', event.organizerId === userId);
    if (event.organizerId === userId) return next();

    try {
        const guest = await prisma.eventGuest.findUnique({
            where: {
                userId_eventId: {
                    userId,
                    eventId: event.eventId
                }
            }
        });
        if (!guest) return res.status(403).json({ success: false, error: "Access denied" });
        next();
    } catch (err) { return res.status(500).json({ success: false, error: "Database error" }); }
};

export const eventNotFinished = (req, res, next) => {
    const event = req.event;
    const isFinished = event.endDateTime && new Date() > event.endDateTime;
    if (isFinished) return res.status(403).json({ success: false, error: "Event has ended, forum is read-only" });
    next();
};