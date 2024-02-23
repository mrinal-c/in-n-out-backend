const { MongoClient } = require("mongodb");
const Db = process.env.ATLAS_URI;
const client = new MongoClient(Db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
var _db;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      // Verify we got a good "db" object
      if (db) {
        _db = db.db("2024");
        console.log("Successfully connected to MongoDB.");
      }
      return callback(err);
    });
  },

  getDb: function () {
    return _db;
  },

  changeYear: function (year) {
    return new Promise((resolve, reject) => {
      client.connect(function (err, db) {
        // Verify we got a good "db" object
        if (db) {
          _db = db.db(year);
          console.log("Successfully changed year.");
          resolve();
        }
      });
    });
  },
};
