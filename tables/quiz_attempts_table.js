const db = require('./safety_quiz_db.js');//creating db's object!

//creating quiz_assignment table!
const create_quiz_attempts_table = db.prepare(
`
 Create table if not exists quiz_attempts
 (
        id              INTEGER     PRIMARY KEY AUTOINCREMENT,
        assignment_id   INTEGER     NOT NULL,
        status          TEXT        NOT NULL CHECK(status IN ('IN_PROGRESS', 'COMPLETED', 'ABANDONED')),
        current_score   INTEGER     NOT NULL DEFAULT 0,
        answered_count  INTEGER     NOT NULL DEFAULT 0,
        started_at      TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_activity_at TEXT       NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at    TEXT,

        FOREIGN KEY (assignment_id) REFERENCES quiz_assignments(id) ON DELETE CASCADE
 
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

