//creating the sqlite3 DB!
const sqlite3 = require('sqlite3').verbose();

//creating the DB file!
const DB = new sqlite3.Database('./site_db.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, connected);


//creating the function which connects the DB
function connected(err)
{
    //returning an error message if sth goes wrong!
    if(err){
        console.log(err.message);//logging the error message!
        return
    }

    //if all goes well!
    //returning a success message.
    console.log('Database has been created with success. If already exists ignore this message');
}

//creating the tables!
function create_tables()
{
    //sql statement to create tables!
    let sql_create_tables = 
    `
     BEGIN TRANSACTION;
     
     Create table if not exists company_info 
     (id integer primary key autoincrement, title TEXT not null, content TEXT not null, company_image text not null);
     
     Create table if not exists carousel
     (id integer primary key autoincrement, image_url TEXT not null, title TEXT not null );

     Create table if not exists projects (id integer primary key autoincrement, name TEXT not null, description text NOT NULL, image_url text not null);
     
     Create table if not exists contact (id integer primary key autoincrement, email TEXT NOT NULL, phone TEXT not null, address TEXT not null);
     
     COMMIT ;
    `

    //DB query to create the tables!
    DB.run(sql_create_tables, [], (err)=>{
        //returning an error message if sth goes wrong!
        if(err){
            console.log(err.message);//logging the error message!
            return
        }

        //returning a success message if all goes well!
        console.log('Success. Tables have been created. Ignore this message if tables already exist');
    })
};

//executing the create_tables fucntion
create_tables();

//Exporting the DB
export{DB}