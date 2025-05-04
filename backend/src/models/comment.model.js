import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userComment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
            require: true
        },
        image: {
            type: String,
            default: ''
        },
        resonse: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
