const express = require("express");
const { logIn,logOut } = require("../controllers/Auth/AuthController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", logIn);
router.post("/logout", authMiddleware, logOut);


module.exports = router;
