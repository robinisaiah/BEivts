import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import morgan from "morgan"; // ✅ Optional: Logging requests



dotenv.config();

import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes from "./routes/apiRoutes.js";

const app = express();

// ✅ Middleware
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ Handle form data
app.use(cookieParser());
app.use(morgan("dev")); // ✅ Log HTTP requests

// ✅ Improved CORS (Use env variable)
const allowedOrigins = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

// ✅ Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
