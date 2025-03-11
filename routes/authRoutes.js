import express from "express";
import { logIn, logOut, refreshToken } from "../controllers/Auth/AuthController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();

// ✅ Login route
router.post("/login", logIn);

// ✅ Logout with auth check
router.post("/logout", authMiddleware, roleMiddleware(["ADMIN", "root"]), logOut);

// ✅ Refresh token (Optional: Add authMiddleware if needed)
router.post("/refresh-token", refreshToken);

export default router;
