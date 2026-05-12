const router = require('express').Router();
const db = require('../db');

// GET /api/leaderboard?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT l.*, t.team_name, h.title AS hackathon_title
      FROM leaderboard l
      LEFT JOIN teams t ON t.team_id = l.team_id
      LEFT JOIN hackathons h ON h.hackathon_id = l.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE l.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' ORDER BY l.rank_position ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leaderboard
router.post('/', async (req, res) => {
  const { hackathon_id, team_id, rank_position, score } = req.body;
  if (!hackathon_id || !team_id || !rank_position)
    return res.status(400).json({ error: 'hackathon_id, team_id, rank_position are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO leaderboard (hackathon_id, team_id, rank_position, score) VALUES (?, ?, ?, ?)',
      [hackathon_id, team_id, rank_position, score || 0]
    );
    res.status(201).json({ message: 'Leaderboard entry added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
