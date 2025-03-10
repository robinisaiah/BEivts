import express from "express";
import { getUsers, addUser, updateUser, deleteUser, resetPassword } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.post("/", authMiddleware, addUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.post("/:id/reset-password", authMiddleware, resetPassword);

export default router;