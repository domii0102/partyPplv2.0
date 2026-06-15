import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Comment routes - authorization", () => {
  it("should block getting comments without login", async () => {
    const res = await request(app)
      .get("/api/events/1/forum/posts/1/comments");

    expect(res.statusCode).toBe(401);
  });

  it("should block creating comment without login", async () => {
    const res = await request(app)
      .post("/api/events/1/forum/posts/1/comments")
      .send({
        textContent: "Komentarz testowy"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block updating comment without login", async () => {
    const res = await request(app)
      .patch("/api/events/1/forum/posts/1/comments/1")
      .send({
        textContent: "Nowa treść"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block deleting comment without login", async () => {
    const res = await request(app)
      .delete("/api/events/1/forum/posts/1/comments/1");

    expect(res.statusCode).toBe(401);
  });

  it("should block replying to comment without login", async () => {
    const res = await request(app)
      .post("/api/events/1/forum/posts/1/comments/1/reply")
      .send({
        textContent: "Odpowiedź"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block invalid comment route without login", async () => {
    const res = await request(app)
      .get("/api/events/1/forum/posts/1/comments/999999");

    expect(res.statusCode).toBe(401);
  });
});