import User from "../models/User";
import { createSecretToken } from "../lib/generateToken";
import bcrypt from "bcrypt";
import { Response, Router } from "express";
import { AuthenticatedRequest } from "./middleware";
import Transaction from "../models/Transaction";
import { parseTransaction } from "../lib/agent";

const agentRouter = Router(); // create router to create route bundle

agentRouter.post('/upload', async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (
            !(
                req.body.message
            )
        ) {
            return res.status(400).json({ message: "Message is required" });
        }

        const { message } = req.body;
        //send to ai agent to parse, get result back
        const transaction = await parseTransaction(message);

        // const result = await Transaction.create(transaction);
        res.json(transaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to insert transaction" });
    }
});

export default agentRouter;