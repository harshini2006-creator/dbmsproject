const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/evaluation-criteria?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM evaluation_criteria';
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE hackathon_id = ?'; params.push(req.query.hackathon_id); }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/evaluation-criteria/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM evaluation_criteria WHERE criteria_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Criteria not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/evaluation-criteria
router.post('/', authenticate, authorize('Organizer'), async (req, res) => {
  const { hackathon_id, criteria_name, max_score } = req.body;
  if (!hackathon_id || !criteria_name || !max_score)
    return res.status(400).json({ error: 'hackathon_id, criteria_name, max_score are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO evaluation_criteria (hackathon_id, criteria_name, max_score) VALUES (?, ?, ?)',
      [hackathon_id, criteria_name, max_score]
    );
    res.status(201).json({ message: 'Criteria added', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/evaluation-criteria/:id
router.put('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const { criteria_name, max_score } = req.body;
    await db.query(
      'UPDATE evaluation_criteria SET criteria_name = COALESCE(?, criteria_name), max_score = COALESCE(?, max_score) WHERE criteria_id = ?',
      [criteria_name || null, max_score || null, req.params.id]
    );
    res.json({ message: 'Criteria updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/evaluation-criteria/:id
router.delete('/:id', authenticate, authorize('Organizer'), async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM evaluation_criteria WHERE criteria_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Criteria not found' });
    res.json({ message: 'Criteria deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
