const router = require('express').Router();
const store = require('../data/store');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users  (Organizer/Judge only)
router.get('/', authenticate, authorize('Organizer', 'Judge'), (req, res) => {
  const users = store.users.map(({ password, ...u }) => u);
  res.json(users);
});

// GET /api/users/:id
router.get('/:id', authenticate, (req, res) => {
  const user = store.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

// PUT /api/users/:id  (own profile only)
router.put('/:id', authenticate, (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: "Cannot update another user's profile" });

  const user = store.users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { name, org, expertise } = req.body;
  if (name) user.name = name;
  if (org !== undefined) user.org = org;
  if (expertise !== undefined) user.expertise = expertise;

  const { password, ...safe } = user;
  res.json({ message: 'Profile updated', user: safe });
});

// DELETE /api/users/:id  (own account only)
router.delete('/:id', authenticate, (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: "Cannot delete another user's account" });

  const idx = store.users.findIndex(u => u.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'User not found' });

  store.users.splice(idx, 1);
  res.json({ message: 'Account deleted' });
});

module.exports = router;
