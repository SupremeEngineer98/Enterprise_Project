//importing the connect.js file
const connect = require('./connect.js');
//importing db
const DB = require('./connect.js');
     
     //creating the tables!
function create_company_info_table()
{
    //sql statement to create tables!
    let sql_table_company_info = `    
     Create table if not exists company_info 
     (id integer primary key autoincrement, title TEXT not null, content TEXT not null, company_image text not null);
    `

    //DB query to create the tables!
    DB.run(sql_table_company_info, [], (err)=>{
        //returning an error message if sth goes wrong!
        if(err){
            console.log(err.message);//logging the error message!
            return
        }

        //returning a success message if all goes well!
        console.log('Success. Table has been created. Ignore this message if table already exists');
    })
};

//function to create carousel table!
function create_carousel_table(){

    //creating the sql statement!
    let sql_table_carousel = `Create table if not exists carousel
     (id integer primary key autoincrement, image_url TEXT not null, title TEXT not null );`
    //DB query to create the tables!
    DB.run(sql_table_carousel, [], (err)=>{
        //returning an error message if sth goes wrong!
        if(err){
            console.log(err.message);//logging the error message!
            return
        }

        //returning a success message if all goes well!
        console.log('Success. Table has been created. Ignore this message if table already exists');
    })
};

//function to create projects table!
function create_projects_table(){

    //creating the sql statement!
    let sql_table_projects = `
    Create table if not exists projects 
    (id integer primary key autoincrement, name TEXT not null, description text NOT NULL,
     image_url text not null);
       `
    //DB query to create the tables!
    DB.run(sql_table_projects, [], (err)=>{
        //returning an error message if sth goes wrong!
        if(err){
            console.log(err.message);//logging the error message!
            return
        }

        //returning a success message if all goes well!
        console.log('Success. Table haas been created. Ignore this message if table already exists');
    })
};


//function to create projects table!
function create_projects_table(){

    //creating the sql statement!
    let sql_table_contact = `
     Create table if not exists contact 
     (id integer primary key autoincrement, email TEXT NOT NULL, phone TEXT not null, address TEXT not null);
       `
    //DB query to create the tables!
    DB.run(sql_table_contact, [], (err)=>{
        //returning an error message if sth goes wrong!
        if(err){
            console.log(err.message);//logging the error message!
            return
        }

        //returning a success message if all goes well!
        console.log('Success. Table has been created. Ignore this message if tablealready exists');
    })
};

//create company_info_table!
create_company_info_table()

//creating the carousel table!
create_carousel_table();

//creating projects table!
create_projects_table();

//creating contact table!
 create_projects_table();