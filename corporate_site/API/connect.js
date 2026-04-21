//creating the sqlite3 DB!
const sqlite3 = require('sqlite3').verbose();

//creating the DB file!
const DB = new sqlite3.Database('./site.db',sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, connected);


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
     
     
     Create table if not exists company_info 
     (id integer primary key autoincrement, title TEXT not null, content TEXT not null, company_image text not null);
     
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
module.exports = DB;