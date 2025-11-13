const express = require("express");

module.exports = (pool) => {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT
          id,
          title,
          description,
          category,
          status,
          venue,
          event_date,
          event_time
        FROM events
        ORDER BY event_date ASC, title ASC
      `);

      const formatted = rows.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        status: event.status,
        venue: event.venue,
        date: event.event_date,
        time: event.event_time,
      }));

      res.json(formatted);
    } catch (error) {
      console.error("Failed to fetch events", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  return router;
};
