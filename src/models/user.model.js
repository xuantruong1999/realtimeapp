var mongoose = require('mongoose');
var ProfileSchema = new mongoose.Schema({
  avatar: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  bio: {
    type: String,
    maxlength: 200
  }
});

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
  },
  salt: {
    type: String,
    required: true,
  },
  profile: ProfileSchema,
});

var User = mongoose.model('User', UserSchema);
module.exports = User;
