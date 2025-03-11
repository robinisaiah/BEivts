import express from "express";
import { getFilteredSessions, getAllSessions } from "../controllers/SessionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get("/usersSessionsData",authMiddleware, roleMiddleware(["ADMIN", 'root']), getFilteredSessions);
router.get("/", authMiddleware, getAllSessions);

export default router;