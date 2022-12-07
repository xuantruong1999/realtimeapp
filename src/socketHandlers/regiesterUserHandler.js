module.exports = (io, socket) => {
  const greeting = (data) => {
    io.sockets.emit("chat:on-chat", { username: socket.username, data });
  };

  socket.on("chat:post", greeting);
};
