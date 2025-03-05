const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { sql, poolPromise } = require("./db");
const authMiddleware = require("./middleware");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
const HOST = process.env.APP_HOST;
const PORT = process.env.APP_PORT;
app.use(express.json());
app.use(cors({ origin: `http://localhost:3000`, credentials: true }));

const SECRET_KEY = process.env.ACCESS_SECRET || "access_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";



app.get("/filteredUsersSessionsData", async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Validate the date parameters
    if (!fromDate || !toDate) {
      return res.status(400).json({ error: "Both fromDate and toDate are required" });
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.stream = true;

    const usersMap = {}; // Object for storing unique users
    const formattedData = [];

    // Query to filter sessions based on login_time between fromDate and toDate
    request.query(
      `SELECT u.id, u.name, us.login_time, us.logout_time 
       FROM users u 
       LEFT JOIN user_sessions us ON u.id = us.user_id 
       WHERE us.login_time BETWEEN @fromDate AND @toDate`
    );

    // Add parameters for the date range
    request.input('fromDate', new Date(fromDate));
    request.input('toDate', new Date(toDate));

    request.on("row", (row) => {
      if (!usersMap[row.id]) {
        usersMap[row.id] = {
          id: row.id,
          name: row.name,
          sessions: [],
        };
        formattedData.push(usersMap[row.id]); // Push reference to array
      }

      // Add session only if login_time is not null
      if (row.login_time) {
        usersMap[row.id].sessions.push({
          login_time: row.login_time,
          logout_time: row.logout_time,
        });
      }
    });

    request.on("error", (err) => {
      console.error("Query Error:", err);
      res.status(500).json({ error: "Database query failed" });
    });

    request.on("done", () => {
      res.json(formattedData);
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/usersSessionsData", async (req, res) => {
  try {
    const pool = await poolPromise;
    const request = pool.request();
    request.stream = true;
    let { name, fromDate, toDate } = req.query;
    let formattedData = [];
    
    let query = `
    SELECT u.id, u.name, us.login_time, us.logout_time 
    FROM users u 
    LEFT JOIN user_sessions us ON u.id = us.user_id 
    WHERE us.login_time IS NOT NULL
  `;

  // Apply filters dynamically
  if (name) {
    query += ` AND u.name LIKE @name`;
    request.input("name", `%${name}%`);
  }

  if (fromDate) {
    query += ` AND us.login_time >= @fromDate`;
    request.input("fromDate", new Date(fromDate));
  }

  if (toDate) {
    query += ` AND us.login_time <= @toDate`;
    request.input("toDate", new Date(toDate));
  }

  query += ` ORDER BY us.login_time ASC;`;
  request.query(query);

    request.on("row", (row) => {
      if (row.login_time) {
          const loginTime = new Date(row.login_time);
          const logoutTime = row.logout_time ? new Date(row.logout_time) : null; // Handle null case
          let durationString = null;
  
          if (logoutTime) {
              let durationMs = logoutTime - loginTime; // Duration in milliseconds
  
              // Convert duration to hours and minutes
              const hours = Math.floor(durationMs / (1000 * 60 * 60));
              const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  
              // Format duration string
              durationString = `${hours} : ${minutes}`;
          }
  
          // Assign duration to the row object
          row.duration = durationString;
          
          // Format login_time
          row.login_time = `${loginTime.getFullYear()}-${String(loginTime.getMonth() + 1).padStart(2, '0')}-${String(loginTime.getDate()).padStart(2, '0')}, ${String(loginTime.getHours()).padStart(2, '0')}:${String(loginTime.getMinutes()).padStart(2, '0')}`;
          
          // Format logout_time only if it's not null
          row.logout_time = logoutTime
              ? `${logoutTime.getFullYear()}-${String(logoutTime.getMonth() + 1).padStart(2, '0')}-${String(logoutTime.getDate()).padStart(2, '0')}, ${String(logoutTime.getHours()).padStart(2, '0')}:${String(logoutTime.getMinutes()).padStart(2, '0')}`
              : null;
      }
  
      formattedData.push(row);
  });
  
  
    
    request.on("error", (err) => {
      console.error("Query Error:", err);
      res.status(500).json({ error: "Database query failed" });
    });
    
    request.on("done", () => {
      res.json(formattedData);
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.get("/users", authMiddleware, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.get("/getIvtsOpretorUrl", authMiddleware, async(req, res) => {
  const getIvtsOpretorUrl = `${HOST}:${PORT}`;
  res.json(getIvtsOpretorUrl);
})

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

const generateAccessToken = (user, rememberMe) => {
  
  if (!user || !user || user.length === 0) {
    throw new Error("Invalid user data: user recordset is undefined or empty");
}
  return jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: rememberMe ? "7d" : "15m" } // If rememberMe is true, set expiration to 7 days; otherwise, 15 minutes
  );
};

const generateRefreshToken = (user) => jwt.sign({ id: user.recordset[0].id, username : user.recordset[0].username }, REFRESH_SECRET, { expiresIn: "30d" });

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

    const accessToken = generateAccessToken({id: user.recordset[0].id, user_name : user.recordset[0].username }, rememberMe);
    const refreshToken = generateRefreshToken(user);
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "strict" });
    await pool
      .request()
      .input("user_id", sql.Int, user.recordset[0].id)
      .query("INSERT INTO user_sessions (user_id, login_time) VALUES (@user_id, GETDATE())");

    res.json({ message: "Login Successful", accessToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

  jwt.verify(refreshToken, REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    console.log("Decoded User:", user);
    const accessToken = generateAccessToken({id: user.id, user_name: user.username }, false);
    res.json({ accessToken });
  });
});

app.post("/logout", authMiddleware, async (req, res) => {
  try {
    const token =  req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
});





// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
