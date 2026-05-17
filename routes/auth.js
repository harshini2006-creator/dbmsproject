const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'name, email, password and role are required' });

  // Map frontend role labels to DB ENUM values
  const roleMap = { 'User': 'participant', 'Judge': 'judge', 'Organizer': 'organizer' };
  const dbRole = roleMap[role];
  if (!dbRole)
    return res.status(400).json({ error: 'role must be User, Judge, or Organizer' });

  try {
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, dbRole]
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, role: dbRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.status(201).json({ message: 'Account created', token, user: { id: result.insertId, name, email, role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    // Map DB role back to display label for frontend
    const displayRoleMap = { 'participant': 'User', 'judge': 'Judge', 'organizer': 'Organizer' };
    const displayRole = displayRoleMap[user.role] || user.role;

    const token = jwt.sign(
      { id: user.user_id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ message: 'Login successful', token, user: { id: user.user_id, name: user.name, email: user.email, role: displayRole } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
