const router = require('express').Router();
const User = require('../models/User');
const Account = require('../models/Account');
const bcrypt = require('bcrypt');
const {verifyToken} = require('../middlewares');

//Handle /users POST request
module.exports = router.post('/', async (req, res) => {
    try {

      // Save user to DB
      const user = await new User({
        name: req.body.name,
        username: req.body.username,
        password: req.body.password
      }).save();

      // Hash password
      bcrypt.hash(req.body.password, 10, function(err, hash) {
        if (err) throw Error(JSON.stringify(err))
        user.password = hash;
        user.save()
      })

      // Create account
      const account = await new Account({
        userId: user._id,
        account_number: process.env.BANK_PREFIX + Math.floor(Math.random()*1e9).toString(),
        currency: 'euro',
        balance: 10000,
        name: 'Main'
      }).save();

      res.status(201).end()
    } catch (e) {

      //400 Missing parameter
      if(/User validation failed:/.test(e.message)) {
        return res.status(400).send({error: e.message});
      }

      //422 Field too short or too long
      if(/is (shorter|longer) than the (minimum|maximum)/.test(e.message)) {
        return res.status(422).send({error: e.message});
      }

      //409 User already exists
      if(/E11000 duplicate key error collection:/.test(e.message)) {
        return res.status(409).send({error: "Username already exists"});
      }

      // 500 Unknown error
      res.status(500).send(e.message)
    }
  })

  module.exports = router.get('/current', verifyToken, async (req, res) => {
    try {
      const user = await User.findOne({_id: req.userId});
      // 200 Success
      res.status(200).send({
        name: user.name, 
        username: user.username,
        accounts: await Account.find({userId: req.userId})
      })
    } catch (e) {
      if(req.params._id !== req.userId) {
        res.status(403).send({error: "Forbidden"});
      }
    }
  })