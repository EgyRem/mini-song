const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, `../uploads/user_${req.userId}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

// Audio upload multer
const uploadAudio = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'file') {
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid audio file type'));
      }
    } else {
      cb(null, false); // Skip non-audio
    }
  }
});

// Multer for image uploads (covers)
const uploadImage = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only image files allowed.'));
    }
  }
});

// Get all songs (global + user's songs)
router.get('/', auth, async (req, res) => {
  try {
    const songs = await Song.getByUserId(req.userId);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get songs by user ID
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    const songs = await Song.getByUserId(userId);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload song
router.post('/upload', auth, uploadAudio.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover_image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, duration } = req.body;

    if (!title || !artist || !req.files['file']) {
      return res.status(400).json({ error: 'Title, artist, and audio file required' });
    }

    const file = req.files['file'][0];
    const coverFile = req.files['cover_image'] ? req.files['cover_image'][0] : null;

    const fileUrl = `/uploads/user_${req.userId}/${file.filename}`;
    const filePath = file.path;
    const coverImageUrl = coverFile ? `/uploads/user_${req.userId}/${coverFile.filename}` : null;

    const songId = await Song.create(
      req.userId,
      title,
      artist,
      album || 'Unknown Album',
      parseInt(duration) || 0,
      fileUrl,
      filePath,
      coverImageUrl
    );

    res.json({ 
      message: 'Song uploaded successfully', 
      songId,
      song: {
        id: songId,
        title,
        artist,
        album: album || 'Unknown Album',
        duration: parseInt(duration) || 0,
        file_url: fileUrl,
        cover_image_url: coverImageUrl
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search songs
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query required' });
    }
    const songs = await Song.search(q);
    res.json(songs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit song (title, artist, album, cover image)
router.put('/:id/edit', auth, uploadImage.single('cover_image'), async (req, res) => {
  try {
    const { title, artist, album } = req.body;
    const songId = req.params.id;
    
    // Get current song to verify ownership
    const db = require('../db-postgres');
    const song = await db.oneOrNone('SELECT * FROM songs WHERE id = $1', [songId]);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    if (song.user_id !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this song' });
    }
    
    // Build update query with PostgreSQL syntax
    const updates = [];
    const values = [songId];
    let paramCount = 2;
    
    if (title) {
      updates.push(`title = $${paramCount}`);
      values.push(title);
      paramCount++;
    }
    if (artist) {
      updates.push(`artist = $${paramCount}`);
      values.push(artist);
      paramCount++;
    }
    if (album) {
      updates.push(`album = $${paramCount}`);
      values.push(album);
      paramCount++;
    }
    
    // Handle cover image upload
    if (req.file) {
      const coverUrl = `/uploads/user_${req.userId}/${req.file.filename}`;
      updates.push(`cover_image_url = $${paramCount}`);
      values.push(coverUrl);
      paramCount++;
    }
    
    if (updates.length > 0) {
      const query = `UPDATE songs SET ${updates.join(', ')} WHERE id = $1`;
      await db.none(query, values);
    }
    
    res.json({ 
      success: true,
      message: 'Song updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete song
router.delete('/:id', auth, async (req, res) => {
  try {
    await Song.delete(req.params.id, req.userId);
    res.json({ message: 'Song deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

