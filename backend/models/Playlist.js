const db = require('../db-postgres');

class Playlist {
  static async create(userId, name, description = '') {
    try {
      const result = await db.one(
        'INSERT INTO playlists (user_id, name, description) VALUES ($1, $2, $3) RETURNING id',
        [userId, name, description]
      );
      return result.id;
    } catch (err) {
      throw err;
    }
  }

  static async getByUserId(userId) {
    try {
      const playlists = await db.any(
        'SELECT * FROM playlists WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      return playlists || [];
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Playlist;
