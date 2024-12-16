const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transactionDate: {
        type: String,
        required: true,
    },
    uid: {
        type: String,
        required: true,
    },
    out: {
        type: Boolean,
        required: true,
    },
    tags: {
        type: [String],
        required: false,
        default: []
    },
    payment: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true
    },
    month: {
        type: String, 
        required: true
    },
    year: {
        type: String, 
        required: true
    },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;