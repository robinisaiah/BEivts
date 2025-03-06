const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.ACCESS_SECRET || "ivts_access";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ivts_refresh";

const generateAccessToken = (user, rememberMe) => {
  
    if (!user || !user || user.length === 0) {
      throw new Error("Invalid user data: user recordset is undefined or empty");
  }
    return jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: rememberMe ? "7d" : "24h" } // If rememberMe is true, set expiration to 7 days; otherwise, 15 minutes
    );
  };

  const generateRefreshToken = (user) => jwt.sign({ id: user.recordset[0].id, username : user.recordset[0].username }, REFRESH_SECRET, { expiresIn: "30d" });

module.exports = { generateAccessToken, generateRefreshToken };
