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
  const { team_id, hackathon_id, project_title, title, github_link, repo_url, description, demo_url, tech_stack, tech } = req.body;
  const finalTitle = project_title || title;
  const finalRepo  = github_link  || repo_url;
  if (!hackathon_id || !finalTitle)
    return res.status(400).json({ error: 'hackathon_id and project title are required' });

  try {
    // Find team for this user in this hackathon if team_id not provided
    let finalTeamId = team_id;
    if (!finalTeamId) {
      const [teams] = await db.query('SELECT team_id FROM teams WHERE hackathon_id = ? AND leader_id = ? LIMIT 1', [hackathon_id, req.user.id]);
      if (teams.length > 0) finalTeamId = teams[0].team_id;
    }

    if (finalTeamId) {
      const [existing] = await db.query('SELECT submission_id FROM submissions WHERE team_id = ? AND hackathon_id = ?', [finalTeamId, hackathon_id]);
      if (existing.length > 0) return res.status(409).json({ error: 'Team already submitted' });
    }

    const [result] = await db.query(
      'INSERT INTO submissions (team_id, hackathon_id, project_title, github_link, description, demo_url, tech_stack, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [finalTeamId || null, hackathon_id, finalTitle, finalRepo || null, description || null, demo_url || null, tech_stack || tech || null, 'submitted']
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
