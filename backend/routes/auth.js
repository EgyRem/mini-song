const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    console.log('Register attempt with body:', req.body);
    
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      console.log('Validation error - missing fields');
      return res.status(400).json({ error: 'All fields required (username, email, password)' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Check if this email should be admin
    const role = email === 'egyrem985@gmail.com' ? 'admin' : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await User.create(username, email, hashedPassword, role);

    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ User registered:', { userId, email, role });
    res.json({ message: 'User registered', token, userId, role });
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Login successful', token, userId: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
