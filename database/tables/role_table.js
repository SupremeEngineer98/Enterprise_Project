const db = require('./safety_quiz_db.js');//creating db's object!

//creating company's table!
const create_role_table = db.prepare(
`
 Create table if not exists role
 (
        id      INTEGER     PRIMARY KEY AUTOINCREMENT,
        name    TEXT        NOT NULL UNIQUE
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_role_table.run();//executing the query!
    console.log('Role table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}