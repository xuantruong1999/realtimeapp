var socket = io();
var form = document.querySelector("form#form-chat");
var buttonSubmit = document.querySelector("#btn-chatbox");

buttonSubmit.addEventListener("click", function (event) {
  event.preventDefault();
  var inputValue = document.querySelector("input#chatbox");
  var message = inputValue.value;
  if (message) {
    socket.emit("hello", { message });
    inputValue.value = "";
  }
});

socket.on("on-chat", (data) => {
  var ul = document.querySelector("ul#messages");
  var li = document.createElement("li");
  li.textContent = data.message;
  ul.appendChild(li);
});
