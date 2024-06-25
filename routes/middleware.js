const jwt = require("jsonwebtoken");
const verifyUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Authentification Failed"
    });
  }
};

module.exports = verifyUser;