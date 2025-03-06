const { sql, poolPromise } = require("../config/db");
const bcrypt = require("bcryptjs");

const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const addUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  try {
    const pool = await poolPromise;
    const existingUser = await pool.request()
    .input("username", sql.NVarChar, username)
    .query("SELECT * FROM users WHERE username = @username");
    if (existingUser.recordset.length > 0) {
      return res.status(400).send({ error: "Username already taken. Please choose another one." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, hashedPassword)
      .input("role", sql.NVarChar, role)
      .query("INSERT INTO users (name, username, password, role) VALUES (@name, @username, @password, @role)");
    res.status(201).send({ message: "User added successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, username, role } = req.body;
  try {
    const pool = await poolPromise;
    const existingUser = await pool.request()
    .input("username", sql.NVarChar, username)
    .query("SELECT * FROM users WHERE username = @username");
    if (existingUser.recordset.length > 0) {
      return res.status(400).send({ error: "Username already taken. Please choose another one." });
    }
    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("name", sql.NVarChar, name)
      .input("username", sql.NVarChar, username)
      .input("role", sql.NVarChar, role)
      .query("UPDATE users SET name = @name, username = @username, role = @role WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send({ message: "User not found" });
    }
    res.send({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request().input("id", sql.Int, id).query("DELETE FROM users WHERE id = @id");
    if (result.rowsAffected[0] === 0) return res.status(404).send({ message: "User not found" });
    res.send({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

module.exports = { getUsers, addUser, updateUser, deleteUser };
