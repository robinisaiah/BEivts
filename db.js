const sql = require("mssql");
require("dotenv").config();

// MSSQL Database Configuration
const dbConfig = {
    user: "sa",
    password: "12345",
    server: "DESKTOP-PT1MGKG", // Example: "localhost" or "127.0.0.1"
    database: "ivts",
    options: {
        encrypt: false, // Set to true if using Azure SQL
        enableArithAbort: true,
    },
};

// Connect to MSSQL Database
const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log("Connected to MSSQL Database");
        return pool;
    })
    .catch(err => console.error("Database Connection Failed: ", err));

module.exports = {
    sql,
    poolPromise
};
