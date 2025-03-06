const { sql, poolPromise } = require("../db");

async function createUsersTable() {
    try {
        const pool = await poolPromise;
        const query = `
           CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Store hashed passwords
    role VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);
        `;

        await pool.request().query(query);
        const query1 = `
            CREATE TABLE user_sessions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    login_time DATETIME DEFAULT GETDATE(),
     logout_time DATETIME,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
        `;

        await pool.request().query(query1);
        console.log("Users table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }
}

// Run the function
createUsersTable();
