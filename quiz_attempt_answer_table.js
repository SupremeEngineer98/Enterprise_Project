const db = require('./safety_quiz_db.js');//creating db's object!

//creating quiz_attempt_answer table!
const create_quiz_attempt_answer_table = db.prepare(
`
 Create table if not exists quiz_attempt_answer
 (
        id                 INTEGER     PRIMARY KEY AUTOINCREMENT,
        attempt_id          INTEGER     NOT NULL,
        question_id         INTEGER     NOT NULL,
        selected_answer_id  INTEGER     NOT NULL,
        is_correct          INTEGER     NOT NULL,
        answered_at         TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (attempt_id)         REFERENCES quiz_attempts(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id)        REFERENCES questions(id)     ON DELETE CASCADE,

        UNIQUE(attempt_id, question_id)
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_quiz_attempts_answer_table.run();//executing the query!
    console.log('Quiz_attempt_answer table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}