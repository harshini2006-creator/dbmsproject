const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/announcements?hackathon_id=
router.get('/', (req, res) => {
  let list = store.announcements;
  if (req.query.hackathon_id) list = list.filter(a => a.hackathon_id === parseInt(req.query.hackathon_id));

  const result = list.map(a => {
    const h = store.hackathons.find(x => x.id === a.hackathon_id);
    const author = store.users.find(u => u.id === a.author_id);
    return { ...a, hackathon_title: h?.title, author_name: author?.name };
  }).sort((a, b) => b.pinned - a.pinned || new Date(b.created_at) - new Date(a.created_at));

  res.json(result);
});

// GET /api/announcements/:id
router.get('/:id', (req, res) => {
  const a = store.announcements.find(a => a.id === parseInt(req.params.id));
  if (!a) return res.status(404).json({ error: 'Announcement not found' });
  const h = store.hackathons.find(x => x.id === a.hackathon_id);
  const author = store.users.find(u => u.id === a.author_id);
  res.json({ ...a, hackathon_title: h?.title, author_name: author?.name });
});

// POST /api/announcements  (Organizer only)
router.post('/', authenticate, authorize('Organizer'), (req, res) => {
  const { hackathon_id, title, body, type, pinned } = req.body;
  if (!hackathon_id || !title || !body)
    return res.status(400).json({ error: 'hackathon_id, title, body are required' });

  const announcement = {
    id: store.getNextId('announcements'),
    hackathon_id, title, body,
    type: type || 'update',
    pinned: pinned ? true : false,
    author_id: req.user.id,
    created_at: new Date().toISOString().split('T')[0],
  };
  store.announcements.push(announcement);
  res.status(201).json({ message: 'Announcement posted', announcement });
});

// PUT /api/announcements/:id
router.put('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const a = store.announcements.find(a => a.id === parseInt(req.params.id));
  if (!a) return res.status(404).json({ error: 'Announcement not found' });
  if (a.author_id !== req.user.id) return res.status(403).json({ error: 'Not your announcement' });

  if (req.body.title) a.title = req.body.title;
  if (req.body.body) a.body = req.body.body;
  if (req.body.type) a.type = req.body.type;
  if (req.body.pinned !== undefined) a.pinned = req.body.pinned;
  res.json({ message: 'Announcement updated', announcement: a });
});

// DELETE /api/announcements/:id
router.delete('/:id', authenticate, authorize('Organizer'), (req, res) => {
  const idx = store.announcements.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Announcement not found' });
  if (store.announcements[idx].author_id !== req.user.id) return res.status(403).json({ error: 'Not your announcement' });

  store.announcements.splice(idx, 1);
  res.json({ message: 'Announcement deleted' });
});

module.exports = router;
