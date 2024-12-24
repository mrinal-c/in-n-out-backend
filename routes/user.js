const User = require("../models/User");

const { Router } = require("express");
const verifyUser = require("./middleware");
const router = Router(); // create router to create route bundle
const { createSecretToken } = require("../lib/generateToken");


router.put('/table', verifyUser, async (req, res) => {
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

module.exports = router;