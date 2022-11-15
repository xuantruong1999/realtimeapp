const { UserModel } = require('../models/user.model');
const helper = require('../helpers/helper');
const { validationResult } = require('express-validator');

const login = (req, res) => {
    res.render('account/login.pug', { title: "Login Page", res });
}

const logout = async (req, res) => {
    req.session = null;
    res.clearCookie('remembermeToken');
    res.clearCookie('userId');
    res.clearCookie('name');
    res.redirect('/');
}

const authen = async (req, res) => {
    let userInfor = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    var user = await UserModel.findOne({ username: userInfor.username }).exec();

    if (!user) {
        res.render('account/login.pug', { message: "username or password is incorrect" });
    } else {
        let isMatch = helper.hasher(userInfor.password, user.salt) === user.password;
        if (isMatch) {
            req.session.user = { isAuth: true, id: user.id };
            
            res.cookie('name', user.username, { expires: new Date(Date.now() + 24 * 7 * 3600000) });
            if (userInfor.rememberme) {
                let token = helper.generateRandomToken();
                let userUpdated = await UserModel.findOneAndUpdate({ _id: user._id }, { remembermeToken: token }, {
                    new: true
                });
                //expired a week
                let options = { expires: new Date(Date.now() + 24 * 7 * 3600000), httpOnly: true };
                res.cookie('remembermeToken', userUpdated.remembermeToken, options);
                res.cookie('userId', userUpdated.id, options);
                return res.render('home/index.pug', {username: userUpdated.username });
            }

            res.render('home/index.pug', {username: user.username});
        }
        else {
            res.render('account/login.pug', { message: "password is incorrect" });
        }
    }
}

const signup = (req, res) => {
    res.render('account/signup.pug', { title: "Sign Up!", res })
}

const create = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var { username, email, password } = req.body;
        if (await UserModel.findOne({ email })) {
            return res.render('account/signup.pug', { errMessage: "Email have been exsted" })
        }

        if (await UserModel.findOne({ username })) {
            return res.render('account/signup.pug', { errMessage: "Username have been exsted" })
        }

        //hash password
        let salt = helper.generateSalt(12);
        let passwordHash = helper.hasher(password, salt);
        await UserModel.create({
            username: username,
            email: email,
            password: passwordHash,
            salt: salt,
            profile: {},
            address: {}
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
    logout
}