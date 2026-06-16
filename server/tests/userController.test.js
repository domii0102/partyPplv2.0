import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    userProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    userCredentials: {
      findUnique: vi.fn()
    },
    image: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
  }
}));

vi.mock("../config/cloudConfig.js", () => ({
  uploadImage: vi.fn(),
  deleteUploadedFiles: vi.fn()
}));

vi.mock("../config/multerConfig.js", () => ({
  intoBase64: vi.fn()
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn()
  }
}));

vi.mock("cloudinary", () => ({
  default: {
    url: vi.fn()
  }
}));

import prisma from "../db.js";
import jwt from "jsonwebtoken";
import cloudinary from "cloudinary";
import { uploadImage, deleteUploadedFiles } from "../config/cloudConfig.js";

import {
  getCurrentUser,
  getUser,
  createProfile,
  updateProfile,
  updateAvatar
} from "../controllers/userController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    cookie: vi.fn()
  };
}

function validProfileBody() {
  return {
    email: "test@example.com",
    nickname: "tester",
    name: "Jan",
    surname: "Kowalski",
    dateOfBirth: "2000-01-01"
  };
}

describe("userController - getCurrentUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return current user", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      userId: 1,
      nickname: "tester",
      avatar: null
    });

    const req = {
      user: { userId: 1 }
    };

    const res = createResponse();

    await getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 when current user does not exist", async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);

    const req = {
      user: { userId: 1 }
    };

    const res = createResponse();

    await getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 500 when database fails", async () => {
    prisma.userProfile.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      user: { userId: 1 }
    };

    const res = createResponse();

    await getCurrentUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("userController - getUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return user profile by id", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      userId: 2,
      nickname: "other",
      avatar: null
    });

    const req = {
      params: { id: "2" }
    };

    const res = createResponse();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 when profile does not exist", async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);

    const req = {
      params: { id: "2" }
    };

    const res = createResponse();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 500 when database fails", async () => {
    prisma.userProfile.findUnique.mockRejectedValue(new Error("DB error"));

    const req = {
      params: { id: "2" }
    };

    const res = createResponse();

    await getUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("userController - createProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should reject invalid profile data", async () => {
    const req = {
      body: {},
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when account does not exist", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);

    const req = {
      body: validProfileBody(),
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 400 when email is not confirmed", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: false,
      userRole: "user"
    });

    const req = {
      body: validProfileBody(),
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 409 when profile already exists", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      userRole: "user"
    });

    prisma.userProfile.findUnique.mockResolvedValue({
      profileId: 1
    });

    const req = {
      body: validProfileBody(),
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should return 409 when nickname is taken", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      userRole: "user"
    });

    prisma.userProfile.findUnique.mockResolvedValue(null);
    prisma.userProfile.findFirst.mockResolvedValue({
      profileId: 2,
      nickname: "tester"
    });

    const req = {
      body: validProfileBody(),
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should create profile without avatar", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      userRole: "user"
    });

    prisma.userProfile.findUnique.mockResolvedValue(null);
    prisma.userProfile.findFirst.mockResolvedValue(null);

    prisma.userProfile.create.mockResolvedValue({
      profileId: 1,
      userId: 1,
      nickname: "tester"
    });

    jwt.sign.mockReturnValue("token");

    const req = {
      body: validProfileBody(),
      file: null
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should create profile with avatar", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      userRole: "user"
    });

    prisma.userProfile.findUnique.mockResolvedValue(null);
    prisma.userProfile.findFirst.mockResolvedValue(null);

    uploadImage.mockResolvedValue("avatar-public-id");
    cloudinary.url.mockReturnValue("https://cloud/avatar.jpg");

    prisma.userProfile.create.mockResolvedValue({
      profileId: 1,
      userId: 1,
      nickname: "tester"
    });

    prisma.image.create.mockResolvedValue({
      imageId: 1,
      url: "https://cloud/avatar.jpg",
      publicId: "avatar-public-id"
    });

    jwt.sign.mockReturnValue("token");

    const req = {
      body: validProfileBody(),
      file: { buffer: Buffer.from("fake") }
    };

    const res = createResponse();

    await createProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("userController - updateProfile", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should reject invalid profile update", async () => {
    const req = {
      user: { userId: 1 },
      body: {}
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 404 when profile does not exist", async () => {
    prisma.userProfile.findFirst.mockResolvedValue(null);

    const req = {
      user: { userId: 1 },
      body: validProfileBody()
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 409 when nickname is taken", async () => {
    prisma.userProfile.findFirst
      .mockResolvedValueOnce({
        profileId: 1,
        nickname: "old"
      })
      .mockResolvedValueOnce({
        profileId: 2,
        nickname: "tester"
      });

    const req = {
      user: { userId: 1 },
      body: validProfileBody()
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should update profile", async () => {
    prisma.userProfile.findFirst
      .mockResolvedValueOnce({
        profileId: 1,
        nickname: "old"
      })
      .mockResolvedValueOnce(null);

    prisma.userProfile.update.mockResolvedValue({
      userId: 1,
      nickname: "tester",
      avatar: null
    });

    const req = {
      user: { userId: 1 },
      body: validProfileBody()
    };

    const res = createResponse();

    await updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("userController - updateAvatar", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 404 when profile does not exist", async () => {
    prisma.userProfile.findUnique.mockResolvedValue(null);

    const req = {
      user: { userId: 1 },
      file: null
    };

    const res = createResponse();

    await updateAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should remove current avatar when no new avatar is sent", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      profileId: 1,
      avatar: {
        imageId: 1,
        publicId: "old-avatar"
      }
    });

    prisma.image.delete.mockResolvedValue({
      imageId: 1,
      publicId: "old-avatar"
    });

    const req = {
      user: { userId: 1 },
      file: null
    };

    const res = createResponse();

    await updateAvatar(req, res);

    expect(deleteUploadedFiles).toHaveBeenCalledWith(["old-avatar"]);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should create avatar when profile has no avatar", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      profileId: 1,
      avatar: null
    });

    uploadImage.mockResolvedValue("new-avatar");
    cloudinary.url.mockReturnValue("https://cloud/new-avatar.jpg");

    prisma.image.create.mockResolvedValue({
      imageId: 1,
      publicId: "new-avatar",
      url: "https://cloud/new-avatar.jpg"
    });

    const req = {
      user: { userId: 1 },
      file: { buffer: Buffer.from("fake") }
    };

    const res = createResponse();

    await updateAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should update existing avatar", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      profileId: 1,
      avatar: {
        imageId: 1,
        publicId: "old-avatar"
      }
    });

    uploadImage.mockResolvedValue("new-avatar");
    cloudinary.url.mockReturnValue("https://cloud/new-avatar.jpg");

    prisma.image.update.mockResolvedValue({
      imageId: 1,
      publicId: "new-avatar",
      url: "https://cloud/new-avatar.jpg"
    });

    const req = {
      user: { userId: 1 },
      file: { buffer: Buffer.from("fake") }
    };

    const res = createResponse();

    await updateAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return null when profile has no avatar and no file is sent", async () => {
    prisma.userProfile.findUnique.mockResolvedValue({
      profileId: 1,
      avatar: null
    });

    const req = {
      user: { userId: 1 },
      file: null
    };

    const res = createResponse();

    await updateAvatar(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data).toBe(null);
  });
});