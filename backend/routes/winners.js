const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/winners?hackathon_id=
router.get('/', (req, res) => {
  let list = store.winners;
  if (req.query.hackathon_id) list = list.filter(w => w.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(w => {
    const team = store.teams.find(t => t.id === w.team_id);
    const sub = store.submissions.find(s => s.id === w.submission_id);
    const h = store.hackathons.find(x => x.id === w.hackathon_id);
    return { ...w, team_name: team?.name, project_title: sub?.title, hackathon_title: h?.title };
  }).sort((a, b) => a.rank - b.rank);

  res.json(result);
});

// POST /api/winners  (Organizer declares winners)
router.post('/', authenticate, authorize('Organizer'), (req, res) => {
  const { hackathon_id, rank, team_id, submission_id, prize, medal } = req.body;
  if (!hackathon_id || !rank || !team_id || !submission_id)
    return res.status(400).json({ error: 'hackathon_id, rank, team_id, submission_id are required' });

  const winner = {
    id: store.getNextId('winners'),
    hackathon_id, rank, team_id, submission_id,
    prize: prize || null,
    medal: medal || (rank === 1 ? 'gold' : rank === 2 ? 'silver' : 'bronze'),
  };
  store.winners.push(winner);
  res.status(201).json({ message: 'Winner declared', winner });
});

// DELETE /api/winners/:id
router.delete('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const idx = store.winners.findIndex(w => w.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Winner entry not found' });
  store.winners.splice(idx, 1);
  res.json({ message: 'Winner entry removed' });
});

module.exports = router;
