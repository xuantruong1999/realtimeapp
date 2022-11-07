const UserModel = require('../models/user.model');

const index = async (req, res) => {
    try {
        if (req.session && req.session.user) {
            let userId = req.session.user.id;
            if (userId) {
                var user = await UserModel.findById(userId).exec();
                if (!user) {
                    res.status(204).send("user have not existed");
                }
                res.render("users/index.pug", { title: "Profile", user, session: req.session.user })
            }
        }
        else {
            res.redirect('account/login');
        }
    }
    catch (err) {
        next(err)
    }
}

const update = async (req, res, next) => {
    try {
        let id = req.session.user.id;
        let updateObj = req.body;
        let profileObj = {
            firstName: updateObj.firstName,
            lastName: updateObj.lastName,
            bio: updateObj.bio,
            phone: updateObj.phone,
        };

        let addressObj = {
            street: updateObj.street,
            city: updateObj.city,
            state: updateObj.state,
            zipCode: updateObj.zipCode,
        }
        var user = await UserModel.findOneAndUpdate({_id: id}, {profile: profileObj, address: addressObj}, {
            new: true
        });

        res.render('users/index.pug', { title: "Profile", user, session: req.session.user } )

    } catch (error) {
        next(error);
    }
}


module.exports = { index, update }