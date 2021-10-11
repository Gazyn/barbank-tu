const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require('bcrypt');

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