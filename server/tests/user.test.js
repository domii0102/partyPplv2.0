import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("User routes - authorization", () => {
  it("should allow reaching create profile route without auth but reject empty data", async () => {
    const res = await request(app)
      .post("/api/user")
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  it("should block getting current user without login", async () => {
    const res = await request(app)
      .get("/api/user/me");

    expect(res.statusCode).toBe(401);
  });

  it("should block getting user by id without login", async () => {
    const res = await request(app)
      .get("/api/user/1");

    expect(res.statusCode).toBe(401);
  });

  it("should block updating profile without login", async () => {
    const res = await request(app)
      .put("/api/user")
      .send({
        nickname: "test",
        name: "Test",
        surname: "User"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block updating avatar without login", async () => {
    const res = await request(app)
      .patch("/api/user/update-avatar");

    expect(res.statusCode).toBe(401);
  });
});