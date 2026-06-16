


import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    userCredentials: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    userProfile: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock("../services/mailService.js", () => ({
  sendEmail: vi.fn()
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn()
  }
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn()
  }
}));

import prisma from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mailService.js";

import {
  register,
  login,
  logout,
  checkAccount,
  verifyEmail,
  resendVerificationCode,
  requestPasswordReset,
  resetPassword
} from "../controllers/accountController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn()
  };
}

describe("accountController - register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid register data", async () => {
    const req = {
      body: {
        email: "wrong",
        password: ""
      }
    };

    const res = createResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 409 when user already exists", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({ userId: 1 });

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should register new user", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-value");
    prisma.userCredentials.create.mockResolvedValue({
      userId: 1,
      email: "test@example.com"
    });
    sendEmail.mockResolvedValue(true);

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].success).toBe(true);
  });

  it("should return 500 when email sending fails", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue("hashed-value");
    prisma.userCredentials.create.mockResolvedValue({
      userId: 1,
      email: "test@example.com"
    });
    sendEmail.mockRejectedValue(new Error("SMTP error"));

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("accountController - login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid login data", async () => {
    const req = {
      body: {
        email: "bad-email",
        password: ""
      }
    };

    const res = createResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 401 when user does not exist", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 403 when email is not verified", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      email: "test@example.com",
      emailConfirmed: false
    });

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should return 401 when password is invalid", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      email: "test@example.com",
      emailConfirmed: true,
      passwordHash: "hash",
      userRole: "user"
    });

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should login user and set cookie", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      email: "test@example.com",
      emailConfirmed: true,
      passwordHash: "hash",
      userRole: "user"
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("fake-jwt-token");

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await login(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].token).toBe("fake-jwt-token");
  });
});

describe("accountController - logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should clear cookie and logout user", async () => {
    const req = {};
    const res = createResponse();

    await logout(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith(
      "token",
      expect.any(Object)
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("accountController - checkAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when account does not exist", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await checkAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 401 when password is invalid", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      passwordHash: "hash"
    });

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await checkAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return account data with profile", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      userId: 1,
      emailConfirmed: true,
      passwordHash: "hash"
    });

    bcrypt.compare.mockResolvedValue(true);
    prisma.userProfile.findUnique.mockResolvedValue({
      userId: 1
    });

    const req = {
      body: {
        email: "test@example.com",
        password: "Password123!"
      }
    };

    const res = createResponse();

    await checkAccount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.hasProfile).toBe(true);
  });
});

describe("accountController - verifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid verify data", async () => {
    const req = {
      body: {
        email: "bad",
        token: ""
      }
    };

    const res = createResponse();

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should return 409 when email is already verified", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: true
    });

    const req = {
      body: {
        email: "test@example.com",
        token: "123456"
      }
    };

    const res = createResponse();

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should return 401 when token is invalid", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: false,
      emailConfirmationToken: "hash"
    });

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body: {
        email: "test@example.com",
        token: "123456"
      }
    };

    const res = createResponse();

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should verify email successfully", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: false,
      emailConfirmationToken: "hash"
    });

    bcrypt.compare.mockResolvedValue(true);
    prisma.userCredentials.update.mockResolvedValue({});

    const req = {
      body: {
        email: "test@example.com",
        token: "123456"
      }
    };

    const res = createResponse();

    await verifyEmail(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("accountController - resendVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when email does not exist", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue(null);

    const req = {
      body: {
        email: "test@example.com"
      }
    };

    const res = createResponse();

    await resendVerificationCode(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should resend verification code", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false
    });

    bcrypt.hash.mockResolvedValue("hash");
    prisma.userCredentials.update.mockResolvedValue({});
    sendEmail.mockResolvedValue(true);

    const req = {
      body: {
        email: "test@example.com"
      }
    };

    const res = createResponse();

    await resendVerificationCode(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe("accountController - password reset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject password reset request with invalid token", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: true,
      emailConfirmationToken: "hash"
    });

    bcrypt.compare.mockResolvedValue(false);

    const req = {
      body: {
        email: "test@example.com",
        token: "123456"
      }
    };

    const res = createResponse();

    await requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should accept valid password reset token", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: true,
      emailConfirmationToken: "hash"
    });

    bcrypt.compare.mockResolvedValue(true);

    const req = {
      body: {
        email: "test@example.com",
        token: "123456"
      }
    };

    const res = createResponse();

    await requestPasswordReset(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should reset password successfully", async () => {
    prisma.userCredentials.findUnique.mockResolvedValue({
      isDeleted: false,
      emailConfirmed: true,
      emailConfirmationToken: "hash"
    });

    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue("new-hash");
    prisma.userCredentials.update.mockResolvedValue({});

    const req = {
      body: {
        email: "test@example.com",
        token: "123456",
        password: "NewPassword123!"
      }
    };

    const res = createResponse();

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});