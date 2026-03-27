//this file contains the authorization's route code!

const express = require('express'); //importing express!

const router = express.Router();//creating the router!

const db = require('../database/tables/safety_quiz_db.js');//creating the DB object!

const bcrypt = require('bcrypt');//creating the bcrypt object!

const jwt = require('jsonwebtoken');//creating the toke object!
const { JWT_SECRET } = require('./middleware');

const TOKEN_EXPIRATION = '3h';//defining token's lifespan!


//POST /autu_route/login
router.post('/login',async (req,res)=>{
    //retrieving the body parameters!
    const {email, password} = req.body;

    //returning an error message if inputs are null!
    if(!email || !password)
    {
        return res.status(400).json({error:`Please complete all inputs`});
    }

    try{

   
    //creating the query!
    const user = db.prepare(`SELECT * FROM user where email = ?`).get(email);

    //validating whether user is active or exists!
    if(! user ||user.is_active !== 1)
    {
        return res.status(401).json({error:`Invalid credentials`});
    }

    //if user exists validating if password matches!
    const validatePass = await bcrypt.compare(password, user.password_hash);
    //returning an error message if password is wrong!
    if(!validatePass)
    {
        return res.status(401).json({error: `Invalid credentials`});
    }

    //creating the jtw token!
    const token = jwt.sign({
        userId: user.id,
        role: user.role_id,
        companyId: user.company_id
    }, JWT_SECRET, {expiresIn: TOKEN_EXPIRATION });

    //returning a success message if all goes well!
    return res.status(200).json({message:'Logged in',token,expiresIn: TOKEN_EXPIRATION});

    }catch(err) //handling other errors!
    {
        //returning an error message in case of server errors!
        return res.status(500).json({error: err.message});
    }

});



//exporting the auth object!
module.exports = router
