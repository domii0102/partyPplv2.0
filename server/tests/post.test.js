import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Post routes - authorization", () => {
  it("should block getting posts without login", async () => {
    const res = await request(app).get("/api/events/1/forum/posts");
    expect(res.statusCode).toBe(401);
  });

  it("should block getting single post without login", async () => {
    const res = await request(app).get("/api/events/1/forum/posts/1");
    expect(res.statusCode).toBe(401);
  });

  it("should block creating post without login", async () => {
    const res = await request(app)
      .post("/api/events/1/forum/posts")
      .send({
        title: "Test post",
        textContent: "Treść testowego posta"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block updating post without login", async () => {
    const res = await request(app)
      .patch("/api/events/1/forum/posts/1")
      .send({
        title: "Updated post"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block deleting post without login", async () => {
    const res = await request(app).delete("/api/events/1/forum/posts/1");
    expect(res.statusCode).toBe(401);
  });

  it("should block liking post without login", async () => {
    const res = await request(app).post("/api/events/1/forum/posts/1/like");
    expect(res.statusCode).toBe(401);
  });
});