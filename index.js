const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sql, poolPromise } = require("./db");
const authMiddleware = require("./middleware");
const cors = require("cors");

const app = express();
const HOST = "192.168.0.204";
const PORT = 4000;
app.use(express.json());
app.use(cors({ origin: `http://localhost:3000`, credentials: true }));

app.get("/users", authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});


// Add a new user
app.post("/users", authMiddleware, async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const pool = await poolPromise;
    const existingUser = await pool.request()
      .input("username", sql.NVarChar, username)
      .query("SELECT COUNT(*) AS count FROM users WHERE username = @username");

    if (existingUser.recordset[0].count > 0) {
      return res.status(400).send({ error: "Username already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("password", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .input("username", sql.NVarChar, username)
      .query("INSERT INTO users (name, password, role, username) VALUES (@name, @password, @role, @username)");
    res.status(201).send({ message: "User added successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Update user
app.put("/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, username, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .query("UPDATE users SET name = @name, username = @username, password = @password, role = @role WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

// Delete user
app.delete("/users/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM users WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const pool = await poolPromise;
    const user = await pool
      .request()
      .input("username", sql.VarChar, username)
      .query("SELECT * FROM users WHERE username = @username");

    if (user.recordset.length === 0) {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }

    const validPassword = await bcrypt.compare(password, user.recordset[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid Username or Password" });
    }

    const userId = user.recordset[0].id;

    const expiresIn = rememberMe ? "7d" : "1h";
    const token = jwt.sign(
      { id: userId, username : user.recordset[0].username},
      process.env.JWT_SECRET,
      { expiresIn }
    );

    

    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .query("INSERT INTO user_sessions (user_id, login_time) VALUES (@user_id, GETDATE())");

    res.json({ message: "Login Successful", token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token =  req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const pool = await poolPromise;
    await pool
      .request()
      .input("user_id", sql.Int, userId)
      .input("token", sql.VarChar, token)
      .query("WITH LatestSession AS (SELECT TOP 1 id FROM user_sessions WHERE user_id = @user_id ORDER BY login_time DESC) UPDATE user_sessions SET logout_time = GETDATE() WHERE id IN (SELECT id FROM LatestSession)");

    res.json({ message: "Logout Successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
