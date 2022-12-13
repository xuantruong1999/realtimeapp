const { Message, PrivateMessage } = require("../models/chat.model");

module.exports = (io, socket) => {
  const privateMessage = ({ message, to }) => {
    socket.join(to);
    io.to(to).emit("private-message:response", {
      from: socket.username,
      message,
    });
  };

  socket.on("private-message:post", privateMessage);
};
