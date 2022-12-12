$(document).ready(function () {
  var username = getCookie("name");
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox");
  var userSelects = document.getElementById("user-selection");

  $("#right-block").hide();

  socket.on("users", (users) => {
    if (users.length > 0) {
      if (userSelects) {
        userSelects.replaceChildren();
        let listLi = `<li class="user">${username} (yourself) <br>
          <span class="icon-online"></span>
          <span>Online</span>
        </li>`;

        users.forEach((user) => {
          if (user.username !== username) {
            listLi += `<li class="user">${user.username} <br><span class="icon-online"> </span><span>Online</span></li>`;
          }
        });
        userSelects.innerHTML = listLi;
      }
    }
  });

  $("#user-selection").on("click", "li", function (event) {
    $("#right-block").show(400);
    event.preventDefault();
  });

  buttonSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = document.querySelector("input#chatbox");
    var message = inputValue.value;

    if (message) {
      socket.emit("chat:post", { message });
      inputValue.value = "";
    }
  });

  socket.on("chat:on-chat", ({ username, data }) => {
    var ul = document.querySelector("ul#messages");
    var li = document.createElement("li");
    li.textContent = `${username}: ${data.message}`;
    ul.appendChild(li);

    ul.scrollTop = ul.scrollHeight;
  });

  socket.on("connect_failed", (data) => {
    document.write("Sorry, there seems to be an issue with the connection!");
  });
});
