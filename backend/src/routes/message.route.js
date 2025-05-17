import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptAddFriend, addFriend, cancelAddFriend, checkFriend, getMessages, getMessagesGroups, getNotifyAddFriend, getUserById, getUserForName, getUsersForSidebar, searchUser, sendMessage, sendMessageGroup } from "../controllers/message.controller.js";

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

router.get("/group/:id", protectRoute, getMessagesGroups);
router.post("/send/group/:id", protectRoute, sendMessageGroup);

export default router;
