const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
   //When we try to add a new place the  browser sends an OPTIONS request without a token FIRST, even though we are sending a POST request, so we have to handle it here
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    //tokens in the header of the incoming request
    //req.headers = express js
    //authorization is one of the setHeaders in app.js
    //[1] acessing the second element after the ESPACE split
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    //we get this userId from the users-controller.js when we created the token
    req.userData = { userId: decodedToken.userId };
     //this we we are validating the token, let it continue their specific routes when requested and adding data to the request
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed!', 403);
    return next(error);
  }
};
