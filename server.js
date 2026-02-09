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

const port = 3000;//setting port to listen on 4000 socket!

//setting the middleware to parse json
app.use(bodyParser.json());

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
         id:row.id,
         title:row.title,
         content:row.content,
         company_image:row.company_image
        }]};

        //returning data in json format!
        return res.status(200).json(data);
      

        
    });

});

//put endpoint to update company's info!
app.put('/company_info/put/:id',(req,res)=>{
    //getting body values!
   const {title,content,company_image} = req.body;

   //retrieving the id from url!
   const id = parseInt(req.params.id,10);
   
   //returning an error message if values are empty!
   if(!title || ! content || ! company_image){
    return res.status(400).json({message:'Please complete all required inputs'});
   }

   //validating that id exists!
   let sql_id = 'SELECT * FROM company_info where id =?';

   //executing the query to find out if id exists!
   DB.get(sql_id,[id],function(err,row){
    //returning an error message if server does not respond!
    if(err)
    {
        return res.status(500).json({message:`Error. Server does not respond:${err.message}`});
    }
     
     //returning an error message if id does not exist!
     if(!row)
     {
        return res.status(404).json({message:'Id does not exist'});
     }

     //if id exists!
      //creating the sql query to insert data into DB
   let sql = `UPDATE company_info set title = ?, content = ?, company_image = ? where id = ?;`

   //executing the query!
   DB.run(sql,[title,content,company_image,id],function(err){
    
    //returning an error message if server does not respond!
    if(err)
    {
        return res.status(500).json({message:`Error. Server does not respond:${err.message}`});
    }

    //returning error message if id does not exists!
    if(this.changes === 0)
    {
        return res.status(404).json({message:'Update failed'});
    }

    //if all goes well!
    return res.status(201).json({message:'Success, data has been updated'});

   });

   })

  

});


//creating the delete endpoint!
app.delete('/company_info/del/:id',(req,res)=>{
 //retrieving the id from the url!
 const id = parseInt(req.params.id, 10);//parsing the id!

 //validating that id exists!
 let sql_id = 'SELECT * FROM company_info where id =?';
  
  //executing the query to find out whether id exists or not!
  DB.get(sql_id,[id],function(err,row){
    //returning an error message if server does not respond
    if(err)
    {
        return res.status(500).json({message:`Server does not respond:${err.message}`});
    }

    //returning an error message if id does not exist!
    if(!row)
    {
        return res.status(404).json({message:'Id does not exist'});
    }

    //if all goes well!
     //creating the sql query!
 let sql = `Delete from company_info where id = ?`;

 //executing the query!
 DB.run(sql,[id],function(err){

    //returning an error message if server does not respond
    if(err)
    {
        return res.status(500).json({message:`Server does not respond:${err.message}`});
    }

    //if all goes well!
    return res.status(200).json({message:`Success, data deleted`});
    

 });

  })




});


//post projects endpoint!
app.post('/winwise/projects/new_post',(req,res)=>{

    //creating the body variable!
    const {name,description,image_url} = req.body;

    //returning an error message if any field is null!
    if(!name || ! description || ! image_url)
    {
        return res.status(400).json({message:'Please complete all required fields'})
    }

    

    //creating the sql query!
    let sql = 'INSERT INTO projects(name,description,image_url)values(?,?,?)';

    //executing the query!
    DB.run(sql,[name,description,image_url],function(err){

        //returning an error message if server does not respond
        if(err)
        {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
        }

        //returning success code/message if all goes well!
        return res.status(201).json({message:'Project posted with success!'});
    });
});

//creating the get projects endpoint!
app.get('/winwise/all/projects',(req,res)=>{
    //creating the sql query!
    let sql = 'SELECT * FROM projects;'

    //executing the query!
    DB.all(sql,[],function(err,rows){
        //returning an error message if server does not respond
        if(err)
        {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
        }

        //returning an error message if there are not any entries in the DB!
        if(!rows)
        {
            return res.status(404).json({message:'Sorry,there are not posted projects yet in the DB'});
        }


        //if rows found creating an array to store all data!
        data = {projects:[]}

        rows.forEach((row)=>{
        data.projects.push({
            id:row.id,
            project:row.name,
            description:row.description,
            image:row.image_url

        }); 

        })
        //returning the data in JSON format!
        return res.status(200).json(data);

    })
})

//creating the put endpoint to update projects!
app.put('/winwise/update/projects/:id',(req,res)=>{


    //retrieving the id from the http!
    const id = parseInt(req.params.id,10);
    //creating the body variable!
    const {name,description,image_url} = req.body;

      //returning an error message if any field is null!
    if(!id ||!name || ! description || ! image_url)
    {
        return res.status(400).json({message:'Please complete all required fields'})
    }


    //validating that the id actually exists!
    let sql_validate_id = 'SELECT * FROM projects where id = ?';

    //executing the query!
    DB.get(sql_validate_id,[id],function(err,row){
        //returning an error message if server does not respond
        if(err)
        {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
        }

        //returning an error message if id does not exists!
        if(!row)
        {
            return res.status(400).json({message:'Id does not exist'});
        }

        //if id has been found!
         //creating the sql query!
         let sql = 'Update projects set name = ?, description = ?, image_url = ? where id = ?';

     //executing the query!
    DB.run(sql,[name,description,image_url,id],function(err){

        //returning an error message if server does not respond
        if(err)
        {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
        }

        
          //returning an error message if update fail!
         if(this.changes === 0)
         {
            return res.status(404).json({message:`Update in project with id:${id} has failed`});
         }
               //returning success code/message if all goes well!
        return res.status(201).json({message:'Project updated with success!'});
    });


    });


});
    //creating the post method which retrieves only the requested post!
    app.get('/winwise/view_project/:id',(req,res)=>{
        //retrieving the id from the URL!
        const id = parseInt(req.params.id,10);

        //returning an error message if user didn't provide the id!
        if(!id)
        {
            return res.status(400).json({message:'Please provide the id'});
        }

        //creating the sql query!
        let sql = 'SELECT * FROM projects where id =?';

        //executing the query!
        DB.get(sql,[id],function(err,row){
              //returning an error message if server does not respond
            if(err)
            {
                return res.status(500).json({message:`Server does not respond:${err.message}`});
            }
             
             //returing an error message if query couldn't find any entries!
             if(!row)
             {
                return res.status(404).json({message:`Project with id:${id} does not exist`});
             }

             //creating an array if project has been found!
             let data = {project:[]};

             //pushing the values in the array!
             data.project.push(
                {
                    id:row.id,
                    project:row.name,
                    description:row.description,
                    image:row.image_url
                }
                      );

                    //converting data in JSON format!
                    return res.status(200).json(data);

        })
    })

        


//method to configure port!
app.listen(port, (err)=>{
    //returning an error message if sth goes wrong with the port!
    if(err){
        console.log(`Error. Cannot connect to the port:${port}.${err.message}`);
    }

    //returning a success message if port is working!
    console.log(`Success.Connection established in port:${port}`);
})