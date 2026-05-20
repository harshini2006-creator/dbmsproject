const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/hackathons
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, u.name AS organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.hackathon_id = h.hackathon_id) AS participants
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
      SELECT h.*, u.name AS organizer_name,
        (SELECT COUNT(*) FROM registrations r WHERE r.hackathon_id = h.hackathon_id) AS participants
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

// GET /api/hackathons/:id/registrations  — organizer sees who joined
router.get('/:id/registrations', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [hack] = await db.query('SELECT created_by FROM hackathons WHERE hackathon_id = ?', [req.params.id]);
    if (hack.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
    if (hack[0].created_by !== req.user.id) return res.status(403).json({ error: 'Not your hackathon' });

    const [rows] = await db.query(`
      SELECT r.reg_id, r.registered_at, r.status,
             u.user_id, u.name AS user_name, u.email
      FROM registrations r
      LEFT JOIN users u ON u.user_id = r.user_id
      WHERE r.hackathon_id = ?
      ORDER BY r.registered_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hackathons
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { title, description, theme, location, start_date, end_date, prize_pool, max_registrations, time, duration, reg_fee, tags, criteria } = req.body;
  if (!title || !start_date || !end_date)
    return res.status(400).json({ error: 'title, start_date, end_date are required' });

  if (prize_pool) {
    const prizeNum = parseFloat(String(prize_pool).replace(/[^0-9.]/g, ''));
    if (!isNaN(prizeNum) && prizeNum > 100000)
      return res.status(400).json({ error: 'Prize pool cannot exceed ₹1,00,000' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const tagsStr = Array.isArray(tags) ? tags.join(',') : (tags || '');
    const [result] = await conn.query(
      `INSERT INTO hackathons
        (title, description, theme, location, start_date, end_date, prize_pool, max_registrations, time, duration, reg_fee, tags, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, theme || null, location || 'Online', start_date, end_date,
       prize_pool || null, max_registrations || 500, time || null, duration || null,
       reg_fee || 'Free', tagsStr, req.user.id]
    );
    const hackathonId = result.insertId;

    if (Array.isArray(criteria) && criteria.length > 0) {
      for (const c of criteria) {
        if (c.name) {
          await conn.query(
            'INSERT INTO evaluation_criteria (hackathon_id, criteria_name, max_score) VALUES (?, ?, ?)',
            [hackathonId, c.name, c.max_score || 10]
          );
        }
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Hackathon created', id: hackathonId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
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
