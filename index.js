const express = require('express')
const mongoose = require('mongoose')
const swaggerUI = require('swagger-ui-express');
const app = express()
const port = 3000
const yaml = require('js-yaml');
const fs = require('fs');

try {
  const swaggerDocument = yaml.load(fs.readFileSync('swagger.yaml', 'utf8'));
  app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
} catch (e) {
  console.log(e);
}

//parse request body
app.use(express.json())

//Loads .env file contents into process.env
require("dotenv").config()

//register routes
app.use('/users', require('./routes/users'))
app.use('/sessions', require('./routes/sessions'))

//open connection to mongodb
mongoose.connect(process.env.MONGODB_URL, function(err) {
  if (err) throw Error;
  console.log("Connected to Mongo")
})

//begins listening on port 3000 for connections
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})