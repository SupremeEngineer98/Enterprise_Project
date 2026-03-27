//this file contains the authorization's route code!

const express = require('express'); //importing express!

const router = express.Router();//creating the router!

const db = require('../database/tables/safety_quiz_db.js');//creating the DB object!

const bcrypt = require('bcrypt');//creating the bcrypt object!

const jwt = require('jsonwebtoken');//creating the toke object!

//exporting the auth object!
module.exports = router
