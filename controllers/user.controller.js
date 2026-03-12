import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";
import jwt from "jsonwebtoken";

const forbiddenFields = ["_id", "createdAt", "updatedAt", "isDeleted"];

const SALT_ROUNDS = 10;

export const getUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password");
    res.json(users);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const getUserById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
};

export const createUser = async (req, res) => {
  try {

    const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

    const { nombre, email, password, role } = sanitizedBody;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "nombre, email y password son obligatorios" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = new User({
      nombre,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    const savedUser = await newUser.save();

    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .setOptions({ bypassDeleted: true });

    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    if (user.isDeleted) {
      return res.status(403).json({ error: "Usuario deshabilitado" });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        nombre: user.nombre,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};