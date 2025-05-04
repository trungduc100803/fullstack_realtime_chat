import express from "express";
import { createGroup } from "../controllers/group.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-group", protectRoute, createGroup);

export default router;
