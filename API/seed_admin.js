const bcrypt = require("bcrypt");//bcrypt to encypt the pass!
const db = require("./safety_quiz_db.js");//creating a db's object!

async function seedAdmin() {
    // validating if admin already exists!
    const existing = db.prepare(`SELECT * FROM user WHERE email = ?`).get("admin@system.com");
    if (existing) {
        console.log("Admin already exists, skipping...");
        return;
    }

    const password_hash = await bcrypt.hash("this_quiz_is_hard!", 10);//encrypting the password!

    //execiting the query!
  db.prepare(`
        INSERT INTO user (company_id, email, password_hash, role_id)
        VALUES (?, ?, ?, ?)
    `).run(1, "admin@system.com", password_hash, 1);

   

    console.log("Admin created successfully!");
}

seedAdmin();