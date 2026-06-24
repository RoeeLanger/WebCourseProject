// MySQL connection. Uses a connection pool (a drop-in for createConnection with
// the same callback .query() API) so the app survives idle timeouts that would
// kill a single long-lived connection.
const mysql = require("mysql2");
const dbConfig = require("./db.config.js");

const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: 10,
  // Return DATETIME columns as literal "YYYY-MM-DD HH:MM:SS" strings (wall-clock),
  // so meeting times and join dates don't drift through UTC conversion.
  dateStrings: true
});

module.exports = connection;
