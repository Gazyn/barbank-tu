// Pull in dependencies
const router = require('express').Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const {verifyToken} = require("../middlewares");

// Handle POST /transactions
module.exports = router.post('/', verifyToken, async (req, res) => {

    // Validate required parameters
    if (typeof req.body.account === 'undefined' || typeof req.body.receiver === 'undefined' || typeof req.body.amount === 'undefined') {
        return res.status(400).send({error: 'Required parameter missing'});
    }
    
    //Retrieve account from mongo by account number
    const account = await Account.findOne({account_number: req.body.account});
    //Retrieve receiver from mongo by account number
    const receiver = await Account.findOne({account_number: req.body.receiver});

    // Check that amount is a valid number
    try {
        req.body.amount = Number(req.body.amount);
    } catch (e) {
        return res.status(401).send({error: 'Amount must be a valid number'});
    }

    // Check that account exists belongs to user
    if(!account || account.userId.toString() !== req.userId.toString()) {
        return res.status(401).send({error: 'Invalid or nonexistent account'});
    }

    if(!receiver) {
        return res.status(401).send({error: 'Invalid receiver'});
    }

    // Check if amount is available and not negative
    if(account.balance<req.body.amount || req.body.amount<0) {
        return res.status(401).send({error: 'Invalid amount'});
    }

    // Create transaction into database.
    await Transaction.create({
        userId: req.userId,
        account: req.body.account,
        receiver: req.body.receiver,
        amount: req.body.amount
    });

    account.balance-=req.body.amount;
    receiver.balance+=req.body.amount;

    account.save();
    receiver.save();
    return res.status(201).end();
})