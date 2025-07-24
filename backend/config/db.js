// config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pratiksha#480',
  database: 'grievance_system'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database');
});

module.exports = db;