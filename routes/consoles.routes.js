import express from "express";
import {
  getConsoles,
  getConsoleById,
  createConsole,
  deleteConsole,
  patchConsole
} from "../controllers/console.controller.js";

import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getConsoles);
router.get("/:id", getConsoleById);

router.post("/", authenticate, requireAdmin, createConsole);
router.patch("/:id", authenticate, requireAdmin, patchConsole);
router.delete("/:id", authenticate, requireAdmin, deleteConsole);

export default router;