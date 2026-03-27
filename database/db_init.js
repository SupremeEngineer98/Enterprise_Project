//this file when its being executed it auto-create the tables!
//  This file will be used in server.js file in order to use this tb each time server runs!

require('./tables/company_table');
require('./tables/role_table');
require('./tables/user_table');       
require('./tables/table_quiz');
require('./tables/table_question');  
require('./tables/table_quiz_assignment');
require('./tables/quiz_attempts_table');
require('./tables/quiz_attempt_answer_table');