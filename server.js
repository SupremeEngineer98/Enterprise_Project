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

//importing path modules
const path = require('path');

const port = 4000;//setting port to listen on 4000 socket!

//setting the middleware to parse json
app.use(bodyParser.urlencoded({extended:true}));

//configuring api to read images from the folder upload_images!
app.use(express.static(path.join(__dirname,'upload_images')));


//method to configure port!
app.listen(port, (err)=>{
    //returning an error message if sth goes wrong with the port!
    if(err){
        console.log(`Error. Cannot connect to the port:${port}.${err.message}`);
    }

    //returning a success message if port is working!
    console.log(`Success.Connection established into port:${port}`);
})