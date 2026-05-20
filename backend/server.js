require('dotenv').config({ path: require('path').join(__dirname, '.env') });

process.env.JWT_SECRET = process.env.JWT_SECRET || 'hackhub_secret_key_2026';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Auto-migrate: add missing columns safely by checking INFORMATION_SCHEMA first
async function addColumnIfMissing(table, column, definition) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  if (rows[0].cnt === 0) {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    console.log(`Added column: ${table}.${column}`);
  }
}

async function runMigrations() {
  try {
    // users
    await addColumnIfMissing('users', 'dob', 'DATE NULL');

    // hackathons
    await addColumnIfMissing('hackathons', 'max_registrations', 'INT NOT NULL DEFAULT 500');
    await addColumnIfMissing('hackathons', 'theme',    'VARCHAR(255) NULL');
    await addColumnIfMissing('hackathons', 'time',     'VARCHAR(50) NULL');
    await addColumnIfMissing('hackathons', 'duration', 'VARCHAR(50) NULL');
    await addColumnIfMissing('hackathons', 'reg_fee',  'VARCHAR(50) NULL DEFAULT "Free"');
    await addColumnIfMissing('hackathons', 'tags',     'VARCHAR(500) NULL');

    // results — add evaluation columns
    await addColumnIfMissing('results', 'submission_id', 'INT NULL');
    await addColumnIfMissing('results', 'judge_id',      'INT NULL');
    await addColumnIfMissing('results', 'scores',        'TEXT NULL');
    await addColumnIfMissing('results', 'total_score',   'INT NULL DEFAULT 0');
    await addColumnIfMissing('results', 'feedback',      'TEXT NULL');

    // registrations
    await addColumnIfMissing('registrations', 'registered_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

    // teams
    await addColumnIfMissing('teams', 'lead_name',   'VARCHAR(255) NULL');
    await addColumnIfMissing('teams', 'size',        'INT DEFAULT 1');
    await addColumnIfMissing('teams', 'tech',        'VARCHAR(500) NULL');

    // team_members
    await addColumnIfMissing('team_members', 'member_role', 'VARCHAR(100) NULL');
    await addColumnIfMissing('submissions', 'description', 'TEXT NULL');
    await addColumnIfMissing('submissions', 'demo_url',    'VARCHAR(500) NULL');
    await addColumnIfMissing('submissions', 'tech_stack',  'VARCHAR(500) NULL');
    await addColumnIfMissing('submissions', 'status',      'VARCHAR(50) NULL DEFAULT "submitted"');

    console.log('Migrations complete.');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}
runMigrations();

// Serve frontend static files from parent directory
const path = require('path');
const frontendDir = path.join(__dirname, '..');
app.use(express.static(frontendDir, {
  index: 'index.html',
  // Don't serve the backend folder itself as static
  setHeaders: (res, filePath) => {
    if (filePath.startsWith(path.join(frontendDir, 'backend'))) {
      res.status(403).end();
    }
  }
}));

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
app.use('/api/prizes',             require('./routes/prizes'));
app.use('/api/announcements',      require('./routes/announcements'));
app.use('/api/leaderboard',        require('./routes/leaderboard'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

// DB connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', result: rows[0].result });
  } catch (err) {
    res.status(500).json({ status: 'failed', error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`HackHub API running on http://localhost:${PORT}`));