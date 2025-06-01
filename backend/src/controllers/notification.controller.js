import Notification from "../models/notify.model.js";
import User from "../models/user.model.js";
import { io, userSocketMap } from "../lib/socket.js"; // bạn cần export `onlineUsers` từ server

// Gửi thông báo tới 1 user nếu họ online
const sendRealtimeNotification = (receiverId, notification) => {
    const socketId = userSocketMap[receiverId.toString()];
    if (socketId) {
        io.to(socketId).emit("newNotification", notification);
    }
};

// Tạo thông báo khi bạn bè đăng bài
export const notifyNewPost = async ({ senderId, postId }) => {
    const sender = await User.findById(senderId);

    await Promise.all(
        sender.friends.map(async (friendId) => {
            const notification = new Notification({
                sender: senderId,
                receiver: friendId,
                type: "new_post",
                post: postId,
            });
            await notification.save();
            sendRealtimeNotification(friendId, notification);
        })
    );
};

// Tạo thông báo khi ai đó bình luận bài của mình
export const notifyNewComment = async ({ senderId, postOwnerId, postId, commentId }) => {
    if (senderId.toString() === postOwnerId.toString()) return;

    const notification = new Notification({
        sender: senderId,
        receiver: postOwnerId,
        type: "new_comment",
        post: postId,
        comment: commentId,
    });
    await notification.save();
    sendRealtimeNotification(postOwnerId, notification);
};

// Tạo thông báo khi ai đó trả lời bình luận của mình
export const notifyReplyComment = async ({ senderId, originalCommenterId, postId, commentId }) => {
    if (senderId.toString() === originalCommenterId.toString()) return;

    const notification = new Notification({
        sender: senderId,
        receiver: originalCommenterId,
        type: "reply_comment",
        post: postId,
        comment: commentId,
    });
    await notification.save();
    sendRealtimeNotification(originalCommenterId, notification);
};

// Lấy danh sách thông báo của người dùng
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ receiver: req.user._id })
            .sort({ createdAt: -1 })
            .populate("sender", "fullName profilePic email")
            .populate("post", "_id")
            .populate("comment", "_id");

        res.status(200).json(notifications);
    } catch (err) {
        res.status(500).json({ error: "Không thể lấy thông báo", message: err.message });
    }
};

// Đánh dấu là đã đọc
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);
        if (!notification) return res.status(404).json({ error: "Thông báo không tồn tại" });

        if (notification.receiver.toString() !== req.user._id.toString())
            return res.status(403).json({ error: "Không có quyền" });

        notification.isRead = true;
        await notification.save();
        res.status(200).json({ message: "Đã đánh dấu là đã đọc" });
    } catch (err) {
        res.status(500).json({ error: "Lỗi đánh dấu thông báo", message: err.message });
    }
};
