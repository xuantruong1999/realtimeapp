const { check, body } = require('express-validator');

const validateSignup = () => {
  return [
    body('username').exists().isLength({min: 6}),
    body('email').exists().isEmail(),
    body('password').exists().isLength({min: 6}),
    body('confirmpassword').custom((value, {req}) => {
      if(value !== req.body.password){
          return Promise.reject('password confirm is not map with password');
      }
      return true;
    })
  ];
}

const validateLogin = () => {
  return [
    body('username').exists().isLength({min: 6}),
    body('password').exists().isLength({min: 6}),
  ];
}

const validateUserUpdate = () => {
  return [
    body('phone', 'Invalid mobile number.').matches(/(84|0[3|5|7|8|9])+([0-9]{8})\b/),
    body('email', 'Invalid email.').exists().isEmail(),
  ]
}

module.exports = {
    validateUserUpdate,
    validateLogin,
    validateSignup
}