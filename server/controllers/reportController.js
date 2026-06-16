import prisma from "../db.js";

export async function createEventReport(req, res) {
  const eventId = parseInt(req.params.eventId);
  const senderId = req.user.userId;
  const { textContent } = req.body;

  if (Number.isNaN(eventId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid event ID",
    });
  }

  if (!textContent || textContent.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Report content is required",
    });
  }

  if (textContent.length > 256) {
    return res.status(400).json({
      success: false,
      error: "Report content must be shorter than 256 characters",
    });
  }

  try {
    const event = await prisma.event.findUnique({
      where: {
        eventId: eventId,
      },
    });

    if (!event || event.deletedAt !== null) {
      return res.status(404).json({
        success: false,
        error: "Event not found",
      });
    }

    const report = await prisma.report.create({
      data: {
        eventId: eventId,
        senderId: senderId,
        textContent: textContent,
        isExamined: false,
      },
    });

    return res.status(201).json({
      success: true,
      data: { report },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not create report",
    });
  }
}

export async function createPostReport(req, res) {
  const postId = parseInt(req.params.postId);
  const senderId = req.user.userId;
  const { textContent } = req.body;

  if (Number.isNaN(postId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid post ID",
    });
  }

  if (!textContent || textContent.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Report content is required",
    });
  }

  if (textContent.length > 256) {
    return res.status(400).json({
      success: false,
      error: "Report content must be shorter than 256 characters",
    });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const report = await prisma.report.create({
      data: {
        postId,
        senderId,
        textContent,
        isExamined: false,
      },
    });

    return res.status(201).json({
      success: true,
      data: { report },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not create post report",
    });
  }
}

export async function createCommentReport(req, res) {
  const commentId = parseInt(req.params.commentId);
  const senderId = req.user.userId;
  const { textContent } = req.body;

  if (Number.isNaN(commentId)) {
    return res.status(400).json({
      success: false,
      error: "Invalid comment ID",
    });
  }

  if (!textContent || textContent.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Report content is required",
    });
  }

  if (textContent.length > 256) {
    return res.status(400).json({
      success: false,
      error: "Report content must be shorter than 256 characters",
    });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { commentId },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: "Comment not found",
      });
    }

    const report = await prisma.report.create({
      data: {
        commentId,
        senderId,
        textContent,
        isExamined: false,
      },
    });

    return res.status(201).json({
      success: true,
      data: { report },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "Could not create comment report",
    });
  }
}