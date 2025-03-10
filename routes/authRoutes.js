import express from "express";
import { logIn, logOut, refreshToken } from "../controllers/Auth/AuthController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", logIn);
router.post("/logout", authMiddleware, logOut);
router.post("/refresh-token", refreshToken);


export default router;