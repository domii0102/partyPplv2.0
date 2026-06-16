import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createEventReport, createPostReport, createCommentReport } from "../controllers/reportController.js";

const router = express.Router();

router.post("/event/:eventId", authMiddleware, createEventReport);
router.post("/post/:postId", authMiddleware, createPostReport);
router.post("/comment/:commentId", authMiddleware, createCommentReport);
export default router;