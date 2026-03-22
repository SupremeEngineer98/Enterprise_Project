//importing the fs module to validate whether file exists or not!
const fs = require('fs')

//Create the DB object!
const DataBase = require('better-sqlite3');

//Check if the database file already exists!
const dbExists = fs.existsSync('safety_quiz_db.db');

//try-catch method to handle errors!
try{
     
    //creating the db file!
const db = new DataBase('safety_quiz_db.db');
if(dbExists)
{
    console.log('Database already exists');
}
else
{
    console.log('Database has been created');
}
db.close()//closing the connection!

}catch(err)
{
    console.error('Database could not be created!',err.message);//returning an error message if db cannot be created!
}


//exporting database file!
module.exports = db;

