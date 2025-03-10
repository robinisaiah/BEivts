import express from "express";
import { getFilteredSessions, getAllSessions } from "../controllers/SessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/usersSessionsData",authMiddleware, getFilteredSessions);
router.get("/", authMiddleware, getAllSessions);

export default router;