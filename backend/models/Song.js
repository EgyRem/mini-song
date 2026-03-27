const db = require('../db-postgres');

class Song {
  static async create(userId, title, artist, album, duration, fileUrl, filePath = null, coverImageUrl = null) {
    try {
      const result = await db.one(
        `INSERT INTO songs (user_id, title, artist, album, duration, file_url, file_path, cover_image_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id`,
        [userId, title, artist, album, duration, fileUrl, filePath, coverImageUrl]
      );
      return result.id;
    } catch (err) {
      throw err;
    }
  }

  static async getAll() {
    try {
      const songs = await db.any(
        'SELECT * FROM songs ORDER BY created_at DESC'
      );
      return songs || [];
    } catch (err) {
      throw err;
    }
  }

  static async getByUserId(userId) {
    try {
      const songs = await db.any(
        `SELECT s.*, u.username as uploader FROM songs s 
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.user_id = $1 OR s.user_id IS NULL 
         ORDER BY s.created_at DESC`,
        [userId]
      );
      return songs || [];
    } catch (err) {
      throw err;
    }
  }

  static async search(query) {
    try {
      const songs = await db.any(
        `SELECT s.*, u.username as uploader FROM songs s
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.title ILIKE $1 OR s.artist ILIKE $2 
         ORDER BY s.title`,
        [`%${query}%`, `%${query}%`]
      );
      return songs || [];
    } catch (err) {
      throw err;
    }
  }

  static async delete(songId, userId) {
    try {
      await db.none(
        'DELETE FROM songs WHERE id = $1 AND user_id = $2',
        [songId, userId]
      );
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Song;
