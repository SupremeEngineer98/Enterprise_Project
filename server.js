//server file which contains server logic!
//importing the db!
const DB = require('./connect.js');
//importing express!
const express = require('express');
//importing body-parser!
const bodyParser = require('body-parser');
//creating the app!
const app = express();
app.use(bodyParser.json());//configuring app to use body-parser!

//importing path modules in order to access path!
const path = require('path');

const port = 4000;//setting port to listen on 4000 socket!

//setting the middleware to parse json
app.use(bodyParser.urlencoded({extended:true}));

//configuring api to read images from the folder upload_images!
app.use(express.static(path.join(__dirname,'upload_images')));



//creating the post company's info endpoint!
app.post('/company_info/post',(req,res)=>{

    //getting body values!
   const {title,content,company_image} = req.body;
   
   //returning an error message if values are empty!
   if(!title || ! content || ! company_image){
    return res.status(400).json({message:'Please complete all required inputs'});
   }

   //creating the sql query to insert data into DB
   let sql = `INSERT INTO company_info(title,content,company_image) values (?,?,?);`

   //executing the query!
   DB.run(sql,[title,content,company_image],function(err){
    
    //returning an error message if server does not respond!
    if(err)
    {
        return res.status(500).json({message:`Error. Server does not respond:${err.message}`});
    }

    //if all goes well!
    return res.status(201).json({message:'Success, data has been posted'});

   });

});


//creating the get company's info endpoint!
app.get('/company_info/get',(req,res)=>{

    //sql query to get company's info
    let sql = 'SELECT * FROM company_info;'

    //executing query
    DB.get(sql,[],function(err,row){

        //error message if server does not respond!
        if(err)
        {
            return res.status(500).json({message:`Error from the server:${err.message}`});

        }
          
        if(!row)
        {
            return res.status(404).json({message:`Couldn't find any data`});
        }

        //if all goes well creating an array to store the data!
        let data = {
            info:
            [{
         title:row.title,
         content:row.content,
         company_image:row.company_image
        }]};

        //returning data in json format!
        return res.status(200).json(data);
      

        
    });

});



//method to configure port!
app.listen(port, (err)=>{
    //returning an error message if sth goes wrong with the port!
    if(err){
        console.log(`Error. Cannot connect to the port:${port}.${err.message}`);
    }

    //returning a success message if port is working!
    console.log(`Success.Connection established into port:${port}`);
})