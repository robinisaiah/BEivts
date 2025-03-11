import express from "express";
import { getUsers, addUser, updateUser, deleteUser, resetPassword } from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware(["ADMIN", "root"]), getUsers);
router.post("/", authMiddleware, roleMiddleware(["ADMIN", "root"]), addUser);
router.put("/:id", authMiddleware, roleMiddleware(["ADMIN", "root"]), updateUser);
router.delete("/:id", authMiddleware, roleMiddleware(["ADMIN", "root"]), deleteUser);
router.post("/:id/reset-password", authMiddleware, roleMiddleware(["ADMIN", "root"]), resetPassword);

export default router;