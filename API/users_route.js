//this file contains all user's endpoints(Get all, get by id, update email,password, get all users working in a company, delete users)
//Authorization administrator. Super user will only be able to delete simple users. Admin will be able to delete both super and users!
//creating new objects for express and the DB!
const express = require('express');

const db = require('../database/tables/safety_quiz_db.js');//db object!


const {verifyToken, authorizeRoles } = require('./middleware'); //creating the authorizeRoles object!

const router = express.Router();//creating the router object!

const bcrypt = require('bcrypt');//bcrypt object!


//mounting the verify token!
router.use(verifyToken);

//GET /users_route/users
//authorization ADMIN
//admin can see everybody!
router.get('/', authorizeRoles(2), async (req,res)=>{

    //executing the query!
    try
    {
      let stmt = db.prepare(`SELECT * FROM user`);

      //executing the query!
      let users = stmt.all()

      //return an error message if there are not any users registered yet!
      if(users.length === 0)
      {
        return res.status(404).json({message: `No users found`});
      }

      //if users exist!
      return res.status(200).json(users);

    }catch(err)//handling errors!
    {
        //return an error message if server does not respond!
        return res.status(500).json({error: err.message});
    }
});

//exporting the module!
module.exports = router;
