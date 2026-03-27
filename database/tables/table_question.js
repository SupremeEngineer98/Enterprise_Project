const db = require('./safety_quiz_db.js');//creating db's object!

//creating questions table!
const create_questions_table = db.prepare(
`
 Create table if not exists questions
 (
        id              INTEGER     PRIMARY KEY AUTOINCREMENT,
        quiz_id         INTEGER     NOT NULL,
        question_text   TEXT        NOT NULL,
        option_a        TEXT        NOT NULL,
        option_b        TEXT        NOT NULL,
        option_c        TEXT        NOT NULL,
        correct_option  TEXT        NOT NULL,

        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_questions_table.run();//executing the query!
    console.log('Questions table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}