const db = require('./safety_quiz_db.js');//creating db's object!

//creating company's table!
const create_user_table = db.prepare(
`
 Create table if not exists user
 (
        id              INTEGER     PRIMARY KEY AUTOINCREMENT,
        company_id      INTEGER     NOT NULL,
        email           TEXT        NOT NULL,
        password_hash   TEXT        NOT NULL,
        role_id         INTEGER     NOT NULL,
        is_active       INTEGER     NOT NULL DEFAULT 1,
        created_at      TEXT        NOT NULL DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (company_id)    REFERENCES company(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id)       REFERENCES role(id) ON DELETE CASCADE,

        UNIQUE(company_id, email)
 
 )
 
`
);

//try-catch block to handle errors!
try{
    
    create_user_table.run();//executing the query!
    console.log('User table has been created with success');

}catch(err)
{
    console.error('Error, cannot create the table!',err.message);
}