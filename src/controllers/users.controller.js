const { UserModel } = require("../models/user.model");
const { Message } = require("../models/chat.model");
const { validationResult } = require("express-validator");
const { unlink } = require("node:fs/promises");
const ObjectId = require("mongoose").Types.ObjectId;
const fs = require("fs");
const { Group } = require("../models/chat.model");
const {
  MessageViewModel,
  MessageRoomViewModel,
} = require("../viewmodels/user.view.model");

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

  UserModel.findById(userId).exec(function (err, user) {
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

  Group.find({
    $or: [{ members: { $in: [ObjectId(userId)] } }, { members: [] }],
  })
    .select({ _id: 1, name: 1 })
    .exec(function (err, groups) {
      if (err) return next(err);
      res.render("users/chat.pug", { title: "Chat Message", res, groups });
    });
};

const loadPrivateMessages = async function (req, res, next) {
  var isAjaxRequest = req.xhr;
  var { user1 } = req.body;
  var user2 = req.session.user.id;
  console.log(`load private messages: ${req.body.username}`);

  if (!isAjaxRequest || !user1 || !user2) {
    return res.status(400).end();
  }
  let result = { rows: [], receiverId: user1 };

  var list = await Message.find(
    {
      senderId: { $in: [ObjectId(user1), ObjectId(user2)] },
      receiverId: { $in: [ObjectId(user1), ObjectId(user2)] },
      active: true,
    },
    "id receiverId senderId text"
  )
    .populate("senderId")
    .populate("receiverId")
    .sort({ createdAt: 1 })
    .exec();

  const handleListMessage = async function (messages) {
    let result = { rows: [], receiverId: user1 };
    for (const message of messages) {
      let sender = message.senderId;

      let from = {
        fromUserName: sender.username,
        id: sender.id,
        avatar: sender.profile.avatar,
      };

      let receiver = message.receiverId;
      let to = {
        fromUserName: receiver.username,
      };

      result.rows.push(new MessageViewModel(message.text, from, to));
    }
    console.log(
      `load messaege: user1: ${user1}--user2: ${user2} total messages: `,
      result.rows.length
    );
    return result;
  };

  result = await handleListMessage(list);
  res.json(result);
};

const loadRoomMessages = async function (req, res, next) {
  var isAjaxRequest = req.xhr;
  var { groupId } = req.body;
  console.log(`load room messages: ${groupId}`);

  if (!isAjaxRequest || !groupId) {
    return res.status(400).end();
  }

  var result = { rows: [], groupId: groupId };

  Message.find({ groupId: groupId })
    .populate("senderId")
    .exec()
    .then(function (messages) {
      messages.forEach((element) => {
        let user = element.senderId;
        let from = {
          fromUserName: user.username,
          id: user.id,
          avatar: user.profile.avatar,
        };

        result.rows.push(new MessageRoomViewModel(element.text, from));
      });
      result.groupId = groupId;
      res.json(result);
    });
};

module.exports = {
  index,
  update,
  chatMessage,
  loadPrivateMessages,
  loadRoomMessages,
};
