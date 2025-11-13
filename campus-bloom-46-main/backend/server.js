require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const port = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.DATABASE_SSL === "false"
    ? {}
    : {
        ssl:
          process.env.NODE_ENV === "production" ||
          process.env.DATABASE_SSL === "true" ||
          process.env.DATABASE_URL.includes("supabase.co")
            ? { rejectUnauthorized: false }
            : undefined,
      }),
});

const initializeDatabase = async () => {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS event_participants (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          dept TEXT NOT NULL,
          year INTEGER NOT NULL CHECK (year >= 1 AND year <= 10),
          event_id UUID NOT NULL REFERENCES events(id),
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
    } catch (error) {
      if (error.code === "42P01") {
        console.warn("events table missing - creating event_participants without FK constraint");
        await pool.query(`
          CREATE TABLE IF NOT EXISTS event_participants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            dept TEXT NOT NULL,
            year INTEGER NOT NULL CHECK (year >= 1 AND year <= 10),
            event_id UUID NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("Failed to initialize database", error);
    throw error;
  }
};

const app = express();

app.use(cors());
app.use(bodyParser.json());

const eventsRouter = require("./routes/events")(pool);
const registerRouter = require("./routes/register")(pool);
const participantsRouter = require("./routes/participants")(pool);

app.use("/events", eventsRouter);
app.use("/register", registerRouter);
app.use("/participants", participantsRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error("Server failed to start", error);
    process.exit(1);
  }
};

startServer();

