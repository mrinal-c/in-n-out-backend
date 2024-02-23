const express = require("express");

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const routes = express.Router();
const {addTransaction, getTransactions, getTableData, removeTransaction, editTransaction} = require("./transactions");
const {addUser, logonUser, changeYear, wakeUp} = require("./auth");
const {addIn, getIns, removeIn, editIn} = require("./ins");
const {addSMSIn} = require("./sms");
const dbo = require("../db/conn");



// This section will help you get a list of all the records.
routes.route("/transaction").post(addTransaction);
routes.route("/transaction").get(getTransactions);
routes.route("/signup").post(addUser);
routes.route("/login").post(logonUser);
routes.route("/tableData").get(getTableData);
routes.route("/transaction").delete(removeTransaction);
routes.route("/transaction").put(editTransaction);
routes.route("/ins").post(addIn);
routes.route("/ins").get(getIns);
routes.route("/ins").delete(removeIn);
routes.route("/ins").put(editIn);
routes.route("/sms").post(addSMSIn);
routes.route("/changeYear").post(changeYear);
routes.route("/wakeup").get(wakeUp);


module.exports = routes;
