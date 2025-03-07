const express = require("express");
const { getUsers, addUser, updateUser, deleteUser, resetPassword } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.post("/", authMiddleware, addUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.post("/:id/reset-password", authMiddleware, resetPassword);

module.exports = router;
