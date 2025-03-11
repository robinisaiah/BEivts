import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.ACCESS_SECRET || "ivts_access";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ivts_refresh";

const generateAccessToken = (user) => {
  if (!user || Object.keys(user).length === 0) {
    throw new Error("Invalid user data: user recordset is undefined or empty");
  }
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "1m" } 
  );
};

const generateRefreshToken = (user) => {
  if (!user || !user.recordset || user.recordset.length === 0) {
    throw new Error("Invalid user data: user recordset is undefined or empty");
  }
  return jwt.sign(
    { id: user.recordset[0].id, username: user.recordset[0].username },
    REFRESH_SECRET,
    { expiresIn: "3m" }
  );
};

export { generateAccessToken, generateRefreshToken };
