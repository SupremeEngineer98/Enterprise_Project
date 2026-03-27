const fs = require('fs');
const DataBase = require('better-sqlite3');
const path = require('path');

// This ensures it always points to the root safety_quiz_db.db
const dbPath = path.join(__dirname, '../safety_quiz_db.db');
console.log('Connecting to DB at:', dbPath);

const dbExists = fs.existsSync(dbPath);

let db;

try {
    db = new DataBase(dbPath); // <-- use dbPath, not the plain filename

    if (dbExists) {
        console.log('Database already exists and connected!');
    } else {
        console.log('Database has been created successfully!');
    }
} catch (err) {
    console.error('Database could not be created!', err.message);
}

module.exports = db;