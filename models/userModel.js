const { sql, poolPromise } = require("../config/db");

const getUserByEmail = async (email) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM users WHERE email = @email");
  return result.recordset[0];
};

module.exports = { getUserByEmail };
