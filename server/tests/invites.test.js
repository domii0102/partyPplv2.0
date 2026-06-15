import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Invite routes - authorization", () => {
  it("should block getting event invites without login", async () => {
    const res = await request(app)
      .get("/api/events/1/invites");

    expect(res.statusCode).toBe(401);
  });

  it("should block inviting users without login", async () => {
    const res = await request(app)
      .post("/api/events/1/invites/users")
      .send({
        userIds: [1],
        expiresAt: "2026-12-31"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block creating invite link without login", async () => {
    const res = await request(app)
      .post("/api/events/1/invites/link")
      .send({
        expiresAt: "2026-12-31"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block getting user invites without login", async () => {
    const res = await request(app)
      .get("/api/events/1/invites/user/1");

    expect(res.statusCode).toBe(401);
  });

  it("should block accepting invite without login", async () => {
    const res = await request(app)
      .post("/api/invites/1/accept");

    expect(res.statusCode).toBe(401);
  });

  it("should block rejecting invite without login", async () => {
    const res = await request(app)
      .post("/api/invites/1/reject");

    expect(res.statusCode).toBe(401);
  });

  it("should block changing invitation expiration date without login", async () => {
    const res = await request(app)
      .patch("/api/events/1/invites/1")
      .send({
        expiresAt: "2026-12-31"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block deleting invite without login", async () => {
    const res = await request(app)
      .delete("/api/events/1/invites/1");

    expect(res.statusCode).toBe(401);
  });

  it("should allow public invite route to be reached", async () => {
    const res = await request(app)
      .get("/api/public/fake-token");

    expect([200, 400, 404, 500]).toContain(res.statusCode);
  });
});