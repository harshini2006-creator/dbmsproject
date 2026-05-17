const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/results?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT r.*, t.team_name, h.title AS hackathon_title
      FROM results r
      LEFT JOIN teams t ON t.team_id = r.team_id
      LEFT JOIN hackathons h ON h.hackathon_id = r.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE r.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' ORDER BY r.position ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/results
router.post('/', authenticate, authorize('Organizer', 'Judge'), async (req, res) => {
  const { hackathon_id, team_id, position, remarks } = req.body;
  if (!hackathon_id || !team_id || !position)
    return res.status(400).json({ error: 'hackathon_id, team_id, position are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO results (hackathon_id, team_id, position, remarks) VALUES (?, ?, ?, ?)',
      [hackathon_id, team_id, position, remarks || null]
    );
    res.status(201).json({ message: 'Result added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/results/:id
router.put('/:id', authenticate, authorize('Organizer', 'Judge'), async (req, res) => {
  try {
    const { position, remarks } = req.body;
    await db.query(
      'UPDATE results SET position = COALESCE(?, position), remarks = COALESCE(?, remarks) WHERE result_id = ?',
      [position || null, remarks ?? null, req.params.id]
    );
    res.json({ message: 'Result updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/results/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM results WHERE result_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Result not found' });
    res.json({ message: 'Result deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
