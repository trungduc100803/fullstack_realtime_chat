import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cation: {
            type: String,
            default: ''
        },
        image: {
            type: String,
            default: ''
        },
        like: {
            type: Number,
            default: 0
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ]
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
