import User from "../models/User";
import { createSecretToken } from "../lib/generateToken";
import bcrypt from "bcrypt";
// import { v4 as uuidv4 } from "uuid";
import { Response, Router } from "express";
import { AuthenticatedRequest } from "./middleware";

const authRouter = Router(); // create router to create route bundle

authRouter.post('/signup', async (req: AuthenticatedRequest, res: Response) => {
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
      return res.status(409).json({ message: "User already exists. Please login" });
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
    const token = createSecretToken(user);

    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(409).send({ message: error.message });
    }
    return res.status(409).send({ message: "An unknown error occurred" });
  }
});

authRouter.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  if (!(email && password)) {
    return res.status(400).json({ message: "All input is required" });
  }
  const user = await User.findOne({ email }).lean();
  if (!(user && (await bcrypt.compare(password, user.password)))) {
    return res.status(404).json({ message: "Invalid credentials" });
  }
  // delete user.password;
  const token = createSecretToken(user);
  return res.status(200).json({ token });
});

export default authRouter;