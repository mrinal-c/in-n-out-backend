import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
    description: string;
    amount: number;
    transactionDate: string;
    date?: string;
    uid: string;
    out: boolean;
    tags: string[];
    payment: string;
    month: string;
    year: string;
}

const TransactionSchema = new Schema<ITransaction>({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionDate: { type: String, required: true },
    date: { type: String, required: false },
    uid: { type: String, required: true },
    out: { type: Boolean, required: true },
    tags: { type: [String], required: false, default: [] },
    payment: { type: String, required: true },
    month: { type: String, required: true },
    year: { type: String, required: true },
});

const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);
export default Transaction;
