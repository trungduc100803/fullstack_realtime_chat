import express from "express";
import {
    createComment,
    getCommentsForPost,
    replyToComment,
    deleteComment,
    updateComment
} from "../controllers/comment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Định nghĩa API
router.post('/create-comment/:postId', protectRoute, createComment);
router.get('/get-comment/:postId', protectRoute, getCommentsForPost);
router.post('/reply/:commentId', protectRoute, replyToComment);
router.delete("/delete-comment/:commentId", protectRoute, deleteComment);
router.put("/edit-comment/:commentId", protectRoute, updateComment);
export default router;