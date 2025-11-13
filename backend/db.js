require("dotenv").config();

const mysql = require("mysql2/promise");

const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingVars.length > 0) {
  console.error(`Missing required database environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number.parseInt(process.env.DB_POOL_SIZE || "10", 10),
  queueLimit: 0,
  port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT, 10) : undefined,
  decimalNumbers: true,
  dateStrings: true,
});

module.exports = pool;

