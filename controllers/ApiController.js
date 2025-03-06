const { sql, poolPromise } = require("../config/db");
const HOST = process.env.APP_HOST;
const PORT = process.env.APP_PORT;

const getIvtsOpretorUrl = async (req, res) => {
    const getIvtsOpretorUrl = `${HOST}:${PORT}`;
    res.json(getIvtsOpretorUrl);
};

module.exports = { getIvtsOpretorUrl };