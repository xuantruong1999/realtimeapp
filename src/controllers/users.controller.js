const { UserModel, ProfileModel, AddressModel } = require('../models/user.model');

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
        let id = req.session.user.id;
        let updateObj = req.body;

        let profile = await ProfileModel.create({
            firstName: updateObj.firstName,
            lastName: updateObj.lastName,
            bio: updateObj.bio,
            phone: updateObj.phone,
        });

        let address = await AddressModel.create({
            street: updateObj.street,
            city: updateObj.city,
            state: updateObj.state,
            zipCode: updateObj.zipCode,
        })

        var user = await UserModel.findOneAndUpdate({ _id: id }, { email: updateObj.email, profile: profile, address: address }, {
            new: true,
            runValidators: true
        });

        res.render('users/index.pug', { title: "Profile", user, session: req.session.user })

    } catch (error) {
        next(error);
    }
}


module.exports = { index, update }