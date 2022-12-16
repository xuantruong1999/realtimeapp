const { Message, PrivateMessage } = require("../models/chat.model");
const helpers = require("../helpers/helper");

module.exports = (io, socket) => {
  const privateMessage = async ({ message, to, receiverId }) => {
    try {
      let senderId = helpers.getCookie(
        "userId",
        socket.handshake.headers.cookie
      );

      let mess = new Message({
        text: message,
        senderId: senderId,
        receiverId: receiverId,
      });

      await mess.save();

      socket.join(to);
      io.to(to).emit("private-message:response", {
        from: socket.username,
        message,
      });
    } catch (err) {
      throw err;
    }
  };

  socket.on("private-message:post", privateMessage);
};
