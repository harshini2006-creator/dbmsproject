const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/submissions?hackathon_id=
router.get('/', authenticate, (req, res) => {
  let list = store.submissions;
  if (req.query.hackathon_id) list = list.filter(s => s.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(s => {
    const team = store.teams.find(t => t.id === s.team_id);
    const h = store.hackathons.find(x => x.id === s.hackathon_id);
    return { ...s, team_name: team?.name, hackathon_title: h?.title };
  });
  res.json(result);
});

// GET /api/submissions/:id
router.get('/:id', authenticate, (req, res) => {
  const s = store.submissions.find(s => s.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ error: 'Submission not found' });

  const team = store.teams.find(t => t.id === s.team_id);
  const h = store.hackathons.find(x => x.id === s.hackathon_id);
  const result = store.results.find(r => r.submission_id === s.id);
  res.json({ ...s, team_name: team?.name, hackathon_title: h?.title, result: result || null });
});

// POST /api/submissions  (User submits project)
router.post('/', authenticate, authorize('User'), (req, res) => {
  const { team_id, hackathon_id, title, description, repo_url, demo_url, tech } = req.body;
  if (!team_id || !hackathon_id || !title || !description)
    return res.status(400).json({ error: 'team_id, hackathon_id, title, description are required' });

  const team = store.teams.find(t => t.id === team_id);
  if (!team) return res.status(404).json({ error: 'Team not found' });
  if (team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can submit' });

  const exists = store.submissions.find(s => s.team_id === team_id && s.hackathon_id === hackathon_id);
  if (exists) return res.status(409).json({ error: 'Team already submitted for this hackathon' });

  const submission = {
    id: store.getNextId('submissions'),
    team_id, hackathon_id, title, description,
    repo_url: repo_url || null,
    demo_url: demo_url || null,
    tech: tech || null,
    status: 'submitted',
    submitted_at: new Date().toISOString().split('T')[0],
  };
  store.submissions.push(submission);
  res.status(201).json({ message: 'Project submitted', submission });
});

// PUT /api/submissions/:id  (team lead updates)
router.put('/:id', authenticate, authorize('User'), (req, res) => {
  const s = store.submissions.find(s => s.id === parseInt(req.params.id));
  if (!s) return res.status(404).json({ error: 'Submission not found' });

  const team = store.teams.find(t => t.id === s.team_id);
  if (!team || team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Only team lead can update submission' });

  const fields = ['title', 'description', 'repo_url', 'demo_url', 'tech'];
  fields.forEach(f => { if (req.body[f] !== undefined) s[f] = req.body[f]; });
  res.json({ message: 'Submission updated', submission: s });
});

// DELETE /api/submissions/:id
router.delete('/:id', authenticate, authorize('User'), (req, res) => {
  const idx = store.submissions.findIndex(s => s.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Submission not found' });

  const team = store.teams.find(t => t.id === store.submissions[idx].team_id);
  if (!team || team.lead_user_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  store.submissions.splice(idx, 1);
  res.json({ message: 'Submission deleted' });
});

module.exports = router;
