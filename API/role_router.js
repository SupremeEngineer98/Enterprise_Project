//this file contains all endpoints which they 'll interact with the table roles!
//creating new objects for express and the DB!
const express = require('express');

const db = require('../database/tables/safety_quiz_db.js');
const router = express.Router();//creating the router object!

//creating post role endpoint!
router.post('/',(req,res)=>{
    //retrieving body parameters!
    const {name} = req.body;

    //return error message if body is null!
    if(!name)
    {
        return res.status(400).json({message:`Please complete all parameters`});
    
    }

    //creating the DB query!
    try{
        
        //creating the prepare statement!
        let stmt = db.prepare(`INSERT into role (name) values (?)`);

        //executing the stmt!
        let data = stmt.run(name);

       
        //returning a confirmation message!
        return res.status(201).json({message: `Role:${name} has been created with success!`,id:data.lastInsertRowid});
    }catch(err)
    {
         //handling unique constaint error!
        if(err.message.includes('UNIQUE'))
        {
            return res.status(409).json({error: 'Role already exists'});
        }
        return res.status(500).json({error: err.message});//returning error message in case of server error!
    }
});




module.exports = router;
