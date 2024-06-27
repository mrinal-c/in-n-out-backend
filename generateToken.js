require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.createSecretToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};