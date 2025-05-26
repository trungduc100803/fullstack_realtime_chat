import Post from "../models/post.model.js";
import Comment from "../models/comment.model.js";


export const createComment = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id;
    const postId = req.params.postId;

    const newComment = new Comment({
      userComment: userId,
      content,
      image: image || "",
    });

    await newComment.save();

    // Push comment vào bài viết
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: newComment._id }
    });

    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: "Không thể tạo bình luận", message: err.message });
  }
};

export const getCommentsForPost = async (req, res) => {
  try {
    const postId = req.params.postId;

    // Lấy post, populate comments
    const post = await Post.findById(postId)
      .populate({
        path: "comments",
        populate: {
          path: "userComment",
          select: "fullName profilePic", // Lấy thông tin user comment
        },
      })
      .populate({
        path: "comments",
        populate: {
          path: "replies",
          populate: {
            path: "userComment",
            select: "fullName profilePic",
          },
        },
      });


    res.status(200).json(post.comments);
  } catch (err) {
    res.status(500).json({ error: "Không thể lấy bình luận", message: err.message });
  }
};


export const replyToComment = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user._id;
    const parentCommentId = req.params.commentId;

    const newReply = new Comment({
      userComment: userId,
      content,
      image: image || "",
    });

    await newReply.save();

    // Gắn vào replies của comment cha
    await Comment.findByIdAndUpdate(parentCommentId, {
      $push: { replies: newReply._id }
    });

    res.status(201).json(newReply);
  } catch (err) {
    res.status(500).json({ error: "Không thể phản hồi bình luận", message: err.message });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Bình luận không tồn tại" });
    }

    // Kiểm tra quyền xoá (chỉ người đã bình luận mới xoá được)
    if (comment.userComment.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền xoá bình luận này" });
    }

    // Xoá comment khỏi các bài post chứa comment này
    await Post.updateMany(
      { comments: commentId },
      { $pull: { comments: commentId } }
    );

    // Nếu comment là phản hồi, xoá khỏi các comment/resonse khác
    await Comment.updateMany(
      { resonse: commentId },
      { $pull: { replies: commentId } }
    );

    await comment.deleteOne();

    res.status(200).json({ message: "Xoá bình luận thành công" });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi xoá bình luận", message: err.message });
  }
};


export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content, image } = req.body;
    const userId = req.user._id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Bình luận không tồn tại" });
    }

    // Chỉ cho phép người đã comment được sửa
    if (comment.userComment.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Bạn không có quyền chỉnh sửa bình luận này" });
    }

    // Cập nhật nội dung và/hoặc hình ảnh nếu có
    if (content !== undefined) comment.content = content;
    if (image !== undefined) comment.image = image;

    await comment.save();

    res.status(200).json({ message: "Cập nhật bình luận thành công", comment });
  } catch (err) {
    res.status(500).json({ error: "Lỗi khi cập nhật bình luận", message: err.message });
  }
};
