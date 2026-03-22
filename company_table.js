const db = require('./safety_quiz_db.js');//creating db's object!

//creating company's table!
const create_company_table = db.prepare(
`
 Create table if not exists company
 (
   id INTEGER PRIMARY KEY AUTOINCREMENT,
   name        TEXT        NOT NULL UNIQUE,
   status      TEXT        NOT NULL CHECK(status IN ('ACTIVE', 'SUSPENDED')),
   created_at  TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,
   updated_at  TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_company_table.run();//executing the query!
    console.log('Company table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the database!',err.message);
}