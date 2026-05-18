const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/registrations?hackathon_id=
router.get('/', authenticate, authorize('Organizer', 'Judge'), async (req, res) => {
  try {
    let query = `
      SELECT r.*, u.name AS user_name, u.email, h.title AS hackathon_title
      FROM registrations r
      LEFT JOIN users u ON u.user_id = r.user_id
      LEFT JOIN hackathons h ON h.hackathon_id = r.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE r.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/registrations/my
router.get('/my', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, h.title AS hackathon_title, h.start_date, h.end_date, h.prize_pool
      FROM registrations r
      LEFT JOIN hackathons h ON h.hackathon_id = r.hackathon_id
      WHERE r.user_id = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/registrations
router.post('/', authenticate, authorize('User'), async (req, res) => {
  const { hackathon_id } = req.body;
  if (!hackathon_id) return res.status(400).json({ error: 'hackathon_id is required' });

  try {
    const [hackathons] = await db.query('SELECT * FROM hackathons WHERE hackathon_id = ?', [hackathon_id]);
    if (hackathons.length === 0) return res.status(404).json({ error: 'Hackathon not found' });

    const [existing] = await db.query(
      'SELECT reg_id FROM registrations WHERE user_id = ? AND hackathon_id = ?',
      [req.user.id, hackathon_id]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Already registered' });

    const [result] = await db.query(
      'INSERT INTO registrations (user_id, hackathon_id, status) VALUES (?, ?, ?)',
      [req.user.id, hackathon_id, 'confirmed']
    );
    res.status(201).json({ message: 'Registered successfully', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/registrations/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM registrations WHERE reg_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Registration not found' });
    if (rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'Not your registration' });

    await db.query('DELETE FROM registrations WHERE reg_id = ?', [req.params.id]);
    res.json({ message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
