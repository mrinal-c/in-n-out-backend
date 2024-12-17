const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;
const verifyUser = require("./middleware");
const { Router } = require("express");
const router = Router(); // create router to create route bundle
const Transaction = require("../models/Transaction");
const User = require("../models/User");

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
      tags: req.body.tags,
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
    res.status(500).json({ message: "Failed to insert transaction" });
  }
});

router.get("/transaction", verifyUser, async (req, res) => {
  if (
    req.query.month === undefined ||
    req.query.year === undefined ||
    req.query.out === undefined
  ) {
    return res.status(400).json({ message: "Missing required fields" });
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
    )
      .lean()
      .exec();

    // Adjusting amount to fixed decimal places
    transactions.forEach((transaction) => {
      transaction.amount = parseFloat(transaction.amount.toFixed(2));
      transaction.date = transaction.transactionDate;
      delete transaction.transactionDate;
    });

    if (req.query.out === "true") {
      const tableData = await crunchNumbers(transactions, req.uid);
      res.json({ transactions, tableData });
    } else {
      res.json({ transactions });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

async function crunchNumbers(transactions, uid) {
  try {
    const user = await User.findOne({ _id: uid }).lean().exec();
    const table = user.table;
    const tableData = {};

    table.forEach((row) => {
      const { category } = row;
      tableData[category] = 0;
    });

    transactions.forEach((transaction) => {
      const transactionTags = transaction.tags;

      table.forEach((row) => {
        const { category, tags: categoryTags } = row;

        // Check if any tag in the transaction matches the category tags
        if (transactionTags.some((tag) => categoryTags.includes(tag))) {
          tableData[category] += transaction.amount; // Add the transaction value
        }
      });
    });

    for (let key in tableData) {
      tableData[key] = tableData[key].toFixed(2);
    }

    return tableData;
  } catch (err) {
    return {};
  }
}

router.put("/transaction", verifyUser, async (req, res) => {
  if (req.query._id === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const query = { _id: new ObjectId(req.query._id) }; // Assuming req.query._id is a valid ObjectId string
    const newFields = {
      $set: {
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        transactionDate: req.body.date,
        payment: req.body.payment,
        tags: req.body.tags,
        out: req.body.out
      },
    };

    const result = await Transaction.findOneAndUpdate(query, newFields).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

router.delete("/transaction", verifyUser, async (req, res) => {
  if (req.query._id === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const query = { _id: new ObjectId(req.query._id) }; // Assuming req.query._id is a valid ObjectId string

    const result = await Transaction.deleteOne(query).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

module.exports = router;
