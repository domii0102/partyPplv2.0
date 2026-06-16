import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: {
    post: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    comment: {
      deleteMany: vi.fn()
    },
    postLike: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      count: vi.fn()
    }
  }
}));

vi.mock("../services/notificationService.js", () => ({
  notify: vi.fn(),
  notifyAllMembers: vi.fn(),
  emitToEvent: vi.fn()
}));

import prisma from "../db.js";
import {
  showEventPosts,
  showPost,
  createPost,
  editPost,
  deletePost,
  likePost
} from "../controllers/postController.js";

function createResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  };
}

function baseReq() {
  return {
    params: { postId: "1" },
    query: {},
    body: {},
    user: { userId: 1, userRole: "user" },
    event: {
      eventId: 10,
      eventName: "Test event",
      organizerId: 1,
      forum: { forumId: 5 }
    }
  };
}

describe("postController - showEventPosts", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return event posts list", async () => {
    prisma.post.findMany.mockResolvedValue([]);
    prisma.post.count.mockResolvedValue(0);

    const req = baseReq();
    const res = createResponse();

    await showEventPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when loading posts fails", async () => {
    prisma.post.findMany.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    const res = createResponse();

    await showEventPosts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("postController - showPost", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 404 when post does not exist", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const req = baseReq();
    const res = createResponse();

    await showPost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return single post", async () => {
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      textContent: "Test post",
      createdAt: new Date(),
      images: [],
      userCredentials: {
        userProfile: {
          nickname: "user",
          avatar: null
        }
      },
      _count: {
        postLikes: 2,
        comments: 3
      }
    });

    const req = baseReq();
    const res = createResponse();

    await showPost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when database fails", async () => {
    prisma.post.findUnique.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    const res = createResponse();

    await showPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("postController - createPost", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should reject invalid body", async () => {
    const req = baseReq();
    req.body = { textContent: "" };

    const res = createResponse();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should create post without images", async () => {
    prisma.post.create.mockResolvedValue({
      postId: 1,
      textContent: "Test post",
      createdAt: new Date(),
      images: [],
      userCredentials: {
        userProfile: {
          nickname: "user",
          avatar: null
        }
      }
    });

    const req = baseReq();
    req.body = { textContent: "Test post" };

    const res = createResponse();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should create post with images", async () => {
    prisma.post.create.mockResolvedValue({
      postId: 1,
      textContent: "Test post",
      createdAt: new Date(),
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "img123"
        }
      ],
      userCredentials: {
        userProfile: {
          nickname: "user",
          avatar: null
        }
      }
    });

    const req = baseReq();
    req.body = {
      textContent: "Test post",
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "img123"
        }
      ]
    };

    const res = createResponse();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 500 when create fails", async () => {
    prisma.post.create.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    req.body = { textContent: "Test post" };

    const res = createResponse();

    await createPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("postController - editPost", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 400 when no fields to update", async () => {
    const req = baseReq();
    req.body = {};

    const res = createResponse();

    await editPost(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should update post text", async () => {
    prisma.post.update.mockResolvedValue({
      postId: 1,
      textContent: "Updated post",
      images: []
    });

    const req = baseReq();
    req.body = {
      textContent: "Updated post"
    };

    const res = createResponse();

    await editPost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should update post images", async () => {
    prisma.post.update.mockResolvedValue({
      postId: 1,
      textContent: "Updated post",
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "img123"
        }
      ]
    });

    const req = baseReq();
    req.body = {
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "img123"
        }
      ]
    };

    const res = createResponse();

    await editPost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when update fails", async () => {
    prisma.post.update.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    req.body = {
      textContent: "Updated post"
    };

    const res = createResponse();

    await editPost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("postController - deletePost", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 404 when post does not exist", async () => {
    prisma.post.findUnique.mockResolvedValue(null);

    const req = baseReq();
    const res = createResponse();

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should return 403 when user has no permission", async () => {
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 2
    });

    const req = baseReq();
    req.user = { userId: 1, userRole: "user" };
    req.event.organizerId = 3;

    const res = createResponse();

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("should delete post as author", async () => {
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 1
    });

    prisma.comment.deleteMany.mockResolvedValue({});
    prisma.postLike.deleteMany.mockResolvedValue({});
    prisma.post.delete.mockResolvedValue({});

    const req = baseReq();
    const res = createResponse();

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should delete post as admin", async () => {
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 2
    });

    prisma.comment.deleteMany.mockResolvedValue({});
    prisma.postLike.deleteMany.mockResolvedValue({});
    prisma.post.delete.mockResolvedValue({});

    const req = baseReq();
    req.user = { userId: 1, userRole: "admin" };
    req.event.organizerId = 3;

    const res = createResponse();

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when deleting fails", async () => {
    prisma.post.findUnique.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    const res = createResponse();

    await deletePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("postController - likePost", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return 404 when post does not exist", async () => {
    prisma.postLike.findUnique.mockResolvedValue(null);
    prisma.post.findUnique.mockResolvedValue(null);

    const req = baseReq();
    const res = createResponse();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should like post when reaction does not exist", async () => {
    prisma.postLike.findUnique.mockResolvedValue(null);
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 2
    });
    prisma.postLike.create.mockResolvedValue({});
    prisma.postLike.count.mockResolvedValue(1);

    const req = baseReq();
    const res = createResponse();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.liked).toBe(true);
  });

  it("should unlike post when reaction exists", async () => {
    prisma.postLike.findUnique.mockResolvedValue({
      likeId: 1
    });
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 2
    });
    prisma.postLike.delete.mockResolvedValue({});
    prisma.postLike.count.mockResolvedValue(0);

    const req = baseReq();
    const res = createResponse();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json.mock.calls[0][0].data.liked).toBe(false);
  });

  it("should like own post without error", async () => {
    prisma.postLike.findUnique.mockResolvedValue(null);
    prisma.post.findUnique.mockResolvedValue({
      postId: 1,
      authorId: 1
    });
    prisma.postLike.create.mockResolvedValue({});
    prisma.postLike.count.mockResolvedValue(1);

    const req = baseReq();
    const res = createResponse();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 500 when like fails", async () => {
    prisma.postLike.findUnique.mockRejectedValue(new Error("DB error"));

    const req = baseReq();
    const res = createResponse();

    await likePost(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});