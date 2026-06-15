import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    invitation: {
      findUnique: vi.fn(),
      update: vi.fn()
    },
    eventGuest: {
      count: vi.fn(),
      create: vi.fn()
    },
    userProfile: {
      findUnique: vi.fn()
    },
    $transaction: vi.fn()
  }
}));

import prisma from "../db.js";

import {
  showInvite,
  acceptInvite,
  rejectInvite
} from "../controllers/invitationController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };
}

describe("showInvite controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when invite does not exist", async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);

    const req = {
      params: { token: "fake-token" }
    };

    const res = createResponse();

    await showInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 410 when invite is expired", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt: new Date("2020-01-01"),
      event: {
        eventId: 1,
        eventName: "Test Event",
        description: "Opis",
        isPublic: true,
        eventDateTime: new Date(),
        locationName: "Szczecin",
        locationAddress: "Centrum",
        eventStatus: "upcoming"
      }
    });

    const req = {
      params: { token: "expired-token" }
    };

    const res = createResponse();

    await showInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(410);
  });

  it("should return invite data", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "PENDING",
      createdAt: new Date(),
      expiresAt: null,
      event: {
        eventId: 1,
        eventName: "Test Event",
        description: "Opis",
        isPublic: true,
        eventDateTime: new Date(),
        locationName: "Szczecin",
        locationAddress: "Centrum",
        eventStatus: "upcoming"
      }
    });

    const req = {
      params: { token: "valid-token" }
    };

    const res = createResponse();

    await showInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].success).toBe(true);
  });

  it("should return 500 when database error occurs", async () => {
    prisma.invitation.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { token: "fake-token" }
    };

    const res = createResponse();

    await showInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("acceptInvite controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when invitation does not exist", async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 400 when invitation is not pending", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "ACCEPTED",
      event: {}
    });

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 410 when invitation is expired", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "PENDING",
      expiresAt: new Date("2020-01-01"),
      event: {}
    });

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(410);
  });

  it("should return 400 when event is full", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      eventId: 10,
      status: "PENDING",
      expiresAt: null,
      event: {
        eventId: 10,
        eventName: "Test Event",
        guestLimit: 2,
        ageRestriction: null
      }
    });

    prisma.eventGuest.count.mockResolvedValue(2);

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when user profile is missing", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      eventId: 10,
      status: "PENDING",
      expiresAt: null,
      event: {
        eventId: 10,
        eventName: "Test Event",
        guestLimit: null,
        ageRestriction: 18
      }
    });

    prisma.userProfile.findUnique.mockResolvedValue(null);

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when user is too young", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      eventId: 10,
      status: "PENDING",
      expiresAt: null,
      event: {
        eventId: 10,
        eventName: "Test Event",
        guestLimit: null,
        ageRestriction: 18
      }
    });

    prisma.userProfile.findUnique.mockResolvedValue({
      dateOfBirth: new Date()
    });

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should accept invite successfully", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      eventId: 10,
      status: "PENDING",
      expiresAt: null,
      event: {
        eventId: 10,
        eventName: "Test Event",
        guestLimit: null,
        ageRestriction: null
      }
    });

    prisma.$transaction.mockResolvedValue([]);

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when database error occurs", async () => {
    prisma.invitation.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await acceptInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("rejectInvite controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when invitation does not exist", async () => {
    prisma.invitation.findUnique.mockResolvedValue(null);

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await rejectInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 400 when invitation is not pending", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "ACCEPTED",
      event: {}
    });

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await rejectInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 410 when invitation is expired", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "PENDING",
      expiresAt: new Date("2020-01-01"),
      event: {}
    });

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await rejectInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(410);
  });

  it("should reject invite successfully", async () => {
    prisma.invitation.findUnique.mockResolvedValue({
      invitationId: 1,
      status: "PENDING",
      expiresAt: null,
      event: {
        eventName: "Test Event"
      }
    });

    prisma.invitation.update.mockResolvedValue({});

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await rejectInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when database error occurs", async () => {
    prisma.invitation.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { invitationId: "1" },
      user: { userId: 1 }
    };

    const res = createResponse();

    await rejectInvite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});