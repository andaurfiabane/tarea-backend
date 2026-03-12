import express from "express";
import {
  getUsers,
  getUserById

} from "../controllers/user.controller.js";

import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authenticate, requireAdmin, getUsers);
router.get("/:id", authenticate, requireAdmin, getUserById);

export default router;