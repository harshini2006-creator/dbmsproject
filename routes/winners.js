const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/winners?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT w.*, t.name AS team_name, s.title AS project_title, h.title AS hackathon_title
      FROM winners w
      LEFT JOIN teams t ON t.id = w.team_id
      LEFT JOIN submissions s ON s.id = w.submission_id
      LEFT JOIN hackathons h ON h.id = w.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE w.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' ORDER BY w.rank ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/winners
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { hackathon_id, rank, team_id, submission_id, prize, medal } = req.body;
  if (!hackathon_id || !rank || !team_id || !submission_id)
    return res.status(400).json({ error: 'hackathon_id, rank, team_id, submission_id are required' });

  try {
    const autoMedal = medal || (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze');
    const [result] = await db.query(
      'INSERT INTO winners (hackathon_id, rank, team_id, submission_id, prize, medal) VALUES (?, ?, ?, ?, ?, ?)',
      [hackathon_id, rank, team_id, submission_id, prize || null, autoMedal]
    );
    res.status(201).json({ message: 'Winner declared', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/winners/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM winners WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Winner entry not found' });
    res.json({ message: 'Winner entry removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
