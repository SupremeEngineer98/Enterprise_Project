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

        //returning an error message if table is empty!
        if(companies.length === 0)
        {
            return res.status(404).json({message:`There aren't any companies registered yet`})
        }

        //returning the array with the companies!
        return res.status(200).json(companies);


    }catch(err)
    {
        //returning an error message if server does not respond!
    return res.status(500).json({error: err.message});
        
    }
    
})

//get a specific company by its id endpoint!
router.get('/:id',(req,res)=>{
    //retrieving the id the params!
    const id = parseInt(req.params.id, 10);

    //returning an error message if id has not been provided!
    if(!Number.isInteger(id))
    {
        return res.status(400).json({error: `Please provide the required id`});
    }

    //creating the query!
    try{

        //creating the query!
        let stmt = db.prepare(`SELECT * FROM company where id = ?`);

        //executing the query!
        let company = stmt.get(id)

          if(!company) //returning an error message if company does not exists!
        {
            
         return res.status(404).json({message:`No company found under this id`});
        }

        //returning a success message with the company's details!
        return res.status(200).json(company);

    }catch(err)
    {
      return res.status(500).json({error: err.message});//returning an error message in case of a server error!
        
    }
    
});


//put company details endpoint. Update a specific row using its id!!
router.put('/:id',(req,res)=>{
    //retrieving the requested id from the url!
    const id = parseInt(req.params.id, 10);
      //creating an array to store all attributes!
    const {name, status} = req.body;

    //validating that inputs won't be null!
    if(!name || !status || !Number.isInteger(id))
    {
        return res.status(400).json({error: `Please complete all inputs`});
        
    }

    //insert into db!
    try{
        //query to insert data into the db!
        let stmt = db.prepare(`Update  company set name = ?, status =? where id =?`);

        const info = stmt.run(name,status,id)//executing the stmt!

        //returning an error message if id does not exists!
        if(info.changes === 0)
        {
            return res.status(404).json({error: `The company with id:${id} does not exist`});
        }

        //returning a successful message if all goes well!!
        return res.status(201).json({message:'Data has been updated with success'});

    }catch(err)//handling all the possible errors!
    {
        
        
        //handling unique constaint error!
        if(err.message.includes('UNIQUE'))// returning an error message if company's name already exist!
        {
            return res.status(409).json({error: 'Company already exists'});
        }
        return res.status(500).json({error: err.message});//returning an error message if server does not respond!
    }
    
});


//delete company by its endpoint!
router.delete('/:id',(req,res)=>{
    //retrieving the id from the url!
    const id = parseInt(req.params.id, 10);

    //return an error message if id is null!
    if(!Number.isInteger(id))
    {
        return res.status(400).json({message:`Please complete all the required fields!`});
    }

    //creating the sql query!
    try{

        //create the statement!
        let stmt = db.prepare(`Delete from company where id = ?`);

        //executing the query!
        let del_info = stmt.run(id);

        //return an error message if id does not exist!
        if(del_info.changes === 0)
        {
            return res.status(404).json({message:`Registration with id:${id} does not exist`});
        }

        //if deletion happens returning a successful message!
        return res.status(200).json({message:`The company with id:${id} has been deleted!!`});

    }catch(err)
    {
        //returning an error message in case of a server error!
        return res.status(500).json({error:err.message});
    }
})

//exporting the router!
module.exports = router;