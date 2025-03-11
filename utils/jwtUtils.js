import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "ivts_access";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "ivts_refresh";

const generateAccessToken = (user) => {
  if (!user || Object.keys(user).length === 0) {
    throw new Error("Invalid user data: user recordset is undefined or empty");
  }
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
};

const generateRefreshToken = (user) => {
  if (!user || !user.recordset || user.recordset.length === 0) {
    throw new Error("Invalid user data: user recordset is undefined or empty");
  }
  return jwt.sign(
    {
      id: user.recordset[0].id,
      username: user.recordset[0].username,
      role: user.recordset[0].role,
    },
    REFRESH_SECRET,
    { expiresIn: "24h" }
  );
};

export { generateAccessToken, generateRefreshToken };
