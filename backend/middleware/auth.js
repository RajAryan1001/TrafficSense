const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    let token = null;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.Token) {
      token = req.cookies.Token;
    }

    if (!token) return res.status(401).json({ message: 'Authentication token missing' });

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err?.message || err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
