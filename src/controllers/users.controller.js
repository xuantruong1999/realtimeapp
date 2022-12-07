const { UserModel } = require("../models/user.model");
const { validationResult } = require("express-validator");
const { unlink } = require("node:fs/promises");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");

const index = async (req, res, next) => {
  try {
    let userId;
    if (req.session && req.session.user) {
      userId = req.session.user.id;
    } else {
      userId = req.cookies["userId"];
    }

    if (userId) {
      var user = await UserModel.findById(userId).exec();
      if (!user) {
        res.status(204).send("user have not existed");
      }
      res.render("users/index.pug", { title: "Profile", user, res });
    }
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let userId = req.session.user.id;
    let updateObj = req.body;
    let avatar = null;

    let query = await UserModel.findById(userId)
      .select("profile.avatar")
      .exec();

    let profile = {
      //avatar
      firstName: updateObj.firstName,
      lastName: updateObj.lastName,
      bio: updateObj.bio,
      phone: updateObj.phone,
    };

    //replace profile.avatar logic
    if (req.file && req.file.filename) {
      avatar = req.file.filename;

      if (avatar) {
        // action updated avatar
        profile.avatar = avatar;
        deletePreProfileAvatar(userId, query.profile.avatar);
      }
    } else {
      if (query && query.profile) {
        //hasn't update avatar
        profile.avatar = query.profile.avatar;
      }
    }

    let address = {
      street: updateObj.street,
      city: updateObj.city,
      state: updateObj.state,
      zipCode: updateObj.zipCode,
    };

    var user = await UserModel.findByIdAndUpdate(
      userId,
      { email: updateObj.email, profile: profile, address: address },
      {
        new: true,
        runValidators: true,
      }
    );

    res.render("users/index.pug", { title: "Profile Updated", user, res });
  } catch (error) {
    next(error);
  }
};

const deletePreProfileAvatar = async function (userId, filename) {
  if (!filename) return;

  if (!fs.existsSync(`./public/images/${filename}`)) {
    return;
  }

  if (!userId || !ObjectId.isValid(userId)) {
    return;
  }

  await UserModel.findById(userId).exec(function (err, user) {
    if (err) return next(err);
    try {
      let profile = user.profile;
      let avatarDefault = "profile-picture-default.jpg";
      if (profile) {
        if (profile.avatar !== avatarDefault) {
          unlink(`./public/images/${filename}`);
          console.log("successfully deleted: " + filename);
        }
      }
    } catch (err) {
      throw err;
    }
  });

  return filename;
};

const chatMessage = function (req, res, next) {
  res.render("users/chat.pug", { title: "Chat Message", res });
};
module.exports = { index, update, chatMessage };
