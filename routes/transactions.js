const dbo = require("../db/conn");
const mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
const  verifyUser  = require("./middleware");
const { Router } = require("express");
const router = Router(); // create router to create route bundle
const  Transaction  = require("../models/Transaction");

const monthMap = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

router.post("/transaction", verifyUser, async (req, res) => {
  try {
    const transaction = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      uid: req.uid,
      out: req.body.out, // Assuming this should always be false as per your original code
      payment: req.body.payment,
      type: req.body.type
    };

    const result = await Transaction.create(transaction);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to insert transaction" });
  }
});

router.get("/transaction", verifyUser, async (req, res) => {
  if (
    req.query.month === undefined ||
    req.query.year === undefined ||
    req.query.out === undefined
  ) {
    return res.status(400).send("Missing required fields");
  }

  const month = monthMap[req.query.month];

  const startDate = new Date(`${req.query.year}-${month}-01`);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);

  try {
    const transactions = await Transaction.find({
      uid: req.uid,
      out: req.query.out,
      date: {
        $gte: startDate.toISOString().split("T")[0],
        $lt: endDate.toISOString().split("T")[0],
      },
    }).exec();

    // Adjusting amount to fixed decimal places
    transactions.forEach((transaction) => {
      transaction.amount = transaction.amount.toFixed(2);
    });

    if (req.query.out) {
      const tableData = crunchNumbers(transactions);
      res.json({ transactions, tableData });
    } else {
      res.json(transactions);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

function crunchNumbers(transactions) {
  let tableData = {
    Food: 0.0,
    Groceries: 0.0,
    Travel: 0.0,
    Personal: 0.0,
    Other: 0.0,
    "Big Ticket": 0.0,
    Total: 0.0,
    TotalNoBT: 0.0,
  };
  transactions.forEach((transaction) => {
    if (
      transaction.type === "Lunch" ||
      transaction.type === "Breakfast" ||
      transaction.type === "Dinner"
    ) {
      tableData["Food"] += transaction.amount;
    } else {
      tableData[transaction.type] += transaction.amount;
    }

    if (transaction.type !== "Big Ticket") {
      tableData["TotalNoBT"] += transaction.amount;
    }
    tableData["Total"] += transaction.amount;
  });

  for (let key in tableData) {
    tableData[key] = tableData[key].toFixed(2);
  }
  return tableData;
}

router.put("/transaction", verifyUser, async (req, res) => {
  if (req.query._id === undefined) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const query = { _id: new ObjectId(req.query._id) }; // Assuming req.query._id is a valid ObjectId string
    const replacement = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      payment: req.body.payment,
      uid: req.uid,
      out: req.body.out,
      type: req.body.type
    };

    const result = await Transaction.findOneAndUpdate(query, replacement, {
      new: true,
    }).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update expense" });
  }
});

router.delete("/transaction", verifyUser, async (req, res) => {
  if (req.query._id === undefined) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const query = { _id: new ObjectId(req.query._id) }; // Assuming req.query._id is a valid ObjectId string

    const result = await Transaction.deleteOne(query).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

module.exports = router;
