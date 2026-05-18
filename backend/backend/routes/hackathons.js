const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/hackathons
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, u.name AS organizer_name
      FROM hackathons h
      LEFT JOIN users u ON u.user_id = h.created_by
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hackathons/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, u.name AS organizer_name
      FROM hackathons h
      LEFT JOIN users u ON u.user_id = h.created_by
      WHERE h.hackathon_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });

    const [[{ team_count }]] = await db.query('SELECT COUNT(*) AS team_count FROM teams WHERE hackathon_id = ?', [req.params.id]);
    const [[{ submission_count }]] = await db.query('SELECT COUNT(*) AS submission_count FROM submissions WHERE hackathon_id = ?', [req.params.id]);
    const [criteria] = await db.query('SELECT * FROM evaluation_criteria WHERE hackathon_id = ?', [req.params.id]);

    res.json({ ...rows[0], team_count, submission_count, criteria });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hackathons
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { title, description, location, start_date, end_date, prize_pool } = req.body;
  if (!title || !start_date || !end_date)
    return res.status(400).json({ error: 'title, start_date, end_date are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO hackathons (title, description, location, start_date, end_date, prize_pool, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description || null, location || 'Online', start_date, end_date, prize_pool || null, req.user.id]
    );
    res.status(201).json({ message: 'Hackathon created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/hackathons/:id
router.put('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT created_by FROM hackathons WHERE hackathon_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
    if (rows[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your hackathon' });

    const fields = ['title', 'description', 'location', 'start_date', 'end_date', 'prize_pool'];
    const updates = [];
    const params = [];
    fields.forEach(f => { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); } });
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    params.push(req.params.id);
    await db.query(`UPDATE hackathons SET ${updates.join(', ')} WHERE hackathon_id = ?`, params);
    res.json({ message: 'Hackathon updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/hackathons/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT created_by FROM hackathons WHERE hackathon_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
    if (rows[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your hackathon' });

    await db.query('DELETE FROM hackathons WHERE hackathon_id = ?', [req.params.id]);
    res.json({ message: 'Hackathon deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
