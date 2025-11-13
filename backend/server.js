require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const pool = require("./db");

const port = process.env.PORT || 5000;

const initializeDatabase = async () => {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id CHAR(36) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'upcoming',
        venue VARCHAR(255) NOT NULL,
        event_date DATE NOT NULL,
        event_time TIME,
        max_participants INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS event_participants (
        id CHAR(36) NOT NULL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dept VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        event_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_year CHECK (year >= 1 AND year <= 10),
        CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES events(id)
      )
    `);
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
