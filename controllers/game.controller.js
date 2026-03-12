import mongoose from "mongoose";
import Game from "../models/Game.js";
import Console from "../models/Console.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";

const forbiddenFields = ["_id", "isDeleted", "createdAt", "updatedAt", "user"];

export const getGames = async (req, res) => {
  try {

    const games = await Game.find()
      .populate("console", "nombre")
      .populate("user", "nombre");

    res.json(games);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener los juegos" });
  }
};

export const getGameById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const game = await Game.findById(id)
      .populate("console", "nombre")
      .populate("user", "nombre");

    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    res.json(game);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createGame = async (req, res) => {
  try {

    const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

    const { console } = sanitizedBody;

    if (!mongoose.Types.ObjectId.isValid(console)) {
      return res.status(400).json({ error: "Console inválida" });
    }

    const consoleExists = await Console.findById(console);

    if (!consoleExists) {
      return res.status(400).json({ error: "La consola no existe" });
    }

    const newGame = new Game({
      ...sanitizedBody,
      user: req.user.id
    });

    const savedGame = await newGame.save();

    res.status(201).json(savedGame);

  } catch (err) {
    res.status(400).json({ error: "Error al crear el juego" });
  }
};

export const deleteGame = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const deletedGame = await Game.findByIdAndUpdate(
      id,
      { isDeleted: true },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    res.json({ message: "Juego eliminado correctamente (soft delete)" });

  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el juego" });
  }
};

export const patchGame = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }

    const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

    const updatedGame = await Game.findByIdAndUpdate(
      id,
      sanitizedBody,
      {
        returnDocument: "after",
        runValidators: true,
        context: "query"
      }
    );

    res.json(updatedGame);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};