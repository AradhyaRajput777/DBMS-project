const express = require("express");

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

    try {
      const result = await pool.query(
        `
          INSERT INTO event_participants (name, dept, year, event_id)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, dept, year, event_id, created_at
        `,
        [name.trim(), dept.trim(), parsedYear, eventId]
      );

      res.status(201).json({ message: "Registration successful", participant: result.rows[0] });
    } catch (error) {
      console.error("Failed to register participant", error);
      if (error.code === "23503") {
        return res.status(400).json({ error: "Invalid event_id" });
      }
      res.status(500).json({ error: "Failed to register participant" });
    }
  });

  return router;
};

