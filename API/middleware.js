//this file contains middleware's code in order to make auth accessible from all routes and endpoints!

//creating the jwtwebtoken!
const jwt = require('jsonwebtoken');//creating the token object!

//db object!
const db = require('../database/tables/safety_quiz_db.js');

const JWT_SECRET = process.env.JWT_SECRET || 'SECRET_KEY';//secret key object!

//jwt verification + active verification!

//function to verify token from other routes!
function verifyToken(req,res,next)
{
     const authHeader = req.headers.authorization;//creating the header's authorization!

     //returning an error message if user is not authorized!
     if(!authHeader)
     {
          return res.status(401).json({error:"Access denied"});
     }

      const token = authHeader.split(' ')[1];//creating the token object!

      //authorization process!
try{

            const decoded = jwt.verify(token, JWT_SECRET);//decoding the token!

            //checking if user exists and is active!
        const user = db.prepare(`SELECT * FROM user WHERE id = ?`).get(decoded.userId);
         
        //return error message if user does not exists or he is inactive!
        if(!user || user.is_active !== 1)
        {
          return res.status(401).json({Error:`User is inactive or not found!`});
        }

        //validating whether company exists or not!
        const company = db.prepare(`SELECT * FROM company WHERE id = ?`).get(decoded.companyId);

        //return error message if company does not exist or is inactive!
        if(!company || company.status !== 'ACTIVE')
        {
          return res.status(401).json({Error: `The company is suspended or not found`});

        }

        //decoding user's info!
        req.user = decoded;
            next(); //callback function to assign the authorization to the next middleware!

 }catch(err){ //returning an error message if token is invalid!

  return res.status(403).json({error:"Authorization failed"});

 }

};

// tenantScope
function tenantScope(req, res, next) {
    const requestedCompanyId = parseInt(req.params.companyId, 10);
    if (requestedCompanyId && requestedCompanyId !== req.user.companyId) {
        return res.status(403).json({ error: 'Cross-tenant access is not allowed.' });
    }
    req.companyId = req.user.companyId;
    next();
}

// authorizeRoles
function authorizeRoles(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
        }
        next();
    };
}

module.exports = { verifyToken, tenantScope, authorizeRoles };
