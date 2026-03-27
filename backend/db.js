const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected at', dbPath);
  }
});

// Initialize/migrate tables
db.serialize(() => {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');

  // Create Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Error creating users table:', err);
    } else {
      console.log('✅ Users table ready');
    }
  });

  // Create Playlists table
  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Error creating playlists table:', err);
    }
  });

  // Create Songs table with user_id and file_path
  db.run(`
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      duration INTEGER,
      file_url TEXT,
      file_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Error creating songs table:', err);
    } else {
      console.log('✅ Songs table ready');
    }
  });

  // Create Playlist_Songs junction table
  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      song_id INTEGER NOT NULL,
      FOREIGN KEY(playlist_id) REFERENCES playlists(id),
      FOREIGN KEY(song_id) REFERENCES songs(id)
    )
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.error('❌ Error creating playlist_songs table:', err);
    }
  });

  // Migrate: Check users table and add role column if missing
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking users table columns:', err);
      return;
    }

    if (!columns) return;

    const hasRole = columns.some(col => col.name === 'role');
    if (!hasRole) {
      console.log('🔄 Migrating: Adding role column to users table...');
      db.run('ALTER TABLE users ADD COLUMN role TEXT DEFAULT "user"', (err) => {
        if (err) {
          if (err.message.includes('duplicate column')) {
            console.log('✅ Role column already exists');
          } else {
            console.error('❌ Migration error adding role:', err);
          }
        } else {
          console.log('✅ Successfully added role column to users table');
        }
      });
    } else {
      console.log('✅ Users table has role column');
    }
  });

  // Migrate: Check songs table and add missing columns if needed
  db.all("PRAGMA table_info(songs)", (err, columns) => {
    if (err) {
      console.error('❌ Error checking songs table columns:', err);
      return;
    }

    if (!columns) return;

    const columnNames = columns.map(col => col.name);

    if (!columnNames.includes('user_id')) {
      console.log('🔄 Migrating: Adding user_id column to songs table...');
      db.run('ALTER TABLE songs ADD COLUMN user_id INTEGER', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Migration error adding user_id:', err);
        } else {
          console.log('✅ Successfully added user_id column to songs table');
        }
      });
    }

    if (!columnNames.includes('file_path')) {
      console.log('🔄 Migrating: Adding file_path column to songs table...');
      db.run('ALTER TABLE songs ADD COLUMN file_path TEXT', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Migration error adding file_path:', err);
        } else {
          console.log('✅ Successfully added file_path column to songs table');
        }
      });
    }

    if (!columnNames.includes('cover_image_url')) {
      console.log('🔄 Migrating: Adding cover_image_url column to songs table...');
      db.run('ALTER TABLE songs ADD COLUMN cover_image_url TEXT', (err) => {
        if (err && !err.message.includes('duplicate column')) {
          console.error('❌ Migration error adding cover_image_url:', err);
        } else {
          console.log('✅ Successfully added cover_image_url column to songs table');
        }
      });
    }

    const hasAllColumns = columnNames.includes('user_id') && columnNames.includes('file_path') && columnNames.includes('cover_image_url');
    if (hasAllColumns) {
      console.log('✅ Songs table schema is complete');
    }
  });
});

// Graceful close
process.on('exit', () => {
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
  });
});

module.exports = db;
