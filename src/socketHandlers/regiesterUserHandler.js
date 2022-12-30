const { Message, PrivateMessage } = require("../models/chat.model");
const helpers = require("../helpers/helper");

module.exports = (io, socket) => {
  const privateMessage = async ({ message, to }) => {
    try {
      let senderId = helpers.getCookie(
        "userId",
        socket.handshake.headers.cookie
      );

      let mess = new Message({
        text: message,
        senderId: senderId,
        receiverId: to.receiverId,
      });
      await mess.save();

      Array.from(socket.rooms)
        .filter((room) => room !== socket.id)
        .forEach((id) => {
          socket.leave(id);
        });

      var arr = [socket.username, to.toUserName];
      arr = arr.sort((a, b) => (a < b ? -1 : 1));

      var groupName = arr[0] + "-with-" + arr[1]; // always unique group name

      socket.join(groupName); //socket.rooms = [socket.id, username1-with-username2]
      //socket.join(to.toSocketId);
      console.log(`to: ${to.toUserName}`);
      console.log(`rooms: `, socket.rooms);
      io.to(to.toSocketId).emit("private-message:response", {
        // same with io.sockets.to(to.toSocketId)
        // same with  sockets.emit
        from: { fromUserName: socket.username, senderId },
        to,
        message,
      });
    } catch (err) {
      throw err;
    }
  };

  socket.on("private-message:post", privateMessage);
};
