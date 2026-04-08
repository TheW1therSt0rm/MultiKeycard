const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { type } = require('os');

async function readJsonFile(jsonFile) {
  const file = await fs.readFile(jsonFile, 'utf8');
  const data = JSON.parse(file);
  return data;
}

const app = express();
const PORT = process.env.PORT || 5000;

const mockCards = [
  { id: 1, title: 'Settings', subtitle: 'Preferences and options', status: 0, type: 'settings' },
  { id: 2, title: 'Logs', subtitle: 'Usage and activity overview', status: 1, type: 'logs' },
  { id: 3, title: 'Profile', subtitle: 'Info and details of profile', status: 0, type: 'profile' },
  { id: 4, title: 'New Profile', subtitle: 'Create a new profile', status: 0, type: 'new-profile' },
];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/api/cards', (req, res) => {
  res.json(mockCards);
});

app.get('/api/logs', async (req, res) => {
  try {
    let data = { settings: [] };
    try {
      data = await readJsonFile('./api/save.json');
    } catch (err) {
      throw err;
    }

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
    let data;
    try {
      data=await readJsonFile('./api/save.json');
    } catch (err) {
      throw err;
    }

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
    let data;
    try {
      data = await readJsonFile('./api/save.json');
    } catch (err) {
      throw err;
    }

    if (!data.users) {
      throw new Error('Users array is missing in save.json');
    }

    if (!data.users[req.body.id]) {
      throw new Error(`User with id ${req.body.id} not found in save.json`);
    }

    data.users[req.body.id].log = req.body.log;
    data.users[req.body.id].m = req.body.m;

    await fs.writeFile('./api/save.json', JSON.stringify(data, null, 2));
    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});