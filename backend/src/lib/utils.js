// import jwt from "jsonwebtoken";

// export const generateToken = (userId, res) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//   });

//   res.cookie("jwt", token, {
//     maxAge: 7 * 24 * 60 * 60 * 1000, // MS
//     httpOnly: true, // prevent XSS attacks cross-site scripting attacks
//     sameSite: "strict", // CSRF attacks cross-site request forgery attacks
//     secure: process.env.NODE_ENV !== "development",
//   });

//   return token;
// };
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    httpOnly: true,                 // Bảo mật XSS
    sameSite: isProduction ? "strict" : "lax", // Tránh lỗi trong dev
    secure: isProduction,          // ❗️ Không dùng secure nếu là localhost hoặc LAN
  });

  return token;
};
