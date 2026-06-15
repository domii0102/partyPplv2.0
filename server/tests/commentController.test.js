import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    comment: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn()
    },
    post: {
      findUnique: vi.fn()
    }
  }
}));

vi.mock("../services/notificationService.js", () => ({
  notify: vi.fn(),
  emitToEvent: vi.fn(),
  notifyAboutReply: vi.fn()
}));

import prisma from "../db.js";

import {
  showComments,
  createComment,
  editComment,
  deleteComment
} from "../controllers/commentController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };
}

describe("showComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return comments list", async () => {
    prisma.comment.findMany.mockResolvedValue([]);
    prisma.comment.count.mockResolvedValue(0);

    const req = {
      params: { postId: "1" },
      query: {}
    };

    const res = createResponse();

    await showComments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 on database error", async () => {
    prisma.comment.findMany.mockRejectedValue(new Error());

    const req = {
      params: { postId: "1" },
      query: {}
    };

    const res = createResponse();

    await showComments(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("createComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid body", async () => {
    const req = {
      params: { postId: "1" },
      body: {
        textContent: ""
      }
    };

    const res = createResponse();

    await createComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should create comment", async () => {
    prisma.comment.create.mockResolvedValue({
      commentId: 1,
      textContent: "test",
      createdAt: new Date(),
      userCredentials: {
        userProfile: {
          nickname: "user",
          avatar: null
        }
      }
    });

    prisma.post.findUnique.mockResolvedValue({
      authorId: 999
    });

    const req = {
      params: { postId: "1" },
      body: {
        textContent: "test"
      },
      user: {
        userId: 1
      },
      event: {
        eventId: 5
      }
    };

    const res = createResponse();

    await createComment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe("editComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject invalid edit", async () => {
    const req = {
      params: {
        commentId: "1"
      },
      body: {
        textContent: ""
      }
    };

    const res = createResponse();

    await editComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should update comment", async () => {
    prisma.comment.update.mockResolvedValue({
      commentId: 1,
      textContent: "updated"
    });

    const req = {
      params: {
        commentId: "1"
      },
      body: {
        textContent: "updated"
      },
      event: {
        eventId: 1
      }
    };

    const res = createResponse();

    await editComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when update fails", async () => {
    prisma.comment.update.mockRejectedValue(new Error());

    const req = {
      params: {
        commentId: "1"
      },
      body: {
        textContent: "updated"
      },
      event: {
        eventId: 1
      }
    };

    const res = createResponse();

    await editComment(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("deleteComment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when comment does not exist", async () => {
    prisma.comment.findUnique.mockResolvedValue(null);

    const req = {
      params: {
        postId: "1",
        commentId: "1"
      },
      user: {
        userId: 1,
        userRole: "user"
      },
      event: {
        organizerId: 2
      }
    };

    const res = createResponse();

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 404 when post does not exist", async () => {
    prisma.comment.findUnique.mockResolvedValue({
      commentId: 1,
      postId: 1,
      authorId: 2
    });

    prisma.post.findUnique.mockResolvedValue(null);

    const req = {
      params: {
        postId: "1",
        commentId: "1"
      },
      user: {
        userId: 1,
        userRole: "user"
      },
      event: {
        organizerId: 3
      }
    };

    const res = createResponse();

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when user has no access", async () => {
    prisma.comment.findUnique.mockResolvedValue({
      commentId: 1,
      postId: 1,
      authorId: 5
    });

    prisma.post.findUnique.mockResolvedValue({
      authorId: 6
    });

    const req = {
      params: {
        postId: "1",
        commentId: "1"
      },
      user: {
        userId: 1,
        userRole: "user"
      },
      event: {
        organizerId: 7
      }
    };

    const res = createResponse();

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should delete comment as author", async () => {
    prisma.comment.findUnique.mockResolvedValue({
      commentId: 1,
      postId: 1,
      authorId: 1
    });

    prisma.post.findUnique.mockResolvedValue({
      authorId: 10
    });

    prisma.comment.delete.mockResolvedValue({});

    const req = {
      params: {
        postId: "1",
        commentId: "1"
      },
      user: {
        userId: 1,
        userRole: "user"
      },
      event: {
        eventId: 1,
        organizerId: 10
      }
    };

    const res = createResponse();

    await deleteComment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});