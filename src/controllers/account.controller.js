const User = require('../models/user.model');

const login = (req, res) => {
    res.render('account/login.pug', { title: "Login Page" });
}

const signup = (req, res) => {
    res.render('account/signup.pug', { title: "Sign Up!" })
}

const create = async (req, res, next) => {
    try {
        var userParam = req.body;
       
        let user = await User.create({
            username: userParam.username,
            email: userParam.email,
            password: userParam.password,
            confirmpassword: userParam.confirmpassword
        });

        res.json({user});

    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    signup,
    create
}