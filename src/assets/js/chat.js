var socket = io();
var form = document.querySelector("form#form-chat");
var buttonSubmit = document.querySelector("#btn-chatbox");

buttonSubmit.addEventListener("click", function (event) {
  event.preventDefault();
  var inputValue = document.querySelector("input#chatbox");
  var message = inputValue.value;
  var username = getCookie("name");
  debugger;
  if (message) {
    socket.auth = { username };
    socket.emit("chat:greeting", { message });
    inputValue.value = "";
  }
});

socket.on("chat:on-chat", (data) => {
  var ul = document.querySelector("ul#messages");
  var li = document.createElement("li");
  li.textContent = `${socket.username} ${data.message}`;
  ul.appendChild(li);
});

socket.on("connect_failed", (data) => {
  document.write("Sorry, there seems to be an issue with the connection!");
});
