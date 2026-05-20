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

// POST /api/results  — judge submits evaluation
router.post('/', authenticate, authorize('Organizer', 'Judge'), async (req, res) => {
  const { submission_id, hackathon_id, team_id, scores, total_score, feedback } = req.body;
  if (!submission_id && !hackathon_id)
    return res.status(400).json({ error: 'submission_id or hackathon_id required' });

  try {
    const scoresJson = scores ? JSON.stringify(scores) : null;
    const [result] = await db.query(
      `INSERT INTO results (submission_id, hackathon_id, team_id, judge_id, scores, total_score, feedback, position, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [submission_id || null, hackathon_id || null, team_id || null, req.user.id,
       scoresJson, total_score || 0, feedback || null, 0, feedback || null]
    );

    // Mark submission as evaluated
    if (submission_id) {
      await db.query("UPDATE submissions SET status = 'evaluated' WHERE submission_id = ?", [submission_id]);
    }

    res.status(201).json({ message: 'Evaluation saved', id: result.insertId });
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
