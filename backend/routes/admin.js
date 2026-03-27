const express = require('express');
const User = require('../models/User');
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    const allSongs = await Song.getAll();
    
    res.json({
      totalUsers: users.length,
      totalSongs: allSongs.length,
      users,
      stats: {
        avgSongsPerUser: allSongs.length / users.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin only)
router.get('/users', auth, admin, async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Change user role (admin only)
router.put('/users/:id/role', auth, admin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    await User.updateRole(req.params.id, role);
    res.json({ message: `User role updated to ${role}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all songs (admin only)
router.get('/songs', auth, admin, async (req, res) => {
  try {
    const songs = await Song.getAll();
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
