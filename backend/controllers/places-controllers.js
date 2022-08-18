 //FILE FOR THE LOGIC (MIDDLEWARE FUNCTIONS)
const fs = require('fs');

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
 //const { v4: uuidv4 } = require('uuid');
const getCoordsForAddress = require('../util/location');
 //using the place.js
const Place = require('../models/place');
const User = require('../models/user');
 //const { default: mongoose } = require('mongoose');

 //to delete files in AWS S3 
// const fileDelete = require('../util/file-delete');
 //using let here so we can delete the array using a DELETE request 
 //let DUMMY_PLACES = [
 //    {
 //        id: 'p1',
 //        title: 'Catedral',
 //        description: 'big cone in Maringá',
 //        location: {
 //            lat: -23.4261063,
 //            lng: -51.938256
 //        },
 //        address: 'Praça da Catedral, s/n - Zona 02, Maringá - PR, 87010-530',
 //        creator: 'u1'
 //    }
 //];
 
 // function expression with an error function

const getPlaceById = async (req, res, next) => {
   //this way if we type the URL http://localhost:5000/api/places/p1 ; it will show the entire json file with all contents of the DUMMY_PLACES example above
  const placeId = req.params.pid;  // { pid: 'p1' }

  let place;
  try {
      //findById = mongoose method, asynchronous task (add the async at the start of getPlaceById) / could use .exec() after findById to get a promise
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not find a place.',
      500
    );
    return next(error);
  }
 //dummy logic
     //DUMMY_PLACES.find(p => {
     //    return p.id === placeId;
     //});
     //console.log('GET request in Places');    
  if (!place) {
    //this return part makes so it stops here if the url is not correct
        // return res.status(404).json({
        //    message: 'could not find a place for the provided id'  
    const error = new HttpError(
      'Could not find place for the provided id.',
      404
    );
    return next(error);
  }
//  );
       //send back a response in JSON data, REST API we exchange data in JSON data
       //turn the place into a normal javascript object  = :place ... 
       //getters: true = mongoose adds an ID getter to every document which returns the ID as a string, with true we retain this ID in the object
  res.json({ place: place.toObject({ getters: true }) }); // => { place } => { place: place }  
};

 //function getPlaceById() {... LOGIC HERE}
 //const getPlaceById = function() {... LOGIC HRE}
 

const getPlacesByUserId = async (req, res, next) => {
  // URL http://localhost:5000/api/places/user/u1
  const userId = req.params.uid;
  //Block Level Scope: This scope restricts the variable that is declared inside a specific block, from access by the outside of the block
     //this is why we use let places here and inside the 'try' we put places = Places...  
     //using populate  

  // let places;
  let userWithPlaces;
  try {
    //mongoose => .find let us use async await without .exec after the .find()    
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    const error = new HttpError(
      'Fetching places failed, please try again later.',
      500
    );
    return next(error);
  }

   //dummy logic
    // = DUMMY_PLACES.filter(p => {
    //     //note the p.creator is the same as in the DUMMY_PLACES, the logic is pretty close as the one before
    //     return p.creator === userId;
    // });

  // if (!places || places.length === 0) {
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(
      new HttpError('Could not find places for the provided user id.', 404)
    );
    // return res.status(404).json({
        //    message: 'could not find a place for the provided user id'
        // 
  }
   //);   
     //adding a method, use .map to not have an error (we cannot use toObject within an array)

  res.json({
    places: userWithPlaces.places.map(place =>
      place.toObject({ getters: true })
    )
  });
};

//FOR THE POST 
 //CALL THE COORDINATES when we create this place (use async)

const createPlace = async (req, res, next) => {
   //express-validator - see if there are any validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }
  //object destructuring => get different properties out of the request body and store it in constants
     //it's up to us of what we expect as data

     //we are extracting the creator from the token now
  const { title, description, address } = req.body;

  let coordinates;
  try {
    coordinates = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }
 //shortcut: const title = req.body.title; for every property
     //this one below will be updated with mongodb logic later
 
     //logic for mongoose
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    //OK
    image: req.file.path,
    //S3
    //image: req.file.location,
    //see the check-auth.js middleware for more info, this creator is from the token
    creator: req.userData.userId
  });

  let user;
  try {
     //accessing the creator property of our users and check if the ID is already stored
    user = await User.findById(req.userData.userId);
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError('Could not find user for provided id.', 404);
    return next(error);
  }

  console.log(user);

   //LOGIC FOR THE DUMMY
       // {        
       //  id: uuidv4(),
       //  title, // shortcut for => title: title since it's the same
       //  description,
       //  location: coordinates,
       //  address,
       //  creator
       // };

  try {
    //.save is a method for mongoose, will handle the mongodb code to store a new document
       //await is necessary since it could take some time to add this place (the async is in the createPlace above)
       //refactoring this code
       //await createdPlace.save();
       //IF CREATING THE PLACE OR STORING THE ID OF THE PLACE IN THE USER DOCUMENT 'FAILS', do not proceed, BOTH have to be successfull to proceed
       //=> Transactions let you execute multiple operations in isolation and potentially undo all the operations if one of them fails
    const sess = await mongoose.startSession();
    sess.startTransaction();
     //storing the place
    await createdPlace.save({ session: sess });
    //this push is a method for mongoose => establishes a connection between the two models
    user.places.push(createdPlace);
    //saving the updated user in our current session
    await user.save({ session: sess });
    //only now the changes are saved to the database
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Creating place failed, please try again.',
      500
    );
    //stop in case of an error
    return next(error);
  }
  
  //LOGIC FOR THE DUMMY
    // DUMMY_PLACES.push(createdPlace); // or use unshift(createdPlace)
     // error 201 The request has been fulfilled and resulted in a new resource being created
     // returning an object where i have a place property that holds this createPlace
  res.status(201).json({ place: createdPlace });
};

 //FOR THE PATCH
const updatePlace = async (req, res, next) => {
  //EXPRESS-VALIDATOR
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs passed, please check your data.', 422)
    );
  }

  //for a patch request you also have a req.body, since you want to update specific fields
     // in this case, we are only allowing the user to update 2 fields: title and description 
  const { title, description } = req.body;
  // .pid, it needs to be exactly like the router setup 
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

  //each user will only update/delete a place which he owns
     //this ensures that IF this user did not created that place
     //.toString is a method from mongoose to get the right data in this case
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError('You are not allowed to edit this place.', 401);
    return next(error);
  }

   //now if the user passed this criteria, it means he's the user that originally created the place, so he can update it
 
     //searching for the place in the array, the => part is a function in it's shortest form
     //{... } = creates a new object and copy all key values pair of the old object in this new object
     //dummy logic
     //const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId)};
     //note that this update part seems convoluted at first, but this is because of Reference vs Primitive Values in javascript
     //we need to target the values in the array to update, that's why the const updatedPlace is like that
     //dummy logic
     //const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
     //updatedPlace.title = title;
     //updatedPlace.description = description;
     //since we use place now we change this part
  place.title = title;
  place.description = description;
    // place.rating = rating;
 
     //storing the updated place in the database
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not update place.',
      500
    );
    return next(error);
  }

       //dummy logic
     //DUMMY_PLACES[placeIndex] = updatedPlace;
  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
   //extracting the ID
  const placeId = req.params.pid;
  //checking if there is a place before deleting it

  let place;
  try {
    //populate => refers to a document in another collection and work with that data - this method only works because plaçe and user are related
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }
   //dummy logic
     //if (!DUMMY_PLACES.find(p => p.id == placeId)) 
     //
     //{
        // throw new HttpError('Could not find a place for that ID', 404);
     //}
     //return true (keep the place), if ID's do not match. if ID's MATCH it's the ID that you want to remove, but since it's false (!==) it drops the place from this array
     //and then this new array override the old awway
    // DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId);
 
    //check if a place actually exists
  if (!place) {
    const error = new HttpError('Could not find place for this id.', 404);
    return next(error);
  }
//authorization
    //we can use place.creator.id here since we used populate('creator') before to get the id as a string
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      'You are not allowed to delete this place.',
      401
    );
    return next(error);
  }
  //OLD WITHOUT S3
 //deleting files after the user deleted the place
 // const imagePath = place.image;

//deleting the place in the database
  try {
    //almost same logic as creating, using transactions and session
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    //accessing the places stored in the creator
        //pull automatic remove the ID, since it is another mongoose method
    place.creator.places.pull(place);
    //save the new created user
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      'Something went wrong, could not delete place.',
      500
    );
    return next(error);
  }

  //OLD
  fs.unlink(imagePath, err => {
    console.log(err);
  });
  //S3
  //const imagePath = place.image;
  //  fileDelete(imagePath);

  

  res.status(200).json({ message: 'Deleted place.' });
};

 //module.exports for single use
 //exporting a pointer to that function
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
