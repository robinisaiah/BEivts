const { sql, poolPromise } = require("./db");
const bcrypt = require("bcryptjs");

async function insertUser(Name, username, password, role) {
    try {
        const pool = await poolPromise;
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, username, password, role)
            VALUES (@Name, @username, @password, @role);
        `;

        await pool.request()
            .input("name", sql.VarChar, Name)
            .input("username", sql.VarChar, username)
            .input("password", sql.VarChar, hashedPassword) // Hashed password
            .input("role", sql.VarChar, role)
            .query(query);

        console.log("User inserted successfully.");
    } catch (err) {
        console.error("Error inserting user:", err);
    }
}

// Example Usage
insertUser("Robin", "robin", "12345", "root");
