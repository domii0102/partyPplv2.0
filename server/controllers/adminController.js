import prisma from "../db.js";

export async function getReports(req, res) {
  try {
    const reports = await prisma.report.findMany({
      include: {
        event: {
          select: {
            eventId: true,
            eventName: true,
            organizerId: true,
            eventStatus: true,
            createdAt: true,
            deletedAt: true,
          },
        },
        userCredentials: {
          select: {
            userId: true,
            email: true,
            userRole: true,
            deletedAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: { reports },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not load reports",
    });
  }
}

export async function markReportAsExamined(req, res) {
  const reportId = Number(req.params.reportId);

  if (Number.isNaN(reportId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid report ID",
    });
  }

  try {
    const report = await prisma.report.update({
      where: { reportId },
      data: { isExamined: true },
    });

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not mark report as examined",
    });
  }
}

export async function getUsers(req, res) {
  try {
    const users = await prisma.userCredentials.findMany({
      select: {
        userId: true,
        email: true,
        emailConfirmed: true,
        userRole: true,
        createdAt: true,
        deletedAt: true,
        userProfile: {
          select: {
            nickname: true,
            name: true,
            surname: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: { users },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not load users",
    });
  }
}

export async function softDeleteUser(req, res) {
  const { userId } = req.params;

  try {
    const user = await prisma.userCredentials.update({
      where: { userId },
      data: {
        deletedAt: new Date(),
      },
      select: {
        userId: true,
        email: true,
        userRole: true,
        deletedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not soft delete user",
    });
  }
}

export async function changeUserRole(req, res) {
  const { userId } = req.params;
  const { userRole } = req.body;

  if (!["user", "admin"].includes(userRole)) {
    return res.status(400).json({
      success: false,
      error: "Invalid user role",
    });
  }

  try {
    const user = await prisma.userCredentials.update({
      where: { userId },
      data: { userRole },
      select: {
        userId: true,
        email: true,
        userRole: true,
        deletedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not change user role",
    });
  }
}

export async function getEvents(req, res) {
  try {
    const events = await prisma.event.findMany({
      select: {
        eventId: true,
        organizerId: true,
        eventName: true,
        description: true,
        isPublic: true,
        eventDateTime: true,
        endDateTime: true,
        locationName: true,
        locationAddress: true,
        eventStatus: true,
        createdAt: true,
        deletedAt: true,
        userCredentials: {
          select: {
            userId: true,
            email: true,
            userRole: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not load events",
    });
  }
}

export async function softDeleteEvent(req, res) {
  const eventId = Number(req.params.eventId);

  if (Number.isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid event ID",
    });
  }

  try {
    const event = await prisma.event.update({
      where: { eventId },
      data: {
        deletedAt: new Date(),
        eventStatus: "deleted",
      },
    });

    return res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not soft delete event",
    });
  }
}