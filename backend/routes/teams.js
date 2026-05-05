const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/teams?hackathon_id=
router.get('/', (req, res) => {
  let list = store.teams;
  if (req.query.hackathon_id) list = list.filter(t => t.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(t => {
    const h = store.hackathons.find(x => x.id === t.hackathon_id);
    const members = store.team_members.filter(m => m.team_id === t.id);
    return { ...t, hackathon_title: h?.title, member_count: members.length };
  });
  res.json(result);
});

// GET /api/teams/:id
router.get('/:id', (req, res) => {
  const team = store.teams.find(t => t.id === parseInt(req.params.id));
  if (!team) return res.status(404).json({ error: 'Team not found' });

  const h = store.hackathons.find(x => x.id === team.hackathon_id);
  const members = store.team_members.filter(m => m.team_id === team.id);
  res.json({ ...team, hackathon_title: h?.title, members });
});

// POST /api/teams  (User creates a team)
router.post('/', authenticate, authorize('User'), (req, res) => {
  const { hackathon_id, name, tech, members } = req.body;
  if (!hackathon_id || !name) return res.status(400).json({ error: 'hackathon_id and name are required' });

  const team = {
    id: store.getNextId('teams'),
    hackathon_id,
    name,
    lead_user_id: req.user.id,
    tech: tech || '',
    created_at: new Date().toISOString().split('T')[0],
  };
  store.teams.push(team);

  // Add members
  if (members && members.length > 0) {
    members.forEach((m, i) => {
      store.team_members.push({
        id: store.getNextId('team_members'),
        team_id: team.id,
        user_name: m.user_name,
        role: i === 0 ? 'Team Lead' : (m.role || 'Member'),
      });
    });
  }

  // Link team to existing registration
  const reg = store.registrations.find(r => r.user_id === req.user.id && r.hackathon_id === hackathon_id);
  if (reg) reg.team_id = team.id;

  res.status(201).json({ message: 'Team created', team });
});

// PUT /api/teams/:id  (team lead only)
router.put('/:id', authenticate, (req, res) => {
  const team = store.teams.find(t => t.id === parseInt(req.params.id));
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can update' });

  if (req.body.name) team.name = req.body.name;
  if (req.body.tech !== undefined) team.tech = req.body.tech;
  res.json({ message: 'Team updated', team });
});

// DELETE /api/teams/:id
router.delete('/:id', authenticate, (req, res) => {
  const idx = store.teams.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Team not found' });
  if (store.teams[idx].lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can delete' });

  const teamId = store.teams[idx].id;
  store.teams.splice(idx, 1);
  // Remove members
  store.team_members = store.team_members.filter(m => m.team_id !== teamId);
  res.json({ message: 'Team deleted' });
});

module.exports = router;
