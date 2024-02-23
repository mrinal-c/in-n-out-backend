const dbo = require("../db/conn");
const authToken = process.env.TWILIO_AUTH_TOKEN;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const twilio = require("twilio")(accountSid, authToken);

exports.addSMSIn = async (req, res) => {
  console.log("Incoming SMS");
  if (req.body.From !== "+17044972588") {
    twilio.messages.create({
      body: "Unauthorized",
      from: "+18337531682",
      to: req.body.From,
    });
    return;
  }
  console.log("Validated");
  let db_connect = dbo.getDb();
  console.log("Connected");
  let data = req.body.Body.split(", ");
  console.log("Data: " + data);
  let out = {
    description: data[0],
    price: parseFloat(data[1]),
    date: data[2],
    uid: "634f7559ee0ff73569d27189",
    out: true,
    payment: data[3],
    type: data[4],
  };
  console.log(out);
  db_connect
    .collection(data[5])
    .insertOne(out)
    .then((result) => {
      console.log("Added");
      twilio.messages.create({
        body: "Added " + out.description + " to " + data[5],
        from: "+18337531682",
        to: req.body.From,
      });
    })
    .catch((err) => {
      twilio.messages.create({
        body: err,
        from: "+18337531682",
        to: req.body.From,
      });
    });
};
