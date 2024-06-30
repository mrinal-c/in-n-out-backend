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
      return res.status(400).send("All input is required");
    }

    const oldUser = await User.findOne({ email: req.body.email });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
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

    // res.cookie("token", token, {
    //   path: "/", // Cookie is accessible from all paths
    //   expires: new Date(Date.now() + 86400000), // Cookie expires in 1 day
    //   secure: true, // Cookie will only be sent over HTTPS
    //   httpOnly: true, // Cookie cannot be accessed via client-side scripts
    //   sameSite: "None",
    // });

    return res.status(200).json({ token, user });
  } catch (error) {
    console.log("Got an error", error);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).json({ message: "All input is required" });
  }
  const user = await User.findOne({ email });
  if (!(user && (await bcrypt.compare(password, user.password)))) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
  delete user.password;
  const token = createSecretToken(user._id);
  // res.cookie("token", token, {
  //   domain: process.env.frontend_url, // Set your domain here
  //   path: "/", // Cookie is accessible from all paths
  //   expires: new Date(Date.now() + 86400000), // Cookie expires in 1 day
  //   secure: true, // Cookie will only be sent over HTTPS
  //   httpOnly: true, // Cookie cannot be accessed via client-side scripts
  //   sameSite: "None",
  // });

  return res.status(200).json({token, user});
});

module.exports = router;