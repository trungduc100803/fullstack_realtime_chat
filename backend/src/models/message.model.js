import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    text: {
      type: String,
    },
     iv: {
      type: String,
    },
    image: {
      type: String,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    file: { type: String },         // ✅ Thêm link file
    fileType: { type: String },     // ✅ Thêm MIME type
    fileName: { type: String },     // ✅ Thêm MIME type
    fileSize: { type: Number },     // ✅ Thêm MIME type
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
