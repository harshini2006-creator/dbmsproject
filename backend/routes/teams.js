const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/teams?hackathon_id=
router.get('/', async (req, res) => {
  try {
    let query = `
      SELECT t.*, h.title AS hackathon_title, COUNT(tm.user_id) AS member_count
      FROM teams t
      LEFT JOIN hackathons h ON h.hackathon_id = t.hackathon_id
      LEFT JOIN team_members tm ON tm.team_id = t.team_id
    `;
    const params = [];
    if (req.query.hackathon_id) { query += ' WHERE t.hackathon_id = ?'; params.push(req.query.hackathon_id); }
    query += ' GROUP BY t.team_id';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/teams/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, h.title AS hackathon_title
      FROM teams t
      LEFT JOIN hackathons h ON h.hackathon_id = t.hackathon_id
      WHERE t.team_id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });

    const [members] = await db.query(
      'SELECT tm.user_id, u.name, u.email FROM team_members tm LEFT JOIN users u ON u.user_id = tm.user_id WHERE tm.team_id = ?',
      [req.params.id]
    );
    res.json({ ...rows[0], members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/teams
router.post('/', authenticate, authorize('User'), async (req, res) => {
  const { hackathon_id, team_name, members, tech } = req.body;
  if (!hackathon_id || !team_name) return res.status(400).json({ error: 'hackathon_id and team_name are required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [result] = await conn.query(
      'INSERT INTO teams (team_name, hackathon_id, leader_id, lead_name, size, tech) VALUES (?, ?, ?, ?, ?, ?)',
      [team_name, hackathon_id, req.user.id, req.user.name, members ? members.length : 1, tech || null]
    );
    const teamId = result.insertId;

    // Add leader as first member
    await conn.query('INSERT INTO team_members (team_id, user_id, member_role) VALUES (?, ?, ?)', [teamId, req.user.id, 'Team Lead']);

    // Add other members by name (they may not have accounts)
    if (Array.isArray(members)) {
      for (const m of members) {
        if (m.user_name && m.user_name !== req.user.name) {
          // Try to find user by name, insert with null user_id if not found
          const [users] = await conn.query('SELECT user_id FROM users WHERE name = ? LIMIT 1', [m.user_name]);
          const memberId = users.length > 0 ? users[0].user_id : null;
          if (memberId && memberId !== req.user.id) {
            await conn.query('INSERT IGNORE INTO team_members (team_id, user_id, member_role) VALUES (?, ?, ?)',
              [teamId, memberId, m.role || 'Member']);
          }
        }
      }
    }

    await conn.commit();
    res.status(201).json({ message: 'Team created', id: teamId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// PUT /api/teams/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT leader_id FROM teams WHERE team_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    if (rows[0].leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can update' });

    await db.query('UPDATE teams SET team_name = COALESCE(?, team_name) WHERE team_id = ?', [req.body.team_name || null, req.params.id]);
    res.json({ message: 'Team updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/teams/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT leader_id FROM teams WHERE team_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Team not found' });
    if (rows[0].leader_id !== req.user.id) return res.status(403).json({ error: 'Only team leader can delete' });

    await db.query('DELETE FROM team_members WHERE team_id = ?', [req.params.id]);
    await db.query('DELETE FROM teams WHERE team_id = ?', [req.params.id]);
    res.json({ message: 'Team deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
