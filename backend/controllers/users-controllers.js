//3) setup the functions that will be triggered for each endpoint and export them
//4) reference these functions in the users-routes.js
//5) adding some dummy logic

//generator, useful for dummy 
//const { v4: uuidv4 } = require('uuid');

const { validationResult } = require('express-validator');
//npm i bcryptjs -> hashing passwords
const bcrypt = require('bcryptjs');
//npm i jsonwebtoken -> generating web tokens on the backend
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');
//dummy info
//const DUMMY_USERS = [
//    {
//        id: 'u1',
//        name: 'Lucas Guiselini',
//        email: 'test@test.com',
//        password: 'testers'
//    }
//];

//6) setup the middleware functions
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    const error = new HttpError(
      'Fetching users failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({ users: users.map(user => user.toObject({ getters: true })) });
  //return only email and name    
    //just a response that sends back a json file with the dummy
   // res.json({users: DUMMY_USERS})
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
 //extracting data from the incoming request body to create a new user
  const { name, email, password } = req.body;
//first we need to find the email part in the database and after that check if it exist
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
//if the user exists, then it's already in the database, so login instead
  if (existingUser) {
    const error = new HttpError(
      'User exists already, please login instead.',
      422
    );
    return next(error);
  }

   //logic with dummy
    //now to not create an user that already exists
    //see if the email that got send (POST request) is not same that already is in the DUMMY_USERS
    //const hasUser = DUMMY_USERS.find(u => u.email === email);
    //if it finds the same email (so it exists), it will return an error
    //if (hasUser) {
        //422 the server understands the content type of the request entity, 
        //and the syntax of the request entity is correct, but it was unable to process the contained instructions
     //   throw new HttpError('Could not create an user, email already exists.', 422);
   // }

   //hashing
  let hashedPassword;
  try {
    //salt = 12, decent enough strength in our case
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      'Could not create user, please try again.',
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    //adding the user image
    // WITHOUT S3
    image: req.file.path,
    // S3
    //image: req.file.location,
    //encryption is done, we store only the hashed password
    password: hashedPassword,
     //add [] to conform with the user.js file
    places: []
  });
   //dummy logic
    //{
    //    id: uuidv4(),
    //    name, // name: name,
    //    email,
    //    password
    //};

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }

  let token;
  try {
    //encoding the id and email into the token
            //important to make the token expire as an extra security mechanism 
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Signing up failed, please try again later.',
      500
    );
    return next(error);
  }
 //adding the user to the DUMMY_USERS
   // DUMMY_USERS.push(createdUser);

    //response with 201 since we added a new user and get back the user itself
    //return to the frontend these 3 pieces of data
  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
  //extract data from the body
  const { email, password } = req.body;

   //final authentication logic will be added later
    //finding a user where the email property holds the same value equal of the the request body
    //dummy logic
    //const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    //simple validation logic 
    //if it's not the same email, return an error
    //checking too the password from the body
   // if (!identifiedUser || identifiedUser.password !== password) {
        //The 401 Unauthorized Error is an HTTP status code error that represented the request sent by the client to the server that lacks valid authentication credentials
   //     throw new HttpError('Could not identify user, credentials seems to be wrong.', 401);
    //}

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }
//if the existing user is not in the database 
  if (!existingUser) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  //password here we got from the incoming request(body)
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      'Could not log you in, please check your credentials and try again.',
      500
    );
    return next(error);
  }
//if the password is not correct, return this error
  if (!isValidPassword) {
    const error = new HttpError(
      'Invalid credentials, could not log you in.',
      403
    );
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      //existingUser here, since it's an user that was already created
      { userId: existingUser.id, email: existingUser.email },
       //use the same private key both in the sign up and login 
       process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    const error = new HttpError(
      'Logging in failed, please try again later.',
      500
    );
    return next(error);
  }//now react can use this token

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
