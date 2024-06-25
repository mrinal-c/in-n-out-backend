require('dotenv').config()
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(require("./routes/index"));
// const {getAdminKey} = require("./routes/admin");
// get driver connection
const dbo = require("./db/conn");
const AuthRouter = require("./routes/auth");

app.use("/auth", AuthRouter);



app.listen(port, () => {
  
  // perform a database connection when server starts
  dbo.connectToServer(function (err) {
    if (err) console.error(err);

  });
  console.log(`Server is running on port: ${port}`);
});

