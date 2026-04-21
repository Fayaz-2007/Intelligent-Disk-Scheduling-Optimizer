const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// SQLite database
const db = new Database(path.join(__dirname, 'optimizer.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS run_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requests TEXT NOT NULL,
    head_position INTEGER NOT NULL,
    best_algorithm TEXT NOT NULL,
    seek_time INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// GET /api/history
app.get('/api/history', (req, res) => {
  const rows = db.prepare('SELECT * FROM run_history ORDER BY id DESC LIMIT 50').all();
  res.json(rows);
});

// POST /api/history
app.post('/api/history', (req, res) => {
  const { requests, head_position, best_algorithm, seek_time } = req.body;
  if (!requests || head_position == null || !best_algorithm || seek_time == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const stmt = db.prepare(
    'INSERT INTO run_history (requests, head_position, best_algorithm, seek_time) VALUES (?, ?, ?, ?)'
  );
  const info = stmt.run(requests, head_position, best_algorithm, seek_time);
  res.status(201).json({ id: info.lastInsertRowid });
});

// DELETE /api/history
app.delete('/api/history', (req, res) => {
  db.prepare('DELETE FROM run_history').run();
  res.json({ message: 'History cleared' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
