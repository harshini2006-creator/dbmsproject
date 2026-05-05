const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/registrations?hackathon_id=  (Organizer/Judge)
router.get('/', authenticate, authorize('Organizer', 'Judge'), (req, res) => {
  let list = store.registrations;
  if (req.query.hackathon_id) list = list.filter(r => r.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(r => {
    const user = store.users.find(u => u.id === r.user_id);
    const hackathon = store.hackathons.find(h => h.id === r.hackathon_id);
    const team = store.teams.find(t => t.id === r.team_id);
    return { ...r, user_name: user?.name, email: user?.email, hackathon_title: hackathon?.title, team_name: team?.name };
  });
  res.json(result);
});

// GET /api/registrations/my  (logged-in user's registrations)
router.get('/my', authenticate, (req, res) => {
  const list = store.registrations.filter(r => r.user_id === req.user.id);
  const result = list.map(r => {
    const h = store.hackathons.find(x => x.id === r.hackathon_id);
    const team = store.teams.find(t => t.id === r.team_id);
    return { ...r, hackathon_title: h?.title, status_hackathon: h?.status, date_start: h?.date_start, date_end: h?.date_end, prize: h?.prize, team_name: team?.name };
  });
  res.json(result);
});

// POST /api/registrations  (User registers)
router.post('/', authenticate, authorize('User'), (req, res) => {
  const { hackathon_id, team_id } = req.body;
  if (!hackathon_id) return res.status(400).json({ error: 'hackathon_id is required' });

  const hackathon = store.hackathons.find(h => h.id === hackathon_id);
  if (!hackathon) return res.status(404).json({ error: 'Hackathon not found' });
  if (hackathon.status === 'past') return res.status(400).json({ error: 'Hackathon has ended' });

  const exists = store.registrations.find(r => r.user_id === req.user.id && r.hackathon_id === hackathon_id);
  if (exists) return res.status(409).json({ error: 'Already registered for this hackathon' });

  const reg = {
    id: store.getNextId('registrations'),
    user_id: req.user.id,
    hackathon_id,
    team_id: team_id || null,
    status: 'confirmed',
    registered_at: new Date().toISOString().split('T')[0],
  };
  store.registrations.push(reg);
  res.status(201).json({ message: 'Registered successfully', registration: reg });
});

// DELETE /api/registrations/:id  (cancel own registration)
router.delete('/:id', authenticate, (req, res) => {
  const idx = store.registrations.findIndex(r => r.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Registration not found' });
  if (store.registrations[idx].user_id !== req.user.id) return res.status(403).json({ error: 'Not your registration' });

  store.registrations.splice(idx, 1);
  res.json({ message: 'Registration cancelled' });
});

module.exports = router;
