const express = require("express");

module.exports = (pool) => {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    try {
      const { rows } = await pool.query(`
        SELECT
          p.id,
          p.name,
          p.dept,
          p.year,
          p.event_id,
          p.created_at,
          e.title AS event_title,
          e.event_date
        FROM event_participants p
        LEFT JOIN events e ON e.id = p.event_id
        ORDER BY p.created_at DESC
      `);

      res.json(rows);
    } catch (error) {
      console.error("Failed to fetch participants", error);
      res.status(500).json({ error: "Failed to fetch participants" });
    }
  });

  return router;
};

