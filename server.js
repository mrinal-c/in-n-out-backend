require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// app.use(require("./routes/index"));
// const {getAdminKey} = require("./routes/admin");
// get driver connection
const dbo = require("./db/conn");
const AuthRouter = require("./routes/auth");
const TransactionRouter = require("./routes/transactions");

app.use("/auth", AuthRouter);
app.use("/api", TransactionRouter);

app.listen(port, () => {
  // perform a database connection when server starts
  mongoose.connect(process.env.DB_URL).then(
    () => {
      console.log("Connected to MongoDB");
    },
    (err) => {
      console.error("Failed to connect to MongoDB", err);
    }
  );
  console.log(`Server is running on port: ${port}`);
});
