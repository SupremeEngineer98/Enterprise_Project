//this file contains middleware's code in order to make auth accessible from all routes and endpoints!

//creating the jwtwebtoken!
const jwt = require('jsonwebtoken');//creating the token object!

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

            const decoded = jwt.verify(token,"SECRET_KEY");//decoding the token!

            req.user = decoded;//decoding user's toekn!

            next(); //callback function to assign the authorization to the next middleware!

 }catch(err){ //returning an error message if token is invalid!

  return res.status(403).json({error:"Authorization failed"});

 }

};
