import express from "express";
import {  getIvtsOpretorUrl } from "../controllers/ApiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";


const router = express.Router();

router.get("/getIvtsOpretorUrl", authMiddleware, roleMiddleware(["OPERATOR"]), getIvtsOpretorUrl);

export default router;