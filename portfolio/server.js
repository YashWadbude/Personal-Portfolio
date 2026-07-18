// server.js — backend for the pentester portfolio site
// Serves the static frontend, exposes /api/config (the editable site content),
// and /api/feedback (stores messages from the contact form).

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_PATH = path.join(DATA_DIR, 'config.json');
const FEEDBACK_PATH = path.join(DATA_DIR, 'feedback.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure feedback.json exists
if (!fs.existsSync(FEEDBACK_PATH)) {
  fs.writeFileSync(FEEDBACK_PATH, '[]', 'utf-8');
}

// GET /api/config -> all editable site content (profile, skills, certs, education, projects fallback)
// Edit data/config.json to change ANY of this. No code changes needed.
app.get('/api/config', (req, res) => {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read config.json:', err);
    res.status(500).json({ error: 'Could not load site config.' });
  }
});

// POST /api/feedback -> { name, email, message }
// Appends to data/feedback.json. Swap this for an email/DB integration later if you want.
app.post('/api/feedback', (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are all required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address does not look valid.' });
  }
  if (message.length > 5000) {
    return res.status(400).json({ error: 'Message is too long (max 5000 characters).' });
  }

  const entry = {
    id: Date.now(),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    message: String(message).slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
    existing.unshift(entry);
    fs.writeFileSync(FEEDBACK_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    console.log(`New feedback received from ${entry.name} <${entry.email}>`);
    res.status(201).json({ ok: true, message: 'Message received. Thank you.' });
  } catch (err) {
    console.error('Failed to save feedback:', err);
    res.status(500).json({ error: 'Could not save your message. Try again shortly.' });
  }
});

// Simple protected-ish view to read submitted feedback (for you, the owner).
// Not real auth — fine for local/personal use. Add a real auth check before deploying publicly.
app.get('/api/feedback', (req, res) => {
  try {
    const existing = JSON.parse(fs.readFileSync(FEEDBACK_PATH, 'utf-8'));
    res.json(existing);
  } catch (err) {
    res.status(500).json({ error: 'Could not load feedback.' });
  }
});

app.listen(PORT, () => {
  console.log(`Portfolio server running at http://localhost:${PORT}`);
});
