//const fs = require('fs');
//path module for node.js
//const path = require('path');

const express = require('express');
//const bodyParser = require('body-parser');
//connecting the backed to the mongodb
const mongoose = require('mongoose');

//important to plan your API Endpoints before starting the backend, like GET .../ ; POST .../login, GET .../:pid ; etc

//importing the route

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
//new
//const fileDelete = require('./util/file-delete');

//const cors = require('cors');

const app = express();

app.use(express.json());


//app.use(bodyParser.json());

//adding middlewares for serving images statically
//NOT FOR AWS S3
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
//TRYING TO OUT THIS
//handling CORS errors
app.use((req, res, next) => {
  //setting headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

  next();
});

//cors OLD FILE

//app.use(cors({
//  origin: "*",
//  credentials: true,
//  methods: 'GET, POST, PATCH, DELETE',  
//  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//}));

//cors

//middleware
//move the logic of places-routes from app.js to a separate file, maintaining it clean
app.use('/api/places', placesRoutes); // => /api/places/...
//NOW for the user routes
app.use('/api/users', usersRoutes);

//proper error handling for unsupported routes (GET requests)
app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

//default error handler, express will understand that this is a special middleware function (because of the 4 arguments and the error part)
app.use((error, req, res, next) => {
  //not adding images to the backend if there is an error in any part at once
  if (req.file) {
    //old s3
    //fileDelete(req.file.location);
        
    fs.unlink(req.file.path, err => {
      console.log(err);
    });
  }
  //if a respond has already been sent, simply ignore it
  if (res.headerSent) {
    return next(error);
  }
   //error 500: the server encountered an unexpected condition that prevented it from fulfilling the request
    //chaining syntaxes here: it could be done as res.json(); that way it would not be chained
    //simply forwarder the error code, otherwise show the specific message
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

//first we establish the connection to the database, if it's ok we start out backend server
mongoose
//make sure to go to the mongodb atles website and update the network access using your IP and add an admin user (in this case is lucascg with the password being 135lucas)
//the name of the collection is placed after mongodb.net/ => in our case it's "places"
//using dynamic values: this "process" with the "env" key comes from nodejs // USE IF NECESSARY INSIDE {dbName: '   '},
  .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cezeb.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, { useNewUrlParser: true })
  .then(() => {
     //if the connection is sucessfull, simple connect to the backend server
    app.listen(process.env.PORT || 5000);
  })
  .catch(err => {
    console.log(err);
  });

module.exports = app;