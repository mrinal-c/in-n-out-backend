const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    outTable: [
      {
        category: {
          type: String,
          required: true,
        },
        tags: {
          type: [String],
          required: true,
        },
      },
    ],
    payments: [
      {
        type: String,
        enum: ["creditCard", "payPal", "bankTransfer", "cash"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving user
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// custom method to check if provided password is correct
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
