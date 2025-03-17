import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

export function createSecretToken (user: object) {
  return jwt.sign({user}, process.env.JWT_SECRET!, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};