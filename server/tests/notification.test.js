import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Notification routes - authorization", () => {
  it("should block getting notifications without login", async () => {
    const res = await request(app)
      .get("/api/notifications");

    expect(res.statusCode).toBe(401);
  });

  it("should block reading all notifications without login", async () => {
    const res = await request(app)
      .patch("/api/notifications/read");

    expect(res.statusCode).toBe(401);
  });

  it("should block reading single notification without login", async () => {
    const res = await request(app)
      .patch("/api/notifications/1/read");

    expect(res.statusCode).toBe(401);
  });
});