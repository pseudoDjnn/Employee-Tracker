const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "!NaPHtHYloxy07131988",
  database: "template",
});

module.exports = db;
