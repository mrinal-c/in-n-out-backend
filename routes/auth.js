const User = require("../models/User");
const { createSecretToken } = require("../generateToken");
const bcrypt = require("bcrypt");
// const {v4 : uuidv4} = require('uuid')
const {Router } = require('express')
const router = Router(); // create router to create route bundle

router.post( '/signup', async (req, res) => {
  try {
    if (
      !(
        req.body.email &&
        req.body.password &&
        req.body.name &&
        req.body.username
      )
    ) {
      return res.status(400).json({ message: "All input is required" });
    }

    const oldUser = await User.findOne({ email: req.body.email });

    if (oldUser) {
      return res.status(409).json({ message: "User already exists. Please login"});
    }
    const salt = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUser = new User({
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      // _id: uuidv4(),
    });
    const user = await newUser.save();
    delete user.password;
    const token = createSecretToken(user._id);

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(409).send({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).json({ message: "All input is required" });
  }
  const user = await User.findOne({ email }).lean();
  if (!(user && (await bcrypt.compare(password, user.password)))) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
  delete user.password;
  const outTable = {}
  user.table.forEach((row) => {
    const { category, tags } = row;
    outTable[category] = tags;
  });
  user.outTable = outTable;
  const token = createSecretToken(user._id);
  return res.status(200).json({token, user});
});

module.exports = router;