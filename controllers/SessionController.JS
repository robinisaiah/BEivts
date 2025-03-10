import { sql, poolPromise } from "../config/db.js";
import dayjs from "dayjs";
import { format } from "date-fns";

const getFilteredSessions = async (req, res) => {
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

        if (name) {
            query += ` AND u.name LIKE @name`;
            request.input("name", `%${name}%`);
        }

        if (fromDate && toDate) {
            query += ` AND us.login_time BETWEEN @fromDate AND @toDate`;
            request.input("fromDate", new Date(fromDate));
            request.input("toDate", new Date(toDate));
        }

        query += ` ORDER BY us.login_time ASC;`;
        request.query(query);

        request.on("row", (row) => {
            if (row.login_time) {

                const formatDateTime = (date) => dayjs(date).format("YYYY-MM-DD, HH:mm");
                console.log(format)

                const loginTime = new Date(row.login_time);
                const logoutTime = row.logout_time ? new Date(row.logout_time) : null;

                let durationString = null;
                if (logoutTime) {
                    let durationMs = logoutTime - loginTime;
                    const hours = Math.floor(durationMs / (1000 * 60 * 60));
                    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    durationString = `${hours} : ${minutes}`;
                }

                row.duration = durationString;
                row.login_time = formatDateTime(loginTime);
                row.logout_time = logoutTime ? formatDateTime(logoutTime) : null;
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
};

const getAllSessions = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM user_sessions");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export { getFilteredSessions, getAllSessions };
