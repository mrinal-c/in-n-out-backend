import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import { AuthenticatedRequest, verifyUser } from "./middleware";
import { Router } from "express";
const transactionsRouter = Router(); // create router to create route bundle
import Transaction, { ITransaction } from "../models/Transaction";
import User from "../models/User";
import { Request, Response, NextFunction } from 'express';

transactionsRouter.post("/transaction", verifyUser, async (req: AuthenticatedRequest, res: Response) => {
  if (req.query.month === undefined || req.query.year === undefined) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const transaction = {
      description: req.body.description,
      amount: parseFloat(req.body.amount),
      transactionDate: req.body.transactionDate,
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

transactionsRouter.get("/transaction", verifyUser, async (req: AuthenticatedRequest, res: Response) => {
  if (req.query.month === undefined || req.query.year === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const transactions = (await Transaction.find(
      {
        uid: req.uid,
        month: req.query.month,
        year: req.query.year,
      },
      { month: false, year: false }
    )
      .lean()
      .exec()) as ITransaction[];

    // Adjusting amount to fixed decimal places
    transactions.forEach((transaction) => {
      transaction.amount = parseFloat(transaction.amount.toFixed(2));
    });

    const outTableData = await crunchNumbers(
      transactions.filter((transaction) => transaction.out),
      req.uid,
      true
    );
    const inTableData = await crunchNumbers(
      transactions.filter((transaction) => !transaction.out),
      req.uid,
      false
    );
    res.json({ transactions, outTableData, inTableData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

async function crunchNumbers(transactions: ITransaction[], uid: string, isOut: boolean) {
  try {
    const user = await User.findOne({ _id: uid }).lean().exec();
    if (!user) return;
    const table = isOut ? user.outTable : user.inTable;
    const tableData: Record<string, number> = {};
    let total = 0;

    table.forEach((row) => {
      const { category } = row;
      tableData[category] = 0;
    });

    transactions.forEach((transaction) => {
      const transactionTags = transaction.tags;
      total += transaction.amount;

      table.forEach((row) => {
        const { category, tags: categoryTags } = row;

        // Check if any tag in the transaction matches the category tags
        if (transactionTags.some((tag) => categoryTags.includes(tag))) {
          tableData[category] += transaction.amount; // Add the transaction value
        }
      });
    });

    tableData["Total"] = total;

    for (let key in tableData) {
      tableData[key] = parseFloat(tableData[key].toFixed(2));
    }

    return tableData;
  } catch (err) {
    return {};
  }
}

transactionsRouter.put("/transaction", verifyUser, async (req: AuthenticatedRequest, res: Response) => {
  if (req.query._id === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const query = { _id: new ObjectId(req.query._id as string) }; // Assuming req.query._id is a valid ObjectId string
    const newFields = {
      $set: {
        description: req.body.description,
        amount: parseFloat(req.body.amount),
        transactionDate: req.body.transactionDate,
        payment: req.body.payment,
        tags: req.body.tags,
        out: req.body.out,
      },
    };

    const result = await Transaction.findOneAndUpdate(query, newFields).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update expense" });
  }
});

transactionsRouter.delete("/transaction", verifyUser, async (req: AuthenticatedRequest, res: Response) => {
  if (req.query._id === undefined) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const query = { _id: new ObjectId(req.query._id as string) }; // Assuming req.query._id is a valid ObjectId string

    const result = await Transaction.deleteOne(query).exec();

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

export default transactionsRouter;
