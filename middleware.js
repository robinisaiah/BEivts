const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.user = { id: verified.id, username: verified.username }; // Store id and username in req.user
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
}

module.exports = authMiddleware;
