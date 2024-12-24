const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      throw new Error('No token found');
    }
    const token = authHeader.split(' ')[1];
    const {user} = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = user._id;
    next();
  } catch (err) {
    return res.status(401).json({
      message: 'Authentication Failed',
      error: err
    });
  }
};

module.exports = verifyUser;