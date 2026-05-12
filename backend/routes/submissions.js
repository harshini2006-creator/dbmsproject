const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/submissions?hackathon_id=
router.get('/', authenticate, async (req, res) => {
  try {
    let query = `
      SELECT s.*, t.team_name, h.title AS hackathon_title
      FROM submissions s
      LEFT JOIN teams t ON t.team_id = s.team_id
      LEFT JOIN hackathons h ON h.hackathon_id = s.hackathon_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE s.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/submissions/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, t.team_name, h.title AS hackathon_title
      FROM submissions s
      LEFT JOIN teams t ON t.team_id = s.team_id
      LEFT JOIN hackathons h ON h.hackathon_id = s.hackathon_id
      WHERE s.submission_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/submissions
router.post('/', authenticate, authorize('User'), async (req, res) => {
  const { team_id, hackathon_id, project_title, github_link } = req.body;
  if (!team_id || !hackathon_id || !project_title)
    return res.status(400).json({ error: 'team_id, hackathon_id, project_title are required' });

  try {
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE team_id = ?', [team_id]);
    if (teams.length === 0) return res.status(404).json({ error: 'Team not found' });
    if (teams[0].leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can submit' });

    const [existing] = await db.query(
      'SELECT submission_id FROM submissions WHERE team_id = ? AND hackathon_id = ?',
      [team_id, hackathon_id]
    );
    if (existing.length > 0) return res.status(409).json({ error: 'Team already submitted' });

    const [result] = await db.query(
      'INSERT INTO submissions (team_id, hackathon_id, project_title, github_link) VALUES (?, ?, ?, ?)',
      [team_id, hackathon_id, project_title, github_link || null]
    );
    res.status(201).json({ message: 'Project submitted', id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/submissions/:id
router.delete('/:id', authenticate, authorize('User'), async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.submission_id, t.leader_id FROM submissions s JOIN teams t ON t.team_id = s.team_id WHERE s.submission_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    if (rows[0].leader_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

    await db.query('DELETE FROM submissions WHERE submission_id = ?', [req.params.id]);
    res.json({ message: 'Submission deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
