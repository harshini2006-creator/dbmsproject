const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/announcements?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT a.*, h.title AS hackathon_title
      FROM announcements a
      LEFT JOIN hackathons h ON h.hackathon_id = a.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE a.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' ORDER BY a.created_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/announcements/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, h.title AS hackathon_title
      FROM announcements a
      LEFT JOIN hackathons h ON h.hackathon_id = a.hackathon_id
      WHERE a.announcement_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Announcement not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { hackathon_id, message } = req.body;
  if (!hackathon_id || !message)
    return res.status(400).json({ error: 'hackathon_id and message are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO announcements (hackathon_id, message) VALUES (?, ?)',
      [hackathon_id, message]
    );
    res.status(201).json({ message: 'Announcement posted', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/announcements/:id
router.put('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    await db.query(
      'UPDATE announcements SET message = COALESCE(?, message) WHERE announcement_id = ?',
      [req.body.message || null, req.params.id]
    );
    res.json({ message: 'Announcement updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM announcements WHERE announcement_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Announcement not found' });
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
