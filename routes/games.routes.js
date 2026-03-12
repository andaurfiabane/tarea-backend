import express from "express";
import {
  getGames,
  getGameById,
  createGame,
  deleteGame,
  patchGame
} from "../controllers/game.controller.js";

import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", getGames);
router.get("/:id", getGameById);

router.post("/", authenticate, createGame);
router.patch("/:id", authenticate, patchGame);
router.delete("/:id", authenticate, deleteGame);

export default router;