import mongoose from "mongoose";
import Console from "../models/Console.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";

const forbiddenFields = ["_id", "isDeleted", "createdAt", "updatedAt"];

export const getConsoles = async (req, res) => {
  try {

    const consoles = await Console.find();
    res.json(consoles);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener las consolas" });
  }
};

export const getConsoleById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const consoleItem = await Console.findById(id);

    if (!consoleItem) {
      return res.status(404).json({ error: "Consola no encontrada" });
    }

    res.json(consoleItem);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createConsole = async (req, res) => {
  try {

    const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

    const newConsole = new Console(sanitizedBody);
    const savedConsole = await newConsole.save();

    res.status(201).json(savedConsole);

  } catch (err) {
    res.status(400).json({ error: "Error al crear la consola" });
  }
};

export const deleteConsole = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
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
      return res.status(404).json({ error: "Consola no encontrada" });
    }

    res.json({ message: "Consola eliminada correctamente (soft delete)" });

  } catch (err) {
    res.status(500).json({ error: "Error al eliminar la consola" });
  }
};

export const patchConsole = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
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
      return res.status(404).json({ error: "Consola no encontrada" });
    }

    res.json(consoleItem);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};