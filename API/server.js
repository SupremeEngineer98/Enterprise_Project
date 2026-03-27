//configuring the connection with the DB!

require('../database/db_init');//creating the tables if they do not exist!

//creating new objects for express, cors and the DB!
const express = require('express');

const cors = require('cors');

const db = require('../database/tables/safety_quiz_db.js');

const companyRouter = require('./company'); //mounting the company router endpoint!

const { verifyToken } = require('./middleware');//mounting the middleware!

//mounting the auth route!
const authRouter = require('./auth_route');

//mounting the roles router endpoint!
const rolesRouter = require('./role_router')

//mounting the register router endpoint!
const registerRouter = require('./register_route');


//initiating the app!
const app = express();
//initiating the port that the server will hear!
const port = 3000;

// enabling the app to use cors!
app.use(cors());
//enabling the app to use express!
app.use(express.json());

//auth prefix!
app.use('/auth_route', authRouter);



//public!
//verifying that the api is up and running!
app.get('/', (req, res) => {
  res.send(' Server running!');
  console.log('api is up and running');

});

//verify token prefix!
app.use(verifyToken);

//register prefix!
app.use('/register_route', registerRouter)

app.use('/company', companyRouter); //company router prefix!

app.use('/role',rolesRouter) //roles router prefix!



//initiating the connection with port!
app.listen(port, ()=>{
    console.log('The api is listening to the port 3000');
});




