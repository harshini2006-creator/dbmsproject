const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/prizes?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT p.*, h.title AS hackathon_title
      FROM prizes p
      LEFT JOIN hackathons h ON h.hackathon_id = p.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE p.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' ORDER BY p.position ASC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prizes
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { hackathon_id, position, reward } = req.body;
  if (!hackathon_id || !position || !reward)
    return res.status(400).json({ error: 'hackathon_id, position, reward are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO prizes (hackathon_id, position, reward) VALUES (?, ?, ?)',
      [hackathon_id, position, reward]
    );
    res.status(201).json({ message: 'Prize added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/prizes/:id
router.put('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const { position, reward } = req.body;
    await db.query(
      'UPDATE prizes SET position = COALESCE(?, position), reward = COALESCE(?, reward) WHERE prize_id = ?',
      [position || null, reward || null, req.params.id]
    );
    res.json({ message: 'Prize updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/prizes/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM prizes WHERE prize_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Prize not found' });
    res.json({ message: 'Prize deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
