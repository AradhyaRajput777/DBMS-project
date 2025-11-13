const express = require("express");
const { randomUUID } = require("crypto");

module.exports = (pool) => {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { name, dept, year, event_id: eventId } = req.body || {};

    if (!name || !dept || !year || !eventId) {
      return res.status(400).json({ error: "name, dept, year, and event_id are required" });
    }

    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear) || parsedYear < 1 || parsedYear > 10) {
      return res.status(400).json({ error: "year must be an integer between 1 and 10" });
    }

    const participantId = randomUUID();

    try {
      await pool.execute(
        `
          INSERT INTO event_participants (id, name, dept, year, event_id)
          VALUES (?, ?, ?, ?, ?)
        `,
        [participantId, name.trim(), dept.trim(), parsedYear, eventId]
      );

      const [rows] = await pool.execute(
        `
          SELECT id, name, dept, year, event_id, created_at
          FROM event_participants
          WHERE id = ?
        `,
        [participantId]
      );

      const participant = rows[0];

      if (!participant) {
        console.error("Participant inserted but not found when querying back", { participantId });
        return res.status(500).json({ error: "Failed to register participant" });
      }

      res.status(201).json({ message: "Registration successful", participant });
    } catch (error) {
      console.error("Failed to register participant", error);

      if (error.code === "ER_NO_REFERENCED_ROW_2" || error.code === "ER_NO_REFERENCED_ROW") {
        return res.status(400).json({ error: "Invalid event_id" });
      }

      if (error.code === "ER_CHECK_CONSTRAINT_VIOLATED" || error.code === "ER_WARN_DATA_OUT_OF_RANGE") {
        return res.status(400).json({ error: "Invalid data provided" });
      }

      res.status(500).json({ error: "Failed to register participant" });
    }
  });

  return router;
};
