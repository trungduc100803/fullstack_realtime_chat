import User from '../models/user.model.js'
import Post from '../models/post.model.js'
import path from "path";
import fs from 'fs';
import {  io } from "../lib/socket.js";

const convertToBase64 = (filename) => {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    const data = fs.readFileSync(filePath);
    return `data:image/jpeg;base64,${data.toString('base64')}`;
};

export const createPost = async (req, res) => {
    try {
        const { userPost, caption } = req.body;
        const images = req.files?.map((file) => file.filename) || [];
        const newPost = new Post({
            userPost,
            caption,
            images
        });

        await newPost.save();
        // Gửi realtime cho tất cả bạn bè của người tạo
const user = await User.findById(userPost);
user.friends.forEach(friendId => {
  io.to(friendId.toString()).emit("newPost", {
    ...newPost.toObject(),
    userPost: {
      _id: user._id,
      fullName: user.fullName,
      profilePic: user.profilePic,
    },
  });
});
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ error: "Tạo bài viết thất bại", message: err.message });
    }
};

// Lấy tất cả bài viết (có thể thêm phân trang sau)
export const getPostsByUser = async (req, res) => {
    const { userId } = req.params; // hoặc req.query.userId nếu bạn dùng query string

    try {
        const posts = await Post.find({ userPost: userId })
            .populate("userPost", "fullName profilePic")
            .sort({ createdAt: -1 });

        const postsWithBase64 = posts.map(post => ({
            ...post.toObject(),
            images: post.images.map(img => convertToBase64(img))
        }));

        res.status(200).json(postsWithBase64);

    } catch (err) {
        res.status(500).json({ error: "Không lấy được bài viết", message: err.message });
    }
};

// Like / Unlike bài viết
export const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.user._id;

        if (!post.likes.includes(userId)) {
            post.likes.push(userId);
        } else {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        }

        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: "Không thể like bài viết", message: err.message });
    }
};

// Xoá bài viết
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Bài viết không tồn tại" });

        await post.deleteOne();
        res.status(200).json({ message: "Xoá thành công" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi khi xoá bài viết", message: err.message });
    }
};