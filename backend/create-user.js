const pgp = require('pg-promise')();
require('dotenv').config();

const db = pgp(process.env.DATABASE_URL);

async function createUser() {
  try {
    const user = await db.one(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      ['egyrem', 'egyrem985@gmail.com', '$2a$10$lRpgSJHPWSoGRrDIQDi9f.8HTHWmd4IJjL.czN.WIfw2h5evSdMmC']
    );
    console.log('✅ User created successfully!');
    console.log('ID:', user.id);
    console.log('Username:', user.username);
    console.log('Email:', user.email);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    pgp.end();
  }
}

createUser();
