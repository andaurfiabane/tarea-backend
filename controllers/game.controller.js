import mongoose from "mongoose";
import Game from "../models/Game.js";
import Console from "../models/Console.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const forbiddenFields = ["_id", "isDeleted", "createdAt", "updatedAt", "user"];

export const getGames = asyncHandler(async (req, res) => {

  const games = await Game.find()
    .populate("console", "nombre")
    .populate("user", "nombre");

  res.json(games);

});

export const getGameById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const game = await Game.findById(id)
    .populate("console", "nombre")
    .populate("user", "nombre");

  if (!game) {
    const error = new Error("Juego no encontrado");
    error.status = 404;
    throw error;
  }

  res.json(game);

});

export const createGame = asyncHandler(async (req, res) => {

  const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

  const { console } = sanitizedBody;

  if (!mongoose.Types.ObjectId.isValid(console)) {
    const error = new Error("Console inválida");
    error.status = 400;
    throw error;
  }

  const consoleExists = await Console.findById(console);

  if (!consoleExists) {
    const error = new Error("La consola no existe");
    error.status = 400;
    throw error;
  }

  const newGame = new Game({
    ...sanitizedBody,
    user: req.user.id
  });

  const savedGame = await newGame.save();

  res.status(201).json(savedGame);

});

export const deleteGame = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const game = await Game.findById(id);

  if (!game) {
    const error = new Error("Juego no encontrado");
    error.status = 404;
    throw error;
  }

  if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
    const error = new Error("No autorizado");
    error.status = 403;
    throw error;
  }

  await Game.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      returnDocument: "after",
      runValidators: true
    }
  );

  res.json({ message: "Juego eliminado correctamente (soft delete)" });

});

export const patchGame = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const game = await Game.findById(id);

  if (!game) {
    const error = new Error("Juego no encontrado");
    error.status = 404;
    throw error;
  }

  if (game.user.toString() !== req.user.id && req.user.role !== "admin") {
    const error = new Error("No autorizado");
    error.status = 403;
    throw error;
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

});