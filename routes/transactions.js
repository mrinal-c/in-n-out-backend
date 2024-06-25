const dbo = require("../db/conn");
var ObjectId = require('mongodb').ObjectID;
const {verifyUser} = require('./middleware');
const {Router } = require('express')
const router = Router(); // create router to create route bundle
const {Transaction} = require('../models/Transaction');


router.post('/transaction', verifyUser,  async (req, res) => {
    
    try {
        const transaction = {
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            date: req.body.date,
            uid: req.uid,
            out: req.body.out, // Assuming this should always be false as per your original code
            payment: req.body.payment,
            month: req.body.month, // Assuming req.query.month and req.query.year are available
            year: req.body.year,
        };
    
        const result = await Transaction.create(transaction);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to insert transaction' });
    }
    
});

router.get('/transaction', verifyUser,  async (req, res) => {
    if (req.query.month === undefined || req.query.year === undefined || req.query.out === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    
    try {
        const transactions = await Transaction.find({ uid: req.uid, out: req.query.out, month: req.query.month, year: req.query.year});
        
        // Adjusting amount to fixed decimal places
        transactions.forEach(transaction => {
            transaction.amount = transaction.amount.toFixed(2);
        });

        if (req.query.out) {
            const tableData = crunchNumbers(transactions);
            res.json({transactions, tableData});
        } else {
            res.json(transactions);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
    
});

function crunchNumbers(transactions) {
    let tableData = {
        "Food": 0.0,
        "Groceries": 0.0,
        "Travel": 0.0,
        "Personal": 0.0,
        "Other": 0.0,
        "Big Ticket": 0.0,
        "Total": 0.0,
        "TotalNoBT" : 0.0
    };
    transactions.forEach((transaction) => {
        if (transaction.type === "Lunch" || transaction.type === "Breakfast" || transaction.type === "Dinner") {
            tableData["Food"] += transaction.price;
        } else {
            tableData[transaction.type] += transaction.price;
        }

        if (transaction.type !== "Big Ticket") {
            tableData["TotalNoBT"] += transaction.price;
        }
        tableData["Total"] += transaction.price;
    });
    
    for (let key in tableData) {
        tableData[key] = tableData[key].toFixed(2);
    }
    return tableData;
}


router.put('/transaction', verifyUser,  async (req, res) => {
    if (req.query._id === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    try {
        const query = { _id: req.query._id }; // Assuming req.query._id is a valid ObjectId string
        const replacement = {
            description: req.body.description,
            amount: parseFloat(req.body.amount),
            date: req.body.date,
            payment: req.body.payment,
            uid: req.body.uid,
            out: req.body.out,
            month: req.body.month, // Assuming month is also updated in replacement,
            year: req.body.year, // Assuming year is also updated in replacement
        };
    
        const result = await Expense.findOneAndUpdate(query, replacement, { new: true });
    
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update expense' });
    }
    
});



router.delete('/transaction', verifyUser,  async (req, res) => {
    if (req.query._id === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    try {
        const query = { _id: req.query._id }; // Assuming req.query._id is a valid ObjectId string
    
        const result = await Expense.deleteOne(query);
    
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
    
});