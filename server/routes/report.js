import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createEventReport } from "../controllers/reportController.js";

const router = express.Router();

router.post("/event/:eventId", authMiddleware, createEventReport);

export default router;