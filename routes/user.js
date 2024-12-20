const User = require("../models/User");

const { Router } = require("express");
const verifyUser = require("./middleware");
const router = Router(); // create router to create route bundle


router.put('/outTable', verifyUser, async (req, res) => {
    //update user "table" field to req.body.outTable
    try {
        const user = await User.findByIdAndUpdate(req.uid, { outTable: req.body.outTable }, { new: true }).lean();
        res.status(200).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }

})

module.exports = router;