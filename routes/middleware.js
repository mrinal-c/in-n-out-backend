const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const verifyUser = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      throw new Error('No token found');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = decoded.uid;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Authentication Failed',
    });
  }
};

module.exports = verifyUser;