// This will help us connect to the database
const dbo = require("../db/conn");
const {verifyClientToken} = require("./admin");
var ObjectId = require('mongodb').ObjectID;

exports.getTransactions = async (req, res) => {
    if (req.query.month === undefined || req.headers.accesstoken === undefined || req.query.uid === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    verifyClientToken(req.headers.accesstoken)
    .then( (result) => {
        if (result.action !== "PASS") {
            res.status(401).send(result.action);
            return;
        } else if (result.action === "PASS") {
            let db_connect = dbo.getDb();
            db_connect
                .collection(req.query.month)
                .find({uid: req.query.uid, out: true})
                .toArray()
                .then((transactions) => {
                    for (let i = 0; i < transactions.length; i++) {
                        transactions[i].price = transactions[i].price.toFixed(2);
                    }
                    res.json(transactions);
                })
                .catch((err) => {
                    res.json(err);
                });
        }
    })
    .catch( (err) => {
        res.json(err);
    });
    
}


exports.addTransaction = async (req, res) => {
    if (req.query.month === undefined || req.headers.accesstoken === undefined || req.query.uid === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    verifyClientToken(req.headers.accesstoken)
    .then( (result) => {
        if (result.action !== "PASS") {
            res.status(401).send(result.action);
            return;
        } else if (result.action === "PASS") {
            let db_connect = dbo.getDb();
            let transaction = {
                description: req.body.description,
                price: parseFloat(req.body.price),
                date: req.body.date,
                type: req.body.type,
                payment: req.body.payment,
                uid: req.query.uid,
                out: true
            };
            db_connect
                .collection(req.query.month)
                .insertOne(transaction)
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    res.json(err);
                });
        }
    })
    .catch( (err) => {
        res.json(err);
    });
    
}

exports.removeTransaction = async (req, res) => {
    if (req.query.month === undefined || req.headers.accesstoken === undefined || req.query.uid === undefined || req.query._id === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    verifyClientToken(req.headers.accesstoken)
    .then( (result) => {
        if (result.action !== "PASS") {
            res.status(401).send(result.action);
            return;
        } else if (result.action === "PASS") {
            let query = {
                _id: new ObjectId(req.query._id)
            }
            let db_connect = dbo.getDb();
            db_connect
                .collection(req.query.month)
                .deleteOne(query)
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    res.json(err);
                });
                
        }
    })
    .catch( (err) => {
        res.json(err);
    });
    
}

exports.editTransaction = async (req, res) => {
    if (req.query.month === undefined || req.headers.accesstoken === undefined || req.query.uid === undefined || req.query._id === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    verifyClientToken(req.headers.accesstoken)
    .then( (result) => {
        if (result.action !== "PASS") {
            res.status(401).send(result.action);
            return;
        } else if (result.action === "PASS") {
            let query = {
                _id: new ObjectId(req.query._id)
            }
            let replacement = {
                description: req.body.description,
                price: parseFloat(req.body.price),
                date: req.body.date,
                type: req.body.type,
                payment: req.body.payment,
                uid: req.query.uid,
                out: true
            }
            let db_connect = dbo.getDb();
            db_connect
                .collection(req.query.month)
                .replaceOne(query, replacement)
                .then((data) => {
                    res.json(data);
                })
                .catch((err) => {
                    res.json(err);
                });
                
        }
    })
    .catch( (err) => {
        res.json(err);
    });
    
}

exports.getTableData = async (req, res) => {
    if (req.query.month === undefined || req.headers.accesstoken === undefined || req.query.uid === undefined) {
        res.status(400).send("Missing required fields");
        return;
    }
    verifyClientToken(req.headers.accesstoken)
    .then( (result) => {
        if (result.action !== "PASS") {
            res.status(401).send(result.action);
            return;
        } else if (result.action === "PASS") {
            let db_connect = dbo.getDb();
            db_connect
                .collection(req.query.month)
                .find({uid: req.query.uid, out: true})
                .toArray()
                .then((transactions) => {
                    let crunched = crunchNumbers(transactions);
                    res.json({tableData: crunched});

                })
                .catch((err) => {
                    res.json(err);
                });
        }
    })
    .catch( (err) => {
        res.json(err);
    });
    
}

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

    
