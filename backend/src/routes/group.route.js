import express from "express";
import { addMemberToGroup, changeImageGroup, changeNameGroup, createGroup, deleteGroup, deleteMemberInGroup, getAllImageInGroup, getGroupForId, getGroupForUser, getUserForGroup } from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);
router.get("/get-group", protectRoute, getGroupForUser);
router.get("/get-group-for-id/:groupId", protectRoute, getGroupForId);
router.get("/get-image-in-group/:groupId", protectRoute, getAllImageInGroup);
router.get("/get-members-group/:groupId", protectRoute, getUserForGroup);
router.post("/add-member-group/:groupId", protectRoute, addMemberToGroup);
router.post("/delete-member-group/:groupId", protectRoute, deleteMemberInGroup);
router.delete("/delete-group/:groupId", protectRoute, deleteGroup);
router.put("/change-name-group/:groupId", protectRoute, changeNameGroup);
router.put("/change-image-group/:groupId", protectRoute, changeImageGroup);

export default router;
