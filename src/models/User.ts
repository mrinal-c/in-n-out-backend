import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

// Interface for category tables
interface ICategoryTable {
  category: string;
  tags: string[];
}

// Define the User interface extending Mongoose Document
export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  name: string;
  outTable: ICategoryTable[];
  inTable: ICategoryTable[];
  payments: string[];
  tags: string[];
  isCorrectPassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    outTable: [
      {
        category: { type: String, required: true },
        tags: { type: [String], required: true },
      },
    ],
    inTable: [
      {
        category: { type: String, required: true },
        tags: { type: [String], required: true },
      },
    ],
    payments: {
      type: [String],
      required: true
    },
    tags: {
      type: [String],
      required: true
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving user
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Custom method to check if provided password is correct
UserSchema.methods.isCorrectPassword = async function (
  password: string
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Create and export the User model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);
export default User;
