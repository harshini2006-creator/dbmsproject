const router = require('express').Router();
const store = require('../data/store');
const { authenticate } = require('../middleware/auth');

// GET /api/team-members?team_id=
router.get('/', (req, res) => {
  if (!req.query.team_id) return res.status(400).json({ error: 'team_id query param required' });
  const members = store.team_members.filter(m => m.team_id === parseInt(req.query.team_id));
  res.json(members);
});

// POST /api/team-members  (team lead adds a member)
router.post('/', authenticate, (req, res) => {
  const { team_id, user_name, role } = req.body;
  if (!team_id || !user_name) return res.status(400).json({ error: 'team_id and user_name required' });

  const team = store.teams.find(t => t.id === team_id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can add members' });

  const member = {
    id: store.getNextId('team_members'),
    team_id,
    user_name,
    role: role || 'Member',
  };
  store.team_members.push(member);
  res.status(201).json({ message: 'Member added', member });
});

// DELETE /api/team-members/:id
router.delete('/:id', authenticate, (req, res) => {
  const idx = store.team_members.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Member not found' });

  const member = store.team_members[idx];
  const team = store.teams.find(t => t.id === member.team_id);
  if (!team || team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can remove members' });

  store.team_members.splice(idx, 1);
  res.json({ message: 'Member removed' });
});

module.exports = router;
