const express = require('express');
//validation
const { check } = require('express-validator');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

//exporting this route to the app.js
 // '/' path that will filter
 //standard middleware function  (req, res, next) => {LOGIC HERE}
 //FILE ABOUT ROUTING,MAPPING PATHS and http methods --------- RESTRUCTURING FILES IS IMPORTANT
 //when reaching this route, it will run this specific function that is placed at places-controllers.js
router.get('/:pid', placesControllers.getPlaceById);


router.get('/user/:uid', placesControllers.getPlacesByUserId);

//note that the request is done from the top to the bottom, this ensures that everyone can see the places and the users .get routes without being logged in
 //a request without a token will not pass this point forward
 //pass this pointer to be registered as a middleware by express
router.use(checkAuth);

 
 //IN THE BROWSER it's a GET request
 //using postman for handling the POST request so we can test it
 //validating the POST request using the library express-validator to see if:
 // the input in the title is not empty 
 // the description has at least 5 characters, 
 // the address is not empty too
 //this "check" part will happen before the placesControllers
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address')
      .not()
      .isEmpty()
  ],
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title')
      .not()
      .isEmpty(),
    check('description').isLength({ min: 5 })
  ],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
