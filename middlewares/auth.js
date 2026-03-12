import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    const error = new Error("Token requerido");
    error.status = 401;
    return next(error);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    const error = new Error("Token inválido");
    error.status = 401;
    return next(error);
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (err) {

    const error = new Error("Token inválido");
    error.status = 401;
    next(error);

  }

};

export const requireAdmin = (req, res, next) => {

  if (!req.user || req.user.role !== "admin") {
    const error = new Error("No tienes los permisos necesarios para realizar esta acción");
    error.status = 403;
    return next(error);
  }

  next();

};