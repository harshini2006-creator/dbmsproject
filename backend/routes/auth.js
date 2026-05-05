const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const store = require('../data/store');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, role, org, expertise } = req.body;
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: 'name, email, password and role are required' });
  if (!['User', 'Judge', 'Organizer'].includes(role))
    return res.status(400).json({ error: 'role must be User, Judge, or Organizer' });

  if (store.users.find(u => u.email === email))
    return res.status(409).json({ error: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = {
    id: store.getNextId('users'),
    name, email, password: hash, role,
    org: org || null,
    expertise: expertise || null,
    created_at: new Date().toISOString().split('T')[0],
  };
  store.users.push(user);

  const token = jwt.sign(
    { id: user.id, name, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.status(201).json({ message: 'Account created', token, user: { id: user.id, name, email, role } });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'email and password required' });

  const user = store.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

module.exports = router;
