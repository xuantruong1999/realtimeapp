const User = require('../models/user.model');
const helper = require('../helpers/helper');

const login = (req, res) => {
    res.render('account/login.pug', { title: "Login Page" });
}

const signout = async (req, res) => {
    req.session = null;
}

const authen = async (req, res) => {
    let userInfor = req.body;
    var user = await User.findOne({ username: userInfor.username }).exec();

    if (!user) {
        res.render('account/login.pug', { message: "username or password is incorrect" });
    } else {
        let isMatch = helper.hasher(userInfor.password, user.salt) === user.password;
        if (isMatch) {
            req.session.user = {isAuth: true, username: user.username};
            res.render('home/index.pug', {
                okla: req.session.user
            });
        }
        else {
            res.render('account/login.pug', { message: "password is incorrect" });
        }
    }
}

const signup = (req, res) => {
    res.render('account/signup.pug', { title: "Sign Up!" })
}

const create = async (req, res, next) => {
    try {
        var { username, email, password, confirmpassword } = req.body;
        var isExstied = await User.findOne({ email, username });

        if (confirmpassword !== password) {
            return res.render('account/signup.pug', { errMessage: "Password confirm is not match" })
        }

        if (isExstied) {
            return res.render('account/signup', { inforMessage: "User have been exist" });
        }

        //hash password
        let salt = helper.generateSalt(12);
        let passwordHash = helper.hasher(password, salt);
        let user = await User.create({
            username: username,
            email: email,
            password: passwordHash,
            salt: salt
        });

        res.render('account/login');

    } catch (err) {
        next(err);
    }
}

module.exports = {
    login,
    signup,
    create,
    authen,
    signout
}