const { UserModel } = require('../models/user.model');
const { validationResult } = require('express-validator');


const index = async (req, res, next) => {
    try {
        let userId;
        if (req.session && req.session.user) {
            userId = req.session.user.id;
        }
        else {
            userId = req.cookies['userId']
        }

        if (userId) {
            var user = await UserModel.findById(userId).exec();
            if (!user) {
                res.status(204).send("user have not existed");
            }
            res.render("users/index.pug", { title: "Profile", user, res })
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
        
        let userId;
        if (req.session && req.session.user) {
            userId = req.session.user.id;
        }
        else {
            userId = req.cookies['userId']
        }

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

        var user = await UserModel.findOneAndUpdate({ _id: userId }, { email: updateObj.email, profile: profile, address: address }, {
            new: true,
            runValidators: true
        });

        res.render('users/index.pug', { title: "Profile Updated", user, res })

    } catch (error) {
        next(error);
    }
}


module.exports = { index, update }