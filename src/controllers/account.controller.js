const User = require('../models/user.model');

const login = (req, res) => {
    res.render('account/login.pug', { title: "Login Page" });
}

const signup = (req, res) => {
    res.render('account/signup.pug', { title: "Sign Up!" })
}

const create = (req, res) => {
    try {
        const newUser = new User(req.body)
        newUser.Save(err => {
            throw err;
        })
    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    signup,
    create
}