import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Event routes - authorization", () => {
  it("should block getting events without login", async () => {
    const res = await request(app).get("/api/event");
    expect(res.statusCode).toBe(401);
  });

  it("should block getting single event without login", async () => {
    const res = await request(app).get("/api/event/1");
    expect(res.statusCode).toBe(401);
  });

  it("should block creating event without login", async () => {
    const res = await request(app)
      .post("/api/event")
      .send({
        name: "Test event",
        description: "Opis testowy",
        location: "Szczecin"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block updating event without login", async () => {
    const res = await request(app)
      .put("/api/event/1")
      .send({
        name: "Updated event"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block updating event image without login", async () => {
    const res = await request(app)
      .patch("/api/event/update-image/1")
      .send({
        imageUrl: "test.png"
      });

    expect(res.statusCode).toBe(401);
  });

  it("should block deleting event without login", async () => {
    const res = await request(app).delete("/api/event/1");
    expect(res.statusCode).toBe(401);
  });

  it("should block wrong protected route without login", async () => {
    const res = await request(app).get("/api/wrong-route");
    expect(res.statusCode).toBe(401);
  });
});