const db = require('../db-postgres');

class User {
  static async create(username, email, hashedPassword, role = 'user') {
    try {
      const result = await db.one(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [username, email, hashedPassword, role]
      );
      return result.id;
    } catch (err) {
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const user = await db.oneOrNone(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return user;
    } catch (err) {
      throw err;
    }
  }

  static async findById(id) {
    try {
      const user = await db.oneOrNone(
        'SELECT id, username, email, role FROM users WHERE id = $1',
        [id]
      );
      return user;
    } catch (err) {
      throw err;
    }
  }

  static async getAllUsers() {
    try {
      const users = await db.any(
        'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return users || [];
    } catch (err) {
      throw err;
    }
  }

  static async updateRole(userId, role) {
    try {
      await db.none(
        'UPDATE users SET role = $1 WHERE id = $2',
        [role, userId]
      );
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;
