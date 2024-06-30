const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
const verifyUser = require("./middleware");
const { Router } = require("express");
const router = Router(); // create router to create route bundle
const Transaction = require("../models/Transaction");

router.post("/transaction", verifyUser, async (req, res) => {
  if (req.query.month === undefined || req.query.year === undefined) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const transaction = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      transactionDate: req.body.date,
      uid: req.uid,
      out: req.body.out,
      payment: req.body.payment,
      type: req.body.type,
      month: req.query.month,
      year: req.query.year,
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

  try {
    const transactions = await Transaction.find(
      {
        uid: req.uid,
        month: req.query.month,
        year: req.query.year,
        out: req.query.out,
      },
      { month: false, year: false }
    ).lean().exec();

    // Adjusting amount to fixed decimal places
    transactions.forEach((transaction) => {
      transaction.amount = parseFloat(transaction.amount.toFixed(2));
      transaction.date = transaction.transactionDate;
      delete transaction.transactionDate;
    });

    if (req.query.out === "true") {
      const tableData = crunchNumbers(transactions);
      res.json({ transactions, tableData });
    } else {
      res.json({ transactions });
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
    const newFields = {
      $set: {
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        transactionDate: req.body.date,
        payment: req.body.payment,
        out: req.body.out,
        type: req.body.type,
      },
    };

    const result = await Transaction.findOneAndUpdate(query, newFields).exec();

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
