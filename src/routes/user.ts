import User from "../models/User";
import { Router } from "express";
import { AuthenticatedRequest, verifyUser } from "./middleware";
import { Request, Response, NextFunction } from 'express';
import { createSecretToken } from "../lib/generateToken";

const userRouter = Router(); // create router to create route bundle


userRouter.put('/table', verifyUser, async (req: AuthenticatedRequest, res: Response) => {
    if (req.query.isOut === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const body = req.query.isOut === "true" ? { outTable: req.body.outTable } : { inTable: req.body.inTable };
    try {
        const user = await User.findByIdAndUpdate(req.uid, body, { new: true }).lean().exec();
        const token = createSecretToken(user);
        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

})

export default userRouter;

