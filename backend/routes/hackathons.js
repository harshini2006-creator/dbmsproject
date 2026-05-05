const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/hackathons?status=upcoming|ongoing|past
router.get('/', (req, res) => {
  let list = store.hackathons;
  if (req.query.status) list = list.filter(h => h.status === req.query.status);
  const result = list.map(h => {
    const organizer = store.users.find(u => u.id === h.organizer_id);
    return { ...h, organizer_name: organizer ? organizer.name : null, organizer_org: organizer ? organizer.org : null };
  });
  res.json(result);
});

// GET /api/hackathons/:id
router.get('/:id', (req, res) => {
  const h = store.hackathons.find(h => h.id === parseInt(req.params.id));
  if (!h) return res.status(404).json({ error: 'Hackathon not found' });
  const organizer = store.users.find(u => u.id === h.organizer_id);
  const teams = store.teams.filter(t => t.hackathon_id === h.id).length;
  const submissions = store.submissions.filter(s => s.hackathon_id === h.id).length;
  const criteria = store.evaluation_criteria.filter(c => c.hackathon_id === h.id);
  res.json({ ...h, organizer_name: organizer?.name, organizer_org: organizer?.org, team_count: teams, submission_count: submissions, criteria });
});

// POST /api/hackathons  (Organizer only)
router.post('/', authenticate, authorize('Organizer'), (req, res) => {
  const { title, theme, date_start, date_end, location, prize, description, tags } = req.body;
  if (!title || !theme || !date_start || !date_end)
    return res.status(400).json({ error: 'title, theme, date_start, date_end are required' });

  const hackathon = {
    id: store.getNextId('hackathons'),
    title, theme, date_start, date_end,
    location: location || 'Online',
    prize: prize || 'TBD',
    description: description || '',
    tags: tags || [],
    status: 'upcoming',
    participants: 0,
    organizer_id: req.user.id,
    created_at: new Date().toISOString().split('T')[0],
  };
  store.hackathons.push(hackathon);
  res.status(201).json({ message: 'Hackathon created', hackathon });
});

// PUT /api/hackathons/:id  (Organizer, own hackathon)
router.put('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const h = store.hackathons.find(h => h.id === parseInt(req.params.id));
  if (!h) return res.status(404).json({ error: 'Hackathon not found' });
  if (h.organizer_id !== req.user.id) return res.status(403).json({ error: 'Not your hackathon' });

  const fields = ['title', 'theme', 'date_start', 'date_end', 'location', 'prize', 'description', 'tags', 'status'];
  fields.forEach(f => { if (req.body[f] !== undefined) h[f] = req.body[f]; });
  res.json({ message: 'Hackathon updated', hackathon: h });
});

// DELETE /api/hackathons/:id  (Organizer, own hackathon)
router.delete('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const idx = store.hackathons.findIndex(h => h.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Hackathon not found' });
  if (store.hackathons[idx].organizer_id !== req.user.id) return res.status(403).json({ error: 'Not your hackathon' });

  store.hackathons.splice(idx, 1);
  res.json({ message: 'Hackathon deleted' });
});

module.exports = router;
