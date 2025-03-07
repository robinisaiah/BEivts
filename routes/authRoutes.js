const express = require("express");
const { logIn, logOut, refreshToken } = require("../controllers/Auth/AuthController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", logIn);
router.post("/logout", authMiddleware, logOut);
router.post("/refresh-token", refreshToken);


module.exports = router;
