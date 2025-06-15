import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fs from "fs";
import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import postRoutes from "./routes/post.route.js";
import commentRoutes from "./routes/comment.route.js";
import notifyRoutes from "./routes/notify.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.urlencoded({ limit: '50mb' }));
app.use("/uploads", express.static("uploads")); // phục vụ ảnh tĩnh

app.use(
  // cors({
  //   origin: "http://localhost:5173",
  //   credentials: true,
  // })
  cors({
    origin: [
      "http://localhost:5173",
      "http://192.168.1.10:5173" // 👈 thêm IP của máy bạn
    ],
    credentials: true,
  })  
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notifyRoutes);

// Tạo thư mục 'uploads' nếu chưa có
const uploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
  console.log("Đã tạo thư mục uploads/");
}

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// server.listen(PORT, () => {
//   console.log("server is running on PORT:" + PORT);
//   connectDB();
// });

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 Server running on http://192.168.1.10:${PORT}`);
  connectDB();
});
// 0.0.0.0 giúp server chấp nhận kết nối từ các máy khác trong mạng LAN.