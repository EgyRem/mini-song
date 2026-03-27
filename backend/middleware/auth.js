const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);
    
    const token = authHeader?.split(' ')[1];
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    req.userId = decoded.id;
    
    // Fetch user role
    const user = await User.findById(decoded.id);
    req.userRole = user?.role || 'user';
    console.log('User authenticated:', { userId: req.userId, role: req.userRole });
    
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid token: ' + error.message });
  }
};
