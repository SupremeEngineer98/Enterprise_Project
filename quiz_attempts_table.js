const db = require('./safety_quiz_db.js');//creating db's object!

//creating quiz_assignment table!
const create_quiz_attempts_table = db.prepare(
`
 Create table if not exists quiz_attempts
 (
         id          INTEGER     PRIMARY KEY AUTOINCREMENT,
        quiz_id     INTEGER     NOT NULL,
        user_id     INTEGER     NOT NULL,
        assigned_at TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        due_date    TEXT        NOT NULL,
        completed   INTEGER     NOT NULL DEFAULT 0,

        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_quiz_attempts_table.run();//executing the query!
    console.log('Quiz_attempts table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}