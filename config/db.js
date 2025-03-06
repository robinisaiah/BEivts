const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER,        // Database username
  password: process.env.DB_PASSWORD,    // Database password
  server: process.env.DB_SERVER,      // Server name or IP (Ensure it's a STRING)
  database: process.env.DB_NAME,    // Database name
  options: {
    encrypt: false,                 // Set true for Azure
    trustServerCertificate: true,   // Change to false if using a signed certificate
  },
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ Connected to SQL Server!");
    return pool;
  })
  .catch(err => {
    console.error("❌ Database connection failed! Error:", err);
  });

module.exports = { sql, poolPromise };
