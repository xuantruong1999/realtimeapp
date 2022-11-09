const { UserModel, ProfileModel, AddressModel } = require('../models/user.model');
const { validationResult } = require('express-validator');


const index = async (req, res, next) => {
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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let id = req.session.user.id;
        let updateObj = req.body;

        let profile = {
            firstName: updateObj.firstName,
            lastName: updateObj.lastName,
            bio: updateObj.bio,
            phone: updateObj.phone,
        };

        let address = {
            street: updateObj.street,
            city: updateObj.city,
            state: updateObj.state,
            zipCode: updateObj.zipCode,
        };

        var user = await UserModel.findOneAndUpdate({ _id: id }, { email: updateObj.email, profile: profile, address: address }, {
            new: true,
            runValidators: true
        });

        res.render('users/index.pug', { title: "Profile Updated", user, session: req.session.user })

    } catch (error) {
        next(error);
    }
}


module.exports = { index, update }