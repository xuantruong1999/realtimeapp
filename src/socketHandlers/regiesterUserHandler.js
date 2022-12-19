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

      socket.join(to.toSocketId);
      io.to(to.toSocketId).emit("private-message:response", {
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
