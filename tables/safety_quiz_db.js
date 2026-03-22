//importing the fs module to validate whether file exists or not!
const fs = require('fs');

//Create the DB object!
const DataBase = require('better-sqlite3');

//Check if the database file already exists!
const dbExists = fs.existsSync('safety_quiz_db.db');

//creating the db variable outside try block!
let db;

//try-catch method to handle errors!
try {

    //creating the db file!
    db = new DataBase('safety_quiz_db.db');

    if (dbExists) {
        console.log('✅ Database already exists and connected!');
    } else {
        console.log('🆕 Database has been created successfully!');
    }

} catch (err) {
    console.error('Database could not be created!', err.message);
}

//exporting database connection! 
module.exports = db;

