const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  //unique: true = creates an index to speed up the process of finding this 
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  //establishing the relation with the creator and places => users and places
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Place' }]
});
//after require
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
