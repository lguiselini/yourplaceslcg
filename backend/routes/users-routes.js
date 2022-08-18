//1) first we setup the routers and see which endpoints we need, in the users we need a get(for home /) and 2 post endpoints (one for the signup and other for the login
//2) we also need to export these routers at the end
//3) continue in users-controllers
const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controllers');
//uploading images with multer
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

//4)pointing the functions 
router.get('/', usersController.getUsers);

//when the user send us their sign up data
router.post(
  '/signup',
  //using multer (group of middlewares) 
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty(),
    check('email')
     //normalizeEmail makes all characters be lower case
      .normalizeEmail()
      .isEmail(),
    check('password').isLength({ min: 6 })
  ],
  usersController.signup
);
//if he already has an existing user, he will try to log in
router.post('/login', usersController.login);

module.exports = router;
//5) remember to put this logic in the app.js file 
