const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'HARSHINI',
  password: process.env.DB_PASSWORD || 'Harshi@15102006',
  database: process.env.DB_NAME     || 'hackathon_db',
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool;
