const { sql, poolPromise } = require("./db");

async function createUsersTable() {
    try {
        const pool = await poolPromise;
        const query = `
            CREATE TABLE users (
                id INT IDENTITY(1,1) PRIMARY KEY,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) CHECK (role IN ('root', 'admin', 'operator')) NOT NULL
            );
        `;

        await pool.request().query(query);
        console.log("Users table created successfully.");
    } catch (err) {
        console.error("Error creating table:", err);
    }
}

// Run the function
createUsersTable();
