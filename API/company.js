//this file contains all endpoints which they 'll interact with the table company!
//creating new objects for expressand the DB!
const express = require('express');

const db = require('../database/tables/safety_quiz_db.js');
const router = express.Router();//creating the router object!


//creating the post company endpoint!
router.post('/', (req,res)=>{
    //creating an array to store all attributes!
    const {name, status} = req.body;

    //validating that inputs won't be null!
    if(!name || !status)
    {
        return res.status(400).json({error: `Please complete all inputs`});
        
    }

    //insert into db!
    try{
        //query to insert data into the db!
        let stmt = db.prepare(`Insert into company (name,status) values (?,?)`);

        const info = stmt.run(name,status)//executing the stmt!

        //returning a successful message!
        return res.status(201).json({message:'Data has been inserted with success',id: info.lastInsertRowid});

    }catch(err)//handling all the possible errors!
    {
        //handling unique constaint error!
        if(err.message.includes('UNIQUE'))
        {
            return res.status(409).json({error: 'Company already exists'});
        }
        return res.status(500).json({error: err.message});//returning an error message if server does not respond!
    }
    
});

//get all companies endpoint!
router.get('/', (req,res)=>{

    //executing the sql query!
    try{
        //creating a prepare stament!
        let stmt = db.prepare(`SELECT * FROM company`);

        //executing the stmt!
        let companies = stmt.all();

        //returning the array with the companies!
        return res.status(200).json(companies);


    }catch(err)
    {
        //returning an error message if table is empty!
        if(companies.length === 0)
        {
            return res.status(404).json({message:`There aren't any companies registered yet`})
        }
        
    }
    //returning an error message if server does not respond!
    return res.status(500).json({error: err.message});
})



//exporting the router!
module.exports = router;