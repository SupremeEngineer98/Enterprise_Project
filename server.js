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

 //validating that id won't be null!
 if(!id)
 {
    return res.status(400).json({message:'Please provide an id'});
 }

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
    return res.status(204).json({message:`Success, data deleted`});
    

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


    //creating the delete project endpoint!
    app.delete('/winewise/project/del/:id',(req,res)=>{
        //retrieving the id
        const id = parseInt(req.params.id,10);

        //returning an error message if id wasn't provided!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }

        //searching whether id exists or not!
        let sql_validate = `Select *FROM projects where id =?`;

        //executing the query!
        DB.get(sql_validate,[id],function(err,row){

            //returning an error message if server does not respond
            if(err)
            {
                return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if id wasn't found!
            if(!row)
            {
                return res.status(404).json({message:`Project with id:${id} does not exist`});
            }

            //if id exists!
            let sql_del = `DELETE FROM projects where id = ?`;

            //executing the query!
            DB.run(sql_del,[id],function(err){
                  //returning an error message if server does not respond
            if(err)
            {
                return res.status(500).json({message:`Server does not respond:${err.message}`});
            }
             
             //returning a success message if project was deleted!
             return res.status(204).json({message:`Success, project with id:${id} has been deleted`});

            })

        })
    });


    //creating the post carousel pics endpoint!
    app.post('/post/image/carousel',(req,res)=>{

        //retrieving the body values!
        const {image_url,title} = req.body;

        //returning an error message if inputs are null!
        if(!image_url || ! title)
        {
            return res.status(400).json({message:'Please complete all the required fields'});
        }

        //executing the sql query!
        let sql = 'INSERT into carousel (image_url,title)values(?,?)';

        DB.run(sql,[image_url,title],function(err){
            
            
            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning a success message if data has been posted!
            return res.status(201).json({message:'Success data has been posted'});
        })
    });


    //endpoint which allows users to retrieve carousel images!
    app.get('/carousel/images',(req,res)=>{

        //creating the sql query!
        let sql = 'SELECT * FROM carousel';

        //executing the query!
        DB.all(sql,[],function(err,rows){
              //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if there isn't at least one images inside the DB!
            if(!rows)
            {
                return res.status(404).json({message:`Images could not be found`});
            }

            //if images exist!
            let data = {images:[]};

            //pushing data to the array via forEach loop!
            rows.forEach((row)=>{
                data.images.push({
                    id:row.id,
                    image:row.image_url,
                    title:row.title
                });
            });

            //returning data in json format!
            return res.status(200).json(data);
        })
    });



    //endpoint which enables user to update a carousel image!
    app.put('/carousel/image/update/:id',(req,res)=>{
        //retrieving the id from the url!
        const id = parseInt(req.params.id,10);

        //returning an error message if id has not been provided!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id!'});
        }

        //creating the array which will hold the body elements!
        const {image_url,title} = req.body;

        //returning an error message if body is empty!
        if(!image_url || !title)
        {
            return res.status(400).json({message:'Please complete all the inputs'});
        }

        //creating the sql to validate if id is real!
        let sql_id = `SELECT * FROM carousel where id = ?`;

        //executing the first query!
        DB.get(sql_id,[id],function(err,row){
             //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if id does not exist!
            if(!row)
            {
                return res.status(404).json({message:`Id does not exist`});
            }

            //if id exists continuing!
            let sql = 'UPDATE carousel set image_url = ?, title = ?';

            //executing the second query!
            DB.run(sql,[image_url,title],function(err){
                 //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

             //returning an error message if update failed!
             if(this.changes ===0)
             {
                return res.status(400).json({message:'Update failed'});
             }

             //returning a success message if update has been completed!
             return res.status(201).json({message:`Update was successful`});

            })

        })

        
    })

     //creating the endpoint which retrieves a unique carousel image by providing its id!
     app.get('/carousel/image/:id',(req,res)=>{
        //retrieving the id from url!
        const id = parseInt(req.params.id,10);

        //returning an error message if use didn't provide an id!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }

        //creating the sql query!
        let sql = 'SELECT * FROM carousel where id = ?';

        //executing the query!
        DB.get(sql,[id],function(err,row){
                 //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if entry with the given id does not exists!
            if(!row)
            {
                return res.status(404).json({message:`Image with the id:${id} cannot be found`});
            }

            //if image exists creating an array to store it!
            let data = {image:[]}
            
            //pushing data in the array!
            data.image.push(
                {
                    id:row.id,
                    image_url:row.image_url,
                    title:row.title
                }
            )

            //returning data in json format!
            return res.status(200).json(data);


        });
        
     });


     //creating the endpoint which enables users to delete a requested image!
     app.delete('/carousel/image/del/:id',(req,res)=>{
        //retrieving the id from the url!
        const id = parseInt(req.params.id,10);

        //returning an error message if use didn't provide an id!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }

        //creating the sql query to validate if the id actually exists or not!
        let sql_id = `Select * from carousel where id = ?`;

        //executing the query!
        DB.get(sql_id,[id],function(err,row){
            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if entry with the given id does not exists!
            if(!row)
            {
                return res.status(404).json({message:`Image with the id:${id} cannot be found`});
            }

            //if id has been found!
            let sql = 'Delete from carousel where id = ?';

            //executing the query!
            DB.run(sql,[id],function(err){
                //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

             //returning a successful message to inform user that the image has been deleted!
             return res.status(204).json({message:`Success.The image with id:${id} has been deleted`});

            })

        })
     })


     //creating the endpoint which allows users to post contact info!
     app.post('/contact_info/post',(req,res)=>{
        //retrieving the body and storing it into an array!
        const {email,phone,address} = req.body;

        //returning an error message if an input is missing!
        if(!email || !phone || !address)
        {
           return res.status(400).json({message:'Please complete all the required fields'});
        }

        //creating the insert sql query!
        let sql = 'INSERT INTO contact(email,phone,address) values (?,?,?)';

        //executing the query!
        DB.run(sql,[email,phone,address],function(err){
            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }
             
            //returning a success message to confirm that post was successful!
            return res.status(201).json({message:'Success contact info has been submitted'});


        })
     });

     //endpoint which allows users to retrieve contact info!
     
    app.get('/contact/info/get',(req,res)=>{

        //creating the sql query!
        let sql = 'SELECT * FROM contact';

        //executing the query!
        DB.all(sql,[],function(err,rows){
              //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if there isn't at least one contact info inside the DB!
            if(!rows)
            {
                return res.status(404).json({message:`Contacts could not be found`});
            }

            //if images exist!
            let data = {contacts:[]};

            //pushing data to the array via forEach loop!
            rows.forEach((row)=>{
                data.contacts.push({
                    id:row.id,
                    email:row.image_email,
                    phone:row.phone,
                    address:row.address
                });
            });

            //returning data in json format!
            return res.status(200).json(data);
        })
    });
           
    //creating the endpoint which allows user to retrive one requested contact info!
     app.get('/contact/info/get/:id',(req,res)=>{
        //retrieving the id from url!
        const id = parseInt(req.params.id,10);

        //returning an error message if use didn't provide an id!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }

        //creating the sql query!
        let sql = 'SELECT * FROM contact where id = ?';

        //executing the query!
        DB.get(sql,[id],function(err,row){
                 //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if entry with the given id does not exists!
            if(!row)
            {
                return res.status(404).json({message:`Contact with the id:${id} cannot be found`});
            }

            //if image exists creating an array to store it!
            let data = {contact:[]}
            
            //pushing data in the array!
            data.contact.push(
                {
                    id:row.id,
                    email:row.email,
                    phone:row.phone,
                    adress:row.address
                }
            )

            //returning data in json format!
            return res.status(200).json(data);


        });
        
     });
    
     //creating the put endpoint which allows a user to update contact info!
     //creating the endpoint which allows users to post contact info!
     app.put('/contact_info/update/:id',(req,res)=>{

        //retrieving the id!
        const id = parseInt(req.params.id,10);

        //returning an error message if id wasn't provided!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }
        //retrieving the body and storing it into an array!
        const {email,phone,address} = req.body;

        //returning an error message if an input is missing!
        if(!email || !phone || !address)
        {
           return res.status(400).json({message:'Please complete all the required fields'});
        }

        //validating that the provided id actually exists!
        let sql_id = 'SELECT * FROM contact where id = ?';

        //executing the query!
        DB.get(sql_id,[id],function(err,row){

            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if id does not exists!
            if(!row)
            {
                return res.status(404).json({message:`The id:${id} does not exist`});
            }

            //if id exists continuing!        

        //creating the insert sql query!
        let sql = 'UPDATE contact set email = ?, phone = ?, address = ?';

        //executing the query!
        DB.run(sql,[email,phone,address],function(err){
            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if update fails!
            if(this.changes ===0)
            {
                return res.status(400).json({message:'Update failed'});
            }
             
            //returning a success message to confirm that update was successful!
            return res.status(201).json({message:'Success contact info has been updated'});


        })
        })
     }); 

      //creating the delete contact info endpoint!
      app.delete('/contact/info/del/:id',(req,res)=>{
        //retrieving the id!
        const id = parseInt(req.params.id,10);

        //returning an error message if id wasn't provided!
        if(!id)
        {
            return res.status(400).json({message:'Please provide an id'});
        }

        //validating that id exists!
        let sql_id = 'SELECT * FROM contact where id = ?';

        //executing the query!
        DB.get(sql_id,[id],function(err,row){
            //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }

            //returning an error message if id does not exist!
            if(!row)
            {
                 return res.status(404).json({message:`The id:${id} does not exist`});
            }

            //if id exists continuing!
            let sql_del = 'DELETE FROM contact where id = ?';

            //executing the query!
            DB.run(sql_del,[id],function(err){
                //returning an error message if server does not respond
            if(err)
            {
            return res.status(500).json({message:`Server does not respond:${err.message}`});
            }
             
             //returning a success message to inform the user tht the contact informations have been deleted!
             return res.status(204).json({messag:`Success, the information with id:${id} have been deleted`});

            })

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