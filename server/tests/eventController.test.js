import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => {
  return {
    default: {
      event: {
        findUnique: vi.fn(),
        update: vi.fn() ,
        findMany: vi.fn(),
      },
      userCredentials: {
        findUnique: vi.fn()
      } , 
      image: {
  update: vi.fn()
},
    }
  };
});

import prisma from "../db.js";
import { getEvent, deleteEvent, updateImage } from "../controllers/eventController.js";import { getEvent, getEvents, deleteEvent, updateImage } from "../controllers/eventController.js";
describe("getEvent controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when event does not exist", async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: "1" }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Event not found"
    });
  });

  it("should return 200 when event exists", async () => {
    const fakeEvent = {
      eventId: 1,
      eventName: "Test Event"
    };

    prisma.event.findUnique.mockResolvedValue(fakeEvent);

    const req = {
      params: { id: "1" }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: fakeEvent
    });
  });

  it("should return 500 on database error", async () => {
    prisma.event.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { id: "1" }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "A database error has occurred"
    });
  });
});

describe("deleteEvent controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when event does not exist", async () => {
    prisma.event.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      user: { userId: 1 }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Event not found"
    });
  });

  it("should return 404 when user does not exist", async () => {
    prisma.event.findUnique.mockResolvedValue({
      eventId: 1,
      organizerId: 1,
      deletedAt: null
    });

    prisma.userCredentials.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      user: { userId: 1 }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "User not found"
    });
  });

  it("should return 403 when user is not owner and not admin", async () => {
    prisma.event.findUnique.mockResolvedValue({
      eventId: 1,
      organizerId: 2,
      deletedAt: null
    });

    prisma.userCredentials.findUnique.mockResolvedValue({
      userRole: "user"
    });

    const req = {
      params: { id: "1" },
      user: { userId: 1 }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Invalid permissions to delete this resource"
    });
  });

  it("should delete event when user is owner", async () => {
    const deletedEvent = {
      eventId: 1,
      organizerId: 1,
      deletedAt: new Date()
    };

    prisma.event.findUnique.mockResolvedValue({
      eventId: 1,
      organizerId: 1,
      deletedAt: null
    });

    prisma.userCredentials.findUnique.mockResolvedValue({
      userRole: "user"
    });

    prisma.event.update.mockResolvedValue(deletedEvent);

    const req = {
      params: { id: "1" },
      user: { userId: 1 }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: deletedEvent
    });
  });

  it("should delete event when user is admin", async () => {
    const deletedEvent = {
      eventId: 1,
      organizerId: 2,
      deletedAt: new Date()
    };

    prisma.event.findUnique.mockResolvedValue({
      eventId: 1,
      organizerId: 2,
      deletedAt: null
    });

    prisma.userCredentials.findUnique.mockResolvedValue({
      userRole: "admin"
    });

    prisma.event.update.mockResolvedValue(deletedEvent);

    const req = {
      params: { id: "1" },
      user: { userId: 1 }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("updateImage controller", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 when image is missing", async () => {

    const req = {
      params: { id: "1" },
      user: { userId: 1 },
      file: null
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when event does not exist", async () => {

    prisma.event.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: "1" },
      user: { userId: 1 },
      file: {}
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when user is not owner", async () => {

    prisma.event.findUnique.mockResolvedValue({
      organizerId: 2,
      image: {
        imageId: 1,
        publicId: "old-image"
      }
    });

    const req = {
      params: { id: "1" },
      user: { userId: 1 },
      file: {}
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should return 404 when event image does not exist", async () => {

    prisma.event.findUnique.mockResolvedValue({
      organizerId: 1,
      image: null
    });

    const req = {
      params: { id: "1" },
      user: { userId: 1 },
      file: {}
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await updateImage(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

});


describe("getEvents controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return public events", async () => {
    const events = [
      {
        eventId: 1,
        eventName: "Public event",
        isPublic: true
      }
    ];

    prisma.event.findMany.mockResolvedValue(events);

    const req = {
      query: {
        visibility: "public"
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: events
    });
  });

  it("should return public events with filters", async () => {
    prisma.event.findMany.mockResolvedValue([]);

    const req = {
      query: {
        visibility: "public",
        search: "party",
        city: "Szczecin",
        hashtags: ["music", "club"],
        date: "2026-06-15",
        sortBy: "title-asc"
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(prisma.event.findMany).toHaveBeenCalled();
  });

  it("should return 500 when database error occurs", async () => {
    prisma.event.findMany.mockRejectedValue(new Error("DB error"));

    const req = {
      query: {
        visibility: "public"
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };

    await getEvents(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "A database error has occurred"
    });
  });
});