// file: server.js

const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 5000;
const SAVE_FILE = path.join(__dirname, 'api', 'save.json');

const mockCards = [
  { id: 1, title: 'Settings', subtitle: 'Preferences and options', status: 0, type: 'settings' },
  { id: 2, title: 'Logs', subtitle: 'Usage and activity overview', status: 1, type: 'logs' },
  { id: 3, title: 'Profile', subtitle: 'Info and details of profile', status: 0, type: 'profile' },
  { id: 4, title: 'New Profile', subtitle: 'Create a new profile', status: 0, type: 'new-profile' },
];

async function readJsonFile(jsonFile) {
  const file = await fs.readFile(jsonFile, 'utf8');
  return JSON.parse(file);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/cards', (req, res) => {
  res.json(mockCards);
});

app.get('/api/logs', async (req, res) => {
  try {
    const data = await readJsonFile(SAVE_FILE);

    if (!data.users) {
      throw new Error('Users array is missing in save.json');
    }

    const logs = data.users[req.query.id]?.log || [];
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/mode', async (req, res) => {
  try {
    const data = await readJsonFile(SAVE_FILE);

    if (!data.users) {
      throw new Error('Users array is missing in save.json');
    }

    const mode = data.users[req.query.id]?.m || 0;
    res.json({ m: mode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/save', async (req, res) => {
  try {
    const data = await readJsonFile(SAVE_FILE);

    if (!data.users) {
      throw new Error('Users array is missing in save.json');
    }

    if (!data.users[req.body.id]) {
      throw new Error(`User with id ${req.body.id} not found in save.json`);
    }

    data.users[req.body.id].log = req.body.log;
    data.users[req.body.id].m = req.body.m;

    await fs.writeFile(SAVE_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});