const { UserModel } = require("../models/user.model");
const { Message } = require("../models/chat.model");
const { validationResult } = require("express-validator");
const { unlink } = require("node:fs/promises");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { Group } = require("../models/chat.model");
const { MessageViewModel } = require("../viewmodels/user.view.model");
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
  let userId = req.session.user.id;
  if (!userId) {
    return next(new Error("Invalid userId"));
  }
  Group.find({ menbers: [userId] })
    .select({ _id: 1, name: 1 })
    .exec(function (err, groups) {
      if (err) return next(err);
      res.render("users/chat.pug", { title: "Chat Message", res, groups });
    });
};

const loadPrivateMessages = async function (req, res, next) {
  console.log("starting to load private messages");
  var isAjaxRequest = req.xhr;
  var { user1 } = req.body;
  var user2 = req.session.user.id;
  if (!isAjaxRequest || !user1 || !user2) {
    return res.status(400).end();
  }

  let result = { rows: [], receiverId: user1 };

  var list = await Message.find(
    { user1, user2, active: true },
    "id receiverId senderId text"
  )
    .sort({ createdAt: 1 })
    .exec();

  const handleListMessage = async function (messages) {
    let result = { rows: [], receiverId: user1 };
    for (const message of messages) {
      console.log("start looping...");

      let fromUser = await UserModel.findById(
        message.senderId,
        "username profile.avatar"
      ).exec();

      let toUser = await UserModel.findById(
        message.receiverId,
        "username"
      ).exec();

      result.rows.push(new MessageViewModel(message.text, fromUser, toUser));
      console.log("end looping...");
    }
    return result;
  };

  result = await handleListMessage(list);
  console.log(result);
  res.json(result);

  console.log("end loadPrivateMessages");
};

module.exports = { index, update, chatMessage, loadPrivateMessages };
