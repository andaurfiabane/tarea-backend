import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { sanitizeUpdate } from "../services/sanitizeUpdate.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const forbiddenFields = ["_id", "createdAt", "updatedAt", "isDeleted"];

const SALT_ROUNDS = 10;

export const getUsers = asyncHandler(async (req, res) => {

  const users = await User.find().select("-password");
  res.json(users);

});

export const getUserById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("ID inválido");
    error.status = 400;
    throw error;
  }

  const user = await User.findById(id).select("-password");

  if (!user) {
    const error = new Error("Usuario no encontrado");
    error.status = 404;
    throw error;
  }

  res.json(user);

});

export const createUser = asyncHandler(async (req, res) => {

  const sanitizedBody = sanitizeUpdate(req.body, forbiddenFields);

  const { nombre, email, password, role } = sanitizedBody;

  if (!nombre || !email || !password) {
    const error = new Error("nombre, email y password son obligatorios");
    error.status = 400;
    throw error;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("El email ya está registrado");
    error.status = 409;
    throw error;
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

});

export const loginUser = asyncHandler(async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email })
    .select("+password")
    .setOptions({ bypassDeleted: true });

  if (!user) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
  }

  if (user.isDeleted) {
    const error = new Error("Usuario deshabilitado");
    error.status = 403;
    throw error;
  }

  const passwordValid = await bcrypt.compare(password, user.password);

  if (!passwordValid) {
    const error = new Error("Credenciales inválidas");
    error.status = 401;
    throw error;
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

});