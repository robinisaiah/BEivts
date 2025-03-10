import { sql, poolPromise } from "../../config/db.js";
import bcrypt from "bcryptjs";
import {  generateAccessToken, generateRefreshToken } from "../../utils/jwtUtils.js";
import jwt from "jsonwebtoken";

const logIn = async (req, res) => {
  try {
      const { username, password, rememberMe } = req.body;
      
      const pool = await poolPromise;
      const user = await pool
        .request()
        .input("username", sql.VarChar, username)
        .query("SELECT * FROM users WHERE username = @username");
  
      if (user.recordset.length === 0) {
        return res.status(401).json({ message: "Invalid Username or Password" });
      }
  
      const validPassword = await bcrypt.compare(password, user.recordset[0].password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid Username or Password" });
      }
  
      const accessToken = generateAccessToken({id: user.recordset[0].id, user_name : user.recordset[0].username, role: user.recordset[0].role });
      const refreshToken = generateRefreshToken(user);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, 
        sameSite: "strict",
      });
      await pool
        .request()
        .input("user_id", sql.Int, user.recordset[0].id)
        .query("INSERT INTO user_sessions (user_id, login_time) VALUES (@user_id, GETDATE())");
  
      res.json({ message: "Login Successful", accessToken, role: user.recordset[0].role });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
};

const logOut = async(req, res) => {
    try {
    
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        const userId = decoded.id;
    
        const pool = await poolPromise;
        await pool
          .request()
          .input("user_id", sql.Int, userId)
          .input("token", sql.VarChar, token)
          .query("WITH LatestSession AS (SELECT TOP 1 id FROM user_sessions WHERE user_id = @user_id ORDER BY login_time DESC) UPDATE user_sessions SET logout_time = GETDATE() WHERE id IN (SELECT id FROM LatestSession)");
          res.clearCookie("refreshToken");
        res.json({ message: "Logout Successful" });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    
}

 const refreshToken = (req, res) => {
  console.log(req.cookies.refreshToken);
  const { refreshToken } = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const newAccessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  });
};

export { logIn, logOut, refreshToken  };
