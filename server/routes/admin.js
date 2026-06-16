import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

import {
  getReports,
  markReportAsExamined,
  getUsers,
  softDeleteUser,
  changeUserRole,
  getEvents,
  softDeleteEvent,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Reports
router.get("/reports", getReports);
router.patch("/reports/:reportId/examine", markReportAsExamined);

// Users
router.get("/users", getUsers);
router.patch("/users/:userId/soft-delete", softDeleteUser);
router.patch("/users/:userId/role", changeUserRole);

// Events
router.get("/events", getEvents);
router.patch("/events/:eventId/soft-delete", softDeleteEvent);

export default router;