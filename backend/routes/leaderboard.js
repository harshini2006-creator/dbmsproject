const router = require('express').Router();
const store = require('../data/store');

// GET /api/leaderboard?hackathon_id=
router.get('/', (req, res) => {
  let teams = store.teams;
  if (req.query.hackathon_id) teams = teams.filter(t => t.hackathon_id === parseInt(req.query.hackathon_id));

  const board = teams.map(t => {
    const h = store.hackathons.find(x => x.id === t.hackathon_id);
    const sub = store.submissions.find(s => s.team_id === t.id);
    const result = sub ? store.results.find(r => r.submission_id === sub.id) : null;
    const members = store.team_members.filter(m => m.team_id === t.id);
    return {
      team_id: t.id,
      team_name: t.name,
      hackathon_id: t.hackathon_id,
      hackathon: h?.title || '',
      project: sub?.title || 'No submission',
      members: members.length,
      score: result ? result.total : 0,
    };
  }).sort((a, b) => b.score - a.score);

  // Add rank
  board.forEach((entry, i) => { entry.rank = i + 1; });

  res.json(board);
});

module.exports = router;
