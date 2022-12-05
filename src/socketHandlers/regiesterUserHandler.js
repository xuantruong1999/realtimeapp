module.exports = (io, socket) => {
  const greeting = (data) => {
    debugger;
    socket.username = "truong";
    socket.emit("chat:on-chat", data);
  };

  socket.on("chat:greeting", greeting);
};
