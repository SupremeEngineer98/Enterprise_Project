//configuring the connection with the DB!
//creating new objects for express, cors and the DB!
const express = require('express');
const cors = require('cors');
const db = require('../database/tables/safety_quiz_db.js');
const companyRouter = require('./company'); //mounting the company router endpoint!

//initiating the app!
const app = express();
//initiating the port that the server will hear!
const port = 3000;

// enabling the app to use cors!
app.use(cors());
//enabling the app to use express!
app.use(express.json());

app.use('/company', companyRouter); //router prefix!

//verifying that the api is up and running!
app.get('/', (req, res) => {
  res.send(' Server running!');
  console.log('api is up and running');

});

//initiating the connection with port!
app.listen(port, ()=>{
    console.log('The api is listening to the port 3000');
});

