const db = require('./safety_quiz_db.js');//creating db's object!

//creating quiz table!
const create_quiz_table = db.prepare(
`
 Update table quiz set
 (
        id          INTEGER     PRIMARY KEY AUTOINCREMENT,
        title       TEXT        NOT NULL,
        description TEXT,
        is_active   INTEGER     NOT NULL DEFAULT 1,
        created_by  INTEGER     NOT NULL,
        created_at  TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (created_by) REFERENCES users(id)
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_quiz_table.run();//executing the query!
    console.log('Quiz table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}