var mongoose = require('mongoose');

var ProfileSchema = new mongoose.Schema({
  avatar: { type: String, default: 'profile-picture-default-png.png' },
  firstName: { type: String },
  lastName: { type: String },
  bio: {
    type: String,
    maxlength: 200
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{3}-\d{3}-\d{4}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    //required: [true, 'User phone number required']
  }

});

var AddressSchema = new mongoose.Schema({
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  zipCode: {
    type: Number,
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
  address: AddressSchema,
},
  { timestamps: true },
);

var User = mongoose.model('User', UserSchema);
module.exports = User;
