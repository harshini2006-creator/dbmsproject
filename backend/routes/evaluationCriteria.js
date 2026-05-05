const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/evaluation-criteria?hackathon_id=
router.get('/', (req, res) => {
  let list = store.evaluation_criteria;
  if (req.query.hackathon_id) list = list.filter(c => c.hackathon_id === parseInt(req.query.hackathon_id));
  res.json(list);
});

// GET /api/evaluation-criteria/:id
router.get('/:id', (req, res) => {
  const c = store.evaluation_criteria.find(c => c.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: 'Criteria not found' });
  res.json(c);
});

// POST /api/evaluation-criteria  (Organizer only)
router.post('/', authenticate, authorize('Organizer'), (req, res) => {
  const { hackathon_id, name, description, max_score } = req.body;
  if (!hackathon_id || !name || !max_score)
    return res.status(400).json({ error: 'hackathon_id, name, max_score are required' });

  const criteria = {
    id: store.getNextId('evaluation_criteria'),
    hackathon_id,
    name,
    description: description || '',
    max_score,
  };
  store.evaluation_criteria.push(criteria);
  res.status(201).json({ message: 'Criteria added', criteria });
});

// PUT /api/evaluation-criteria/:id
router.put('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const c = store.evaluation_criteria.find(c => c.id === parseInt(req.params.id));
  if (!c) return res.status(404).json({ error: 'Criteria not found' });

  if (req.body.name) c.name = req.body.name;
  if (req.body.description !== undefined) c.description = req.body.description;
  if (req.body.max_score) c.max_score = req.body.max_score;
  res.json({ message: 'Criteria updated', criteria: c });
});

// DELETE /api/evaluation-criteria/:id
router.delete('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const idx = store.evaluation_criteria.findIndex(c => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Criteria not found' });
  store.evaluation_criteria.splice(idx, 1);
  res.json({ message: 'Criteria deleted' });
});

module.exports = router;
