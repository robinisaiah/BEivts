import express from "express";
import {  getIvtsOpretorUrl } from "../controllers/ApiController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/getIvtsOpretorUrl", authMiddleware, getIvtsOpretorUrl);

export default router;