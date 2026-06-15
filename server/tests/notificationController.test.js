import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => {
  return {
    default: {
     notification: {
  findMany: vi.fn(),
  updateMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  createMany: vi.fn()
},
      eventGuest: {
        findMany: vi.fn()
      }
    }
  };
});

vi.mock("../app.js", () => {
  return {
    io: {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn()
    }
  };
});

import prisma from "../db.js";
import {
  showNotifications,
  readAllNotifications,
  readNotification,
  sendReminder
} from "../controllers/notificationController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };
}

describe("notificationController - showNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return notifications for user", async () => {
    prisma.notification.findMany.mockResolvedValue([
      {
        notificationId: 1,
        type: "comment",
        isRead: false,
        relatedEventId: 2,
        relatedEvent: {
          eventName: "Test Event"
        },
        relatedPostId: 3,
        relatedCommentId: 4,
        createdAt: new Date("2026-06-15"),
        triggeredById: 5,
        triggeredBy: {
          userProfile: {
            nickname: "nick",
            name: "Jan",
            surname: "Kowalski",
            avatar: {
              url: "avatar.png"
            }
          }
        }
      }
    ]);

    const req = {
      user: { userId: 1 },
      query: {}
    };

    const res = createResponse();

    await showNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].success).toBe(true);
    expect(res.json.mock.calls[0][0].data).toHaveLength(1);
  });

  it("should filter only unread notifications", async () => {
    prisma.notification.findMany.mockResolvedValue([]);

    const req = {
      user: { userId: 1 },
      query: { onlyUnread: "true" }
    };

    const res = createResponse();

    await showNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: 1,
          isRead: false
        })
      })
    );
  });

  it("should return 500 when database error occurs", async () => {
    prisma.notification.findMany.mockRejectedValue(new Error("DB error"));

    const req = {
      user: { userId: 1 },
      query: {}
    };

    const res = createResponse();

    await showNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("notificationController - readAllNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mark all notifications as read", async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 3 });

    const req = {
      user: { userId: 1 }
    };

    const res = createResponse();

    await readAllNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, isRead: false },
      data: { isRead: true }
    });
  });

  it("should return 500 when updateMany fails", async () => {
    prisma.notification.updateMany.mockRejectedValue(new Error("DB error"));

    const req = {
      user: { userId: 1 }
    };

    const res = createResponse();

    await readAllNotifications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("notificationController - readNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when notification does not exist", async () => {
    prisma.notification.findUnique.mockResolvedValue(null);

    const req = {
      user: { userId: 1 },
      params: { notificationId: "1" }
    };

    const res = createResponse();

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when notification belongs to another user", async () => {
    prisma.notification.findUnique.mockResolvedValue({
      notificationId: 1,
      userId: 2
    });

    const req = {
      user: { userId: 1 },
      params: { notificationId: "1" }
    };

    const res = createResponse();

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should mark single notification as read", async () => {
    prisma.notification.findUnique.mockResolvedValue({
      notificationId: 1,
      userId: 1
    });

    prisma.notification.update.mockResolvedValue({
      notificationId: 1,
      isRead: true
    });

    const req = {
      user: { userId: 1 },
      params: { notificationId: "1" }
    };

    const res = createResponse();

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { notificationId: 1 },
      data: { isRead: true }
    });
  });

  it("should return 500 when database error occurs", async () => {
    prisma.notification.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      user: { userId: 1 },
      params: { notificationId: "1" }
    };

    const res = createResponse();

    await readNotification(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("notificationController - sendReminder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when there are no guests", async () => {
    prisma.eventGuest.findMany.mockResolvedValue([]);

    const req = {
      event: { eventId: 1 },
      user: { userId: 10 }
    };

    const res = createResponse();

    await sendReminder(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
  it("should create reminders for guests", async () => {
  prisma.eventGuest.findMany.mockResolvedValue([
    { userId: 1, eventId: 10 },
    { userId: 2, eventId: 10 }
  ]);

  prisma.notification.createMany.mockResolvedValue({ count: 2 });

  const req = {
    event: { eventId: 10 },
    user: { userId: 99 }
  };

  const res = createResponse();

  await sendReminder(req, res);

  expect(res.status).toHaveBeenCalledWith(201);
  expect(prisma.notification.createMany).toHaveBeenCalled();
  expect(res.json.mock.calls[0][0].data.sentTo).toBe(2);
});

it("should return 500 when sending reminders fails", async () => {
  prisma.eventGuest.findMany.mockRejectedValue(new Error("DB error"));

  const req = {
    event: { eventId: 10 },
    user: { userId: 99 }
  };

  const res = createResponse();

  await sendReminder(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
});
});