const express = require('express');
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user playlists
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.getByUserId(req.userId);
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create playlist
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Playlist name required' });
    }
    const playlistId = await Playlist.create(req.userId, name, description);
    res.json({ message: 'Playlist created', playlistId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
