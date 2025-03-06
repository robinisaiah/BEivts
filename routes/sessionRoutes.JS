const express = require("express");
const { getFilteredSessions, getAllSessions } = require("../controllers/SessionController.JS");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/usersSessionsData",authMiddleware, getFilteredSessions);
router.get("/", authMiddleware, getAllSessions);

module.exports = router;
