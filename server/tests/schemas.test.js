import { describe, it, expect } from "vitest";
import { createPostSchema, editPostSchema } from "../schemas/createPostSchema.js";
import { createCommentSchema } from "../schemas/createCommentSchema.js";

describe("Post schema validation", () => {
  it("should accept valid post data", () => {
    const result = createPostSchema.safeParse({
      textContent: "To jest przykładowy post"
    });

    expect(result.success).toBe(true);
  });

  it("should reject empty post text", () => {
    const result = createPostSchema.safeParse({
      textContent: ""
    });

    expect(result.success).toBe(false);
  });

  it("should accept post with valid image", () => {
    const result = createPostSchema.safeParse({
      textContent: "Post ze zdjęciem",
      images: [
        {
          url: "https://example.com/image.jpg",
          publicId: "abc123"
        }
      ]
    });

    expect(result.success).toBe(true);
  });

  it("should reject post with invalid image url", () => {
    const result = createPostSchema.safeParse({
      textContent: "Post ze złym zdjęciem",
      images: [
        {
          url: "bad-url",
          publicId: "abc123"
        }
      ]
    });

    expect(result.success).toBe(false);
  });

  it("should accept valid edit post data", () => {
    const result = editPostSchema.safeParse({
      textContent: "Zmieniona treść posta"
    });

    expect(result.success).toBe(true);
  });
});

describe("Comment schema validation", () => {
  it("should accept valid comment", () => {
    const result = createCommentSchema.safeParse({
      textContent: "To jest komentarz"
    });

    expect(result.success).toBe(true);
  });

  it("should reject empty comment", () => {
    const result = createCommentSchema.safeParse({
      textContent: ""
    });

    expect(result.success).toBe(false);
  });

  it("should reject too long comment", () => {
    const result = createCommentSchema.safeParse({
      textContent: "a".repeat(513)
    });

    expect(result.success).toBe(false);
  });
});