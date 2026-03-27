//this file contains all endpoints to create the registration process!
//creating new objects for expressand the DB!
const express = require('express');

const db = require('../database/tables/safety_quiz_db.js');//db object!

const {verifyToken, authorizeRoles } = require('./middleware'); //creating the authorizeRoles object!

const router = express.Router();//creating the router object!

const bcrypt = require('bcrypt');//bcrypt object!

//mounting the verify token!
router.use(verifyToken);

//POST /register/superuser!
//authorization: administrator only (role_id:2)
//company and role id assigned by the token!
router.post('/superuser', authorizeRoles(2), async (req,res)=>{
    const {email, password} = req.body;

    //returning an error message if inputs are null!
    if(!email || ! password)
    {
        return res.status(400).json({error: `Please complete all inputs!`});
    }


    //creating the query!
    try
    {
        //hashing the password!
        const password_hash= await bcrypt.hash(password,10);

        //creating the stmt!
        let stmt = db.prepare
        (`
           INSERT into user (company_id, email, password_hash, role_id)
           values (?,?,?,?)
        `);

        //executing the query!
        let user = stmt.run(req.user.companyId, email, password_hash, 3); //company id(1) and superuser (role_id 3)

        //returning a successful message if all goes well!
        return res.status(201).json({message:`Super user has been created with success`,id: user.lastInsertRowid})


    }catch(err)// handling server and constraint errors!
    {
      if(err.message.includes('UNIQUE'))
      {
        return res.status(409).json({message:`Email already exists`});
      }
      return res.status(500).json({error: err.message});//returning an error message if server does not respond!
    }
});

//POST /register/user
//authorization: superuser only (role_id:3)
//company and role id assigned by the token!
router.post('/user',authorizeRoles(3),async (req,res)=>{
     const {email, password} = req.body;

    //returning an error message if inputs are null!
    if(!email || ! password)
    {
        return res.status(400).json({error: `Please complete all inputs!`});
    }


    //creating the query!
    try
    {
        //hashing the password!
        const password_hash= await bcrypt.hash(password,10);

        //creating the stmt!
        let stmt = db.prepare
        (`
           INSERT into user (company_id, email, password_hash, role_id)
           values (?,?,?,?)
        `);

        //executing the query!
        let user = stmt.run(req.user.companyId, email, password_hash, 4); //company id(1) and user (role_id 4)

        //returning a successful message if all goes well!
        return res.status(201).json({message:`User has been created with success`,id: user.lastInsertRowid})


    }catch(err)// handling server and constraint errors!
    {
      if(err.message.includes('UNIQUE'))
      {
        return res.status(409).json({message:`Email already exists`});
      }
      return res.status(500).json({error: err.message});//returning an error message if server does not respond!
    }

});


//exporting the register module!
module.exports = router;