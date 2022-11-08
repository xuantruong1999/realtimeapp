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
      validator: function (v) {
        return /^0\d{9}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
    //required: [true, 'User phone number required']
  }
});

var ProfileModel = mongoose.model('Profile', ProfileSchema);

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
var AddressModel = mongoose.model('Address', AddressSchema);

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: (value) => /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
      message: props => `${props.value} is not valid email`
    },
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    min: [6, 'Must be at least 6']
  },
  password: {
    type: String,
    required: true,
    min: [6, 'Must be at least 6']
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

var UserModel = mongoose.model('User', UserSchema);
module.exports = { UserModel, ProfileModel, AddressModel };
