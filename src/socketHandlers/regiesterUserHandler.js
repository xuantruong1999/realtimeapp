const { Message, PrivateMessage } = require("../models/chat.model");
const helpers = require("../helpers/helper");
const { Group } = require("../models/chat.model");
const { UserModel } = require("../models/user.model");

module.exports = (io, socket) => {
  let senderId = helpers.getCookie("userId", socket.handshake.headers.cookie);

  const privateMessage = async ({ message, to }) => {
    try {
      await saveMessage(message, senderId, to.receiverId);
      Array.from(socket.rooms)
        .filter((room) => room !== socket.id)
        .forEach((id) => {
          socket.leave(id);
        });

      var arr = [socket.username, to.toUserName];
      arr = arr.sort((a, b) => (a < b ? -1 : 1));

      var groupName = arr[0] + "-with-" + arr[1]; // always unique group name

      socket.join(groupName); //socket.rooms = [socket.id, username1-with-username2]
      console.log(`to: ${to.toUserName}`);
      console.log(`rooms: `, socket.rooms);
      io.to(to.toSocketId).emit("private-message:response", {
        // same with io.sockets.to(to.toSocketId)

        from: { fromUserName: socket.username, senderId },
        to,
        message,
      });
    } catch (err) {
      throw err;
    }
  };

  const roomMessage = async function ({ message, groupId }) {
    console.log("message: ", message);

    var user = await UserModel.findById(
      senderId,
      "id username profile.avatar"
    ).exec();

    Group.findById(groupId).exec(async function (err, group) {
      if (err) return next(err);
      if (!group) {
        return socket.emit("error", { message: "group id is not exist" });
      }

      let from = {
        fromUserName: user.username,
        senderId: user.id,
        avatar: user.profile.avatar,
      };

      await saveMessage(message, user.id, "", groupId);

      return io.to(groupId).emit("room-message:response", {
        message,
        groupId,
        from,
      });
    });
  };

  const joinGroup = async function (groupId) {
    socket.join(groupId);
    socket.to(groupId).emit("room-message:notification-join", {
      newUser: socket.username,
    });
  };

  socket.on("private-message:post", privateMessage);
  socket.on("room-message:post", roomMessage);
  socket.on("join", joinGroup);
};

const saveMessage = async function (message, senderId, receiverId, groupId) {
  let mess;
  if (receiverId) {
    mess = new Message({
      text: message,
      senderId: senderId,
      receiverId: receiverId,
    });
  } else if (groupId) {
    mess = new Message({
      text: message,
      senderId: senderId,
      groupId: groupId,
    });
  }
  await mess.save();
};
