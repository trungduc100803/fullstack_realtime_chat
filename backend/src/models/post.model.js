import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        userPost: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        caption: {
            type: String,
            default: ''
        },
        images: [
            {
                type: String,
                default: ''
            }
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ], 
        
    },
    { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
