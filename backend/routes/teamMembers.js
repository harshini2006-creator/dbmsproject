const router = require('express').Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// GET /api/team-members?team_id=
router.get('/', async (req, res) => {
  if (!req.query.team_id) return res.status(400).json({ error: 'team_id query param required' });
  try {
    const [rows] = await db.query(
      'SELECT tm.user_id, u.name, u.email FROM team_members tm LEFT JOIN users u ON u.user_id = tm.user_id WHERE tm.team_id = ?',
      [req.query.team_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/team-members
router.post('/', authenticate, async (req, res) => {
  const { team_id, user_id } = req.body;
  if (!team_id || !user_id) return res.status(400).json({ error: 'team_id and user_id required' });

  try {
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE team_id = ?', [team_id]);
    if (teams.length === 0) return res.status(404).json({ error: 'Team not found' });
    if (teams[0].leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can add members' });

    await db.query('INSERT INTO team_members (team_id, user_id) VALUES (?, ?)', [team_id, user_id]);
    res.status(201).json({ message: 'Member added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/team-members
router.delete('/', authenticate, async (req, res) => {
  const { team_id, user_id } = req.body;
  if (!team_id || !user_id) return res.status(400).json({ error: 'team_id and user_id required' });

  try {
    const [teams] = await db.query('SELECT leader_id FROM teams WHERE team_id = ?', [team_id]);
    if (!teams.length || teams[0].leader_id !== req.user.id)
      return res.status(403).json({ error: 'Only team leader can remove members' });

    await db.query('DELETE FROM team_members WHERE team_id = ? AND user_id = ?', [team_id, user_id]);
    res.json({ message: 'Member removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
