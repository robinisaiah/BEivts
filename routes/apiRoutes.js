const express = require("express");
const {  getIvtsOpretorUrl } = require("../controllers/ApiController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/getIvtsOpretorUrl", authMiddleware, getIvtsOpretorUrl);

module.exports = router;
