const UserModel = require('../models/user.model');

const index = async (req, res) => {
    try {
        var users = await UserModel.find().exec();
        if (users.length == 0) {
            res.status(204).send("user have not existed");
        }

        res.json(users);
    }
    catch (err) {
        throw err;
    }
}

const view = async (req, res) => {
    try {
        if (req.session && req.session.user) {
            let userId = req.session.user.id;
            if (userId) {
                var user = await UserModel.findById(userId).exec();
                if (!user) {
                    res.status(204).send("user have not existed");
                }
                res.json(user);
            }
        }
        else {
            res.redirect('/account/login');
        }
    }
    catch (err) {
        throw err.message
    }
}
module.exports = { index }