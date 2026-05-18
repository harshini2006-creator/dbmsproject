const router = require('express').Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET /api/users
router.get('/', authenticate, authorize('Organizer', 'Judge'), async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, name, email, role, created_at FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticate, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: "Cannot update another user's profile" });

  const { name } = req.body;
  try {
    await db.query('UPDATE users SET name = COALESCE(?, name) WHERE user_id = ?', [name || null, req.params.id]);
    const [rows] = await db.query('SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?', [req.params.id]);
    res.json({ message: 'Profile updated', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.id !== parseInt(req.params.id))
    return res.status(403).json({ error: "Cannot delete another user's account" });

  try {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
