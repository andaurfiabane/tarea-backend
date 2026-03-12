import express from "express";
import consolesRoutes from "./routes/consoles.routes.js";
import usersRoutes from "./routes/users.routes.js";
import gamesRoutes from "./routes/games.routes.js";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./config/database.js";
import dotenv from "dotenv";
import { errorHandler } from "./middlewares/errorHandler.js";


dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no está definido en el .env");
}

await connectDB();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/consoles", consolesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  const error = new Error("Ruta no encontrada");
  error.status = 404;
  next(error);
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});