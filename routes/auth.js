// This will help us connect to the database
const Realm = require("realm-web");
const realmApp = new Realm.App({ id: process.env.APP_ID });
const dbo = require("../db/conn");
const { verifyClientToken } = require("./admin");

exports.addUser = (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send("Please enter a valid email and password");
    return;
  }
  realmApp.emailPasswordAuth
    .registerUser({
      email: req.body.email,
      password: req.body.password,
    })
    .then(() => {
      const credentials = Realm.Credentials.emailPassword(
        req.body.email,
        req.body.password
      );
      return realmApp.logIn(credentials);
    })
    .then((user) => {
      let myUser = {
        uid: user.id,
        email: user.profile.email,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      };
      res.json({
        message: "Successfully logged in",
        status: "SUCCESS",
        user: myUser,
      });
    })
    .catch((err) => res.json({ message: err.message }));
};

exports.logonUser = (req, res) => {
  if (!req.body.password || !req.body.email) {
    res.status(400).send("Please enter a valid email and password");
    return;
  }
  const credentials = Realm.Credentials.emailPassword(
    req.body.email,
    req.body.password
  );
  realmApp
    .logIn(credentials)
    .then((user) => {
      let myUser = {
        uid: user.id,
        email: user.profile.email,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      };
      res.json({
        message: "Successfully logged in",
        status: "SUCCESS",
        user: myUser,
      });
    })
    .catch((err) => res.json({ message: err.message, status: "FAIL" }));
};

exports.changeYear = (req, res) => {
  if (req.query.year === undefined || req.headers.accesstoken === undefined) {
    res.status(400).send("Missing required fields");
    return;
  }
  verifyClientToken(req.headers.accesstoken)
    .then((result) => {
      if (result.action !== "PASS") {
        res.status(401).send(result.action);
        return;
      } else if (result.action === "PASS") {
        dbo
          .changeYear(req.query.year)
          .then(() => {
            res.json({ message: "Successfully changed year" });
          })
          .catch((err) => res.json({ message: err.message }));
      }
    })
    .catch((err) => {
      console.log(err);
      res.json(err);
    });
};


exports.wakeUp = (req, res) => {
  res.json({message: "AWAKE"});
}
