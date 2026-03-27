const pgPromise = require('pg-promise');

// Initialize pg-promise with minimal config
const pgp = pgPromise();

// Get database URL from environment (Vercel injects it)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  process.exit(1);
}

console.log('📋 Connecting to database...');
console.log('DATABASE_URL set:', !!connectionString);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Create database connection
const db = pgp(connectionString);

// Export immediately - don't block on schema initialization
module.exports = db;

// Initialize schema asynchronously (don't wait for it)
setTimeout(() => {
  initializeSchema().catch(err => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Schema init warning:', err.message);
    } else {
      console.error('❌ Schema init error:', err);
    }
  });
}, 100);

// Initialize database schema
async function initializeSchema() {
  try {
    // Just try to connect
    await db.one('SELECT version();');
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist
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
    console.log('✅ Tables created');

    // Create indexes
    await db.none(`
      CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
      CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
      CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
      CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists(user_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_playlist_id ON playlist_songs(playlist_id);
      CREATE INDEX IF NOT EXISTS idx_playlist_songs_song_id ON playlist_songs(song_id);
    `);
    console.log('✅ Indexes created');

  } catch (err) {
    console.error('Schema init error:', err.message);
  }
}
