const dbo = require("../db/conn");
const {verifyClientToken} = require("./admin");
var ObjectId = require('mongodb').ObjectID;


exports.addIn = async (req, res) => {
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
            let ins = {
                description: req.body.description,
                amount: parseFloat(req.body.amount),
                date: req.body.date,
                uid: req.query.uid,
                out: false,
                payment: req.body.payment,
            };
            db_connect
                .collection(req.query.month)
                .insertOne(ins)
                .then((result) => {
                    res.json(result);
                })
                .catch((err) => {
                    console.log(err);
                    res.json(err);
                });
        }
    })
    .catch( (err) => {
        console.log(err);
        res.json(err);
    });
    
}

exports.getIns = async (req, res) => {
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
                .find({uid: req.query.uid, out: false})
                .toArray()
                .then((ins) => {
                    for (let i = 0; i < ins.length; i++) {
                        ins[i].amount = ins[i].amount.toFixed(2);
                    }
                    res.json(ins);
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

exports.editIn = async (req, res) => {
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
                amount: parseFloat(req.body.amount),
                date: req.body.date,
                payment: req.body.payment,
                uid: req.query.uid,
                out: false
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


exports.removeIn = async (req, res) => {
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


// exports.updateAll = async (req, res) => {
//     if (req.headers.accesstoken === undefined) {
//         res.status(400).send("Missing required fields");
//         return;
//     }
//     verifyClientToken(req.headers.accesstoken)
//     .then( (result) => {
//         if (result.action !== "PASS") {
//             res.status(401).send(result.action);
//             return;
//         } else if (result.action === "PASS") {
//             let db_connect = dbo.getDb("2022");
//             db_connect
//                 .collection(req.query.month)
//                 .updateMany(
//                     {},
//                     {$set: {"out": true}}
//                 )
//                 .then((result) => {
//                     res.json(result);
//                 })
//                 .catch((err) => {
//                     res.json(err);
//                 });
//         }
//     })
//     .catch( (err) => {
//         res.json(err);
//     });
// }