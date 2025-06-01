import express from "express";
import {
    getNotifications, markAsRead
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();


// Định nghĩa API
router.get("", protectRoute, getNotifications);
router.put("/read/:id", protectRoute, markAsRead);

export default router;