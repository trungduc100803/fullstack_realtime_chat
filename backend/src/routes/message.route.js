import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptAddFriend, addFriend, cancelAddFriend, checkFriend, deleteFriend, getMessages, getMessagesGroups, getNotifyAddFriend, getUserById, getUserForName, getUsersForSidebar, searchUser, sendMessage, sendMessageGroup, searchMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/user-for-name/:name", protectRoute, getUserForName);
router.get("/getUser/:id", protectRoute, getUserById);
router.post("/searchUser", protectRoute, searchUser);
router.post("/addfriend", protectRoute, addFriend);
router.post("/cancelAddfriend", protectRoute, cancelAddFriend);
router.get("/getNotiAddFriend", protectRoute, getNotifyAddFriend);
router.post("/acceptAddfriend", protectRoute, acceptAddFriend);
router.post("/checkfriend", protectRoute, checkFriend);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/delete-friend", protectRoute, deleteFriend);

router.get("/group/:id", protectRoute, getMessagesGroups);
router.post("/send/group/:id", protectRoute, sendMessageGroup);
router.get("/search-message/:keyword", protectRoute, searchMessage);

export default router;
