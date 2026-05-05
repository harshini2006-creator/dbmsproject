const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/results?hackathon_id=  or  ?submission_id=
router.get('/', (req, res) => {
  let list = store.results;
  if (req.query.submission_id) list = list.filter(r => r.submission_id === parseInt(req.query.submission_id));
  if (req.query.hackathon_id) {
    const hackId = parseInt(req.query.hackathon_id);
    const subIds = store.submissions.filter(s => s.hackathon_id === hackId).map(s => s.id);
    list = list.filter(r => subIds.includes(r.submission_id));
  }

  const result = list.map(r => {
    const sub = store.submissions.find(s => s.id === r.submission_id);
    const team = sub ? store.teams.find(t => t.id === sub.team_id) : null;
    const judge = store.users.find(u => u.id === r.judge_id);
    const h = sub ? store.hackathons.find(x => x.id === sub.hackathon_id) : null;
    return { ...r, submission_title: sub?.title, team_name: team?.name, judge_name: judge?.name, hackathon_title: h?.title };
  }).sort((a, b) => b.total - a.total);

  res.json(result);
});

// GET /api/results/:id
router.get('/:id', (req, res) => {
  const r = store.results.find(r => r.id === parseInt(req.params.id));
  if (!r) return res.status(404).json({ error: 'Result not found' });

  const sub = store.submissions.find(s => s.id === r.submission_id);
  const team = sub ? store.teams.find(t => t.id === sub.team_id) : null;
  const judge = store.users.find(u => u.id === r.judge_id);
  res.json({ ...r, submission_title: sub?.title, team_name: team?.name, judge_name: judge?.name });
});

// POST /api/results  (Judge submits evaluation)
router.post('/', authenticate, authorize('Judge'), (req, res) => {
  const { submission_id, scores, feedback } = req.body;
  if (!submission_id || !scores) return res.status(400).json({ error: 'submission_id and scores are required' });

  const exists = store.results.find(r => r.submission_id === submission_id && r.judge_id === req.user.id);
  if (exists) return res.status(409).json({ error: 'Already evaluated this submission' });

  const total = Object.values(scores).reduce((sum, v) => sum + Number(v), 0);
  const result = {
    id: store.getNextId('results'),
    submission_id,
    judge_id: req.user.id,
    scores,
    total,
    feedback: feedback || '',
  };
  store.results.push(result);

  // Mark submission as evaluated
  const sub = store.submissions.find(s => s.id === submission_id);
  if (sub) sub.status = 'evaluated';

  res.status(201).json({ message: 'Evaluation submitted', result });
});

// PUT /api/results/:id  (Judge updates own evaluation)
router.put('/:id', authenticate, authorize('Judge'), (req, res) => {
  const r = store.results.find(r => r.id === parseInt(req.params.id));
  if (!r) return res.status(404).json({ error: 'Result not found' });
  if (r.judge_id !== req.user.id) return res.status(403).json({ error: 'Not your evaluation' });

  if (req.body.scores) {
    r.scores = req.body.scores;
    r.total = Object.values(req.body.scores).reduce((sum, v) => sum + Number(v), 0);
  }
  if (req.body.feedback !== undefined) r.feedback = req.body.feedback;
  res.json({ message: 'Evaluation updated', result: r });
});

module.exports = router;
