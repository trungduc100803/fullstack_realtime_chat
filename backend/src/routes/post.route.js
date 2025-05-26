import express from "express";
import multer from "multer";
import path from "path";
import {
    createPost,
    getPostsByUser,
    toggleLike,
    deletePost,
} from "../controllers/post.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Cấu hình lưu ảnh với multer (nếu có upload ảnh)
// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });



// Định nghĩa API
router.post("/create-post", upload.array("images", 10), createPost);
router.get("/get-post-by-id/:userId", getPostsByUser);
router.put("/:id/like", protectRoute, toggleLike);
router.delete("/:id", protectRoute, deletePost);

export default router;