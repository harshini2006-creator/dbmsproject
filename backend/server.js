process.env.JWT_SECRET = process.env.JWT_SECRET || 'hackhub_secret_key_2026';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',               require('./routes/auth'));
app.use('/api/users',              require('./routes/users'));
app.use('/api/hackathons',         require('./routes/hackathons'));
app.use('/api/registrations',      require('./routes/registrations'));
app.use('/api/teams',              require('./routes/teams'));
app.use('/api/team-members',       require('./routes/teamMembers'));
app.use('/api/submissions',        require('./routes/submissions'));
app.use('/api/evaluation-criteria',require('./routes/evaluationCriteria'));
app.use('/api/results',            require('./routes/results'));
app.use('/api/winners',            require('./routes/winners'));
app.use('/api/prizes',             require('./routes/prizes'));
app.use('/api/announcements',      require('./routes/announcements'));
app.use('/api/leaderboard',        require('./routes/leaderboard'));

app.get('/', (req, res) => res.json({ message: 'HackHub API running', version: '1.0.0' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HackHub API running on http://localhost:${PORT}`));
