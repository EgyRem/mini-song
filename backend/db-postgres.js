const pgPromise = require('pg-promise');
const dotenv = require('dotenv');

dotenv.config();

// Initialize pg-promise
const pgp = pgPromise({
  // Log all queries
  query(e) {
    console.log('QUERY:', e.query);
  },
});

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mini_song',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

// For Vercel/Production: use DATABASE_URL if available
if (process.env.DATABASE_URL) {
  const db = pgp(process.env.DATABASE_URL);
  module.exports = db;
} else {
  const db = pgp(dbConfig);
  module.exports = db;
}

// Connection pool
const db = module.exports;

// Test connection and initialize schema (non-blocking)
if (process.env.NODE_ENV !== 'production') {
  // Only test connection in development
  db.one("SELECT version();")
    .then(() => {
      console.log('✅ Database connected successfully');
      initializeSchema();
    })
    .catch(err => {
      console.error('❌ Database connection error:', err.message);
      process.exit(1);
    });
} else {
  // In production (Vercel), initialize schema silently
  initializeSchema().catch(err => {
    console.error('⚠️ Schema initialization warning:', err.message);
    // Don't exit - let the function continue
  });
}

// Initialize database schema
async function initializeSchema() {
  try {
    // Create tables
    await db.none(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        album TEXT,
        duration INTEGER,
        file_url TEXT,
        file_path TEXT,
        cover_image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS playlist_songs (
        id SERIAL PRIMARY KEY,
        playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
        song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
        UNIQUE(playlist_id, song_id)
      );
    `);

    console.log('✅ Database schema initialized');

    // Create indexes
    await db.none(`
      CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
      CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
      CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
      CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
    `);

    console.log('✅ Database indexes created');

    // Auto-promote admin user if it's the first time
    const adminEmail = process.env.ADMIN_EMAIL || 'egyrem985@gmail.com';
    await db.none(`
      UPDATE users SET role = 'admin' WHERE email = $1;
    `, [adminEmail]).catch(() => {
      // User doesn't exist yet, that's fine
    });

  } catch (err) {
    console.error('❌ Error initializing schema:', err.message);
  }
}

module.exports = db;
