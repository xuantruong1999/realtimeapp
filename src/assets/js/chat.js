$(document).ready(function () {
  var username = getCookie("name");
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox");
  var userSelects = document.getElementById("friend");

  //$("#right-block").hide();

  socket.on("users", (users) => {
    if (users.length > 0) {
      if (userSelects) {
        userSelects.replaceChildren();
        let listLi = `<div class="itemSelect custome-border">${username} (yourself) <br>
          <span class="icon-online"></span>
          <span>Online</span>
        </div>`;

        users.forEach((user) => {
          if (user.username !== username) {
            listLi += `<li class="itemSelect custome-border"
                          data-id="${user.socketId}">
                          ${user.username} <br>
                            <span class="icon-online"> </span>
                            <span>Online</span>
                          </li>`;
          }
        });
        userSelects.innerHTML = listLi;
      }
    }
  });

  $("#user-selection").on("click", "li.itemSelect", function (event) {
    $("#right-block").removeClass("d-none");
    to = ""; //reset
    let liSelected = event.currentTarget;
    to = $(liSelected).attr("data-id");
    event.preventDefault();
  });

  buttonSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = document.querySelector("input#chatbox");
    var message = inputValue.value;

    if (message) {
      socket.emit("private-message:post", { message, to: to });
      inputValue.value = "";
    }
  });

  socket.on("private-message:response", ({ from, message }) => {
    var ul = document.querySelector("ul#messages");
    var li = document.createElement("li");
    li.textContent = `${from}: ${message}`;
    ul.appendChild(li);
  });

  socket.on("connect_failed", (data) => {
    document.write("Sorry, there seems to be an issue with the connection!");
  });
});
