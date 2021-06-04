const jwt = require("jsonwebtoken");
const User = require("../modals/User");

exports.isAuthenticated = async (req, res, next) => {
  const authHeader =  req.headers.authorization;
 
  
  // @set token form Bearer token in header
  let token;

  try {
    token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // set userid to request header
    req.userData = await User.findById(decoded._id);
    next();

  } catch (error) {
     return next(
         new Error("Not authorized to access this route")
      );
   }
};
