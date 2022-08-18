// FILE UPLOAD
const multer = require('multer');
const uuid = require('uuid/v1');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
};

const fileUpload = multer({
   //storing the image that was extracted in the POST request
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      //getting the right extention of the file
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + '.' + ext);
    }
  }),
  fileFilter: (req, file, cb) => {
    //!! convert null to false and convert one of the myme types (png, etc) to true
        //isValid is now TRUE or FALSE
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error('Invalid mime type!');
    //now it's not possible to add an invalid file
    cb(error, isValid);
  }
});

module.exports = fileUpload;

////AWS S3 FILE UPLOAD TO HANDLE IMAGES - npm i --save aws-sdk multer multer-s3
//const aws = require('aws-sdk');
//const multer = require('multer');
//const multerS3 = require('multer-s3');
// 
//aws.config.update({
//    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//    secretKeyId: process.env.AWS_ACCESS_KEY_ID,
//    region: process.env.AWS_REGION,
//});
// 
//const s3 = new aws.S3();
// 
//const MIME_TYPE_MAP = {
//    'image/png': 'png',
//    'image/jpeg': 'jpeg',
//    'image/jpg': 'jpg',
//};
// 
//// https://github.com/expressjs/multer#error-handling
// 
//// When encountering an error, Multer will delegate the error to Express. You can display a nice error page with the express default error handler
//// If you want to catch errors specifically from Multer, you can call the middleware function by yourself, like we do here with fileFilter and calling the CB which in our case will be handled by the default express error handler
// 
// 
//const fileUpload = multer({
//    limits: 500000,
//    storage: multerS3({
//        s3: s3,
//        bucket: process.env.AWS_BUCKET_NAME,
//        acl: 'public-read',
//        metadata: function (req, file, cb) {
//            cb(null, { fieldName: file.fieldname });
//        },
//        key: function (req, file, cb) {
//            cb(null, Date.now().toString());
//        },
//    }),
//    fileFilter: (req, file, cb) => {
//        const isValid = !!MIME_TYPE_MAP[file.mimetype];
//        let error = isValid ? null : new Error('Invalid mime type !');
//        cb(error, isValid);
//    },
//});
// 
//module.exports = fileUpload;
//