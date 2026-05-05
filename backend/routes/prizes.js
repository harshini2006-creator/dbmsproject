const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/prizes?hackathon_id=
router.get('/', (req, res) => {
  let list = store.prizes;
  if (req.query.hackathon_id) list = list.filter(p => p.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(p => {
    const h = store.hackathons.find(x => x.id === p.hackathon_id);
    return { ...p, hackathon_title: h?.title };
  }).sort((a, b) => a.rank - b.rank);

  res.json(result);
});

// GET /api/prizes/:id
router.get('/:id', (req, res) => {
  const p = store.prizes.find(p => p.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Prize not found' });
  res.json(p);
});

// POST /api/prizes  (Organizer sets prize structure)
router.post('/', authenticate, authorize('Organizer'), (req, res) => {
  const { hackathon_id, rank, title, amount, description } = req.body;
  if (!hackathon_id || !rank || !title || !amount)
    return res.status(400).json({ error: 'hackathon_id, rank, title, amount are required' });

  const prize = {
    id: store.getNextId('prizes'),
    hackathon_id, rank, title, amount,
    description: description || '',
  };
  store.prizes.push(prize);
  res.status(201).json({ message: 'Prize added', prize });
});

// PUT /api/prizes/:id
router.put('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const p = store.prizes.find(p => p.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Prize not found' });

  if (req.body.title) p.title = req.body.title;
  if (req.body.amount) p.amount = req.body.amount;
  if (req.body.description !== undefined) p.description = req.body.description;
  res.json({ message: 'Prize updated', prize: p });
});

// DELETE /api/prizes/:id
router.delete('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const idx = store.prizes.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Prize not found' });
  store.prizes.splice(idx, 1);
  res.json({ message: 'Prize deleted' });
});

module.exports = router;
