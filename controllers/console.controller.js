import mongoose from "mongoose";
import Console from "../models/Console.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const forbiddenFields = ["_id", "isDeleted", "createdAt", "updatedAt"];

export const getConsoles = asyncHandler(async (req, res) => {

  const consoles = await Console.find();
  res.json(consoles);

});

export const getConsoleById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const consoleItem = await Console.findById(id);

  if (!consoleItem) {
    const error = new Error("Consola no encontrada");
    error.status = 404;
    throw error;
  }

  res.json(consoleItem);

});

export const createConsole = asyncHandler(async (req, res) => {

  const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

  const newConsole = new Console(sanitizedBody);
  const savedConsole = await newConsole.save();

  res.status(201).json(savedConsole);

});

export const deleteConsole = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const deletedConsole = await Console.findByIdAndUpdate(
    id,
    { isDeleted: true },
    {
      returnDocument: "after",
      runValidators: true
    }
  );

  if (!deletedConsole) {
    const error = new Error("Consola no encontrada");
    error.status = 404;
    throw error;
  }

  res.json({ message: "Consola eliminada correctamente (soft delete)" });

});

export const patchConsole = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

  const consoleItem = await Console.findByIdAndUpdate(
    id,
    sanitizedBody,
    {
      returnDocument: "after",
      runValidators: true,
      context: "query"
    }
  );

  if (!consoleItem) {
    const error = new Error("Consola no encontrada");
    error.status = 404;
    throw error;
  }

  res.json(consoleItem);

});