$(document).ready(function () {
  var username = getCookie("name");
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox");
  var userSelects = document.getElementById("friend");
  var to = "";
  var receiverId = "";
  socket.on("users", (users) => {
    if (users.length > 0) {
      if (userSelects) {
        userSelects.replaceChildren();
        let listLi = `<div class="itemSelect custome-border">${username} (yourself) <br>
          <span class="icon-online"></span>
          <span>Online</span>
        </div>`;

        users.forEach((user, index) => {
          if (user.username !== username) {
            listLi += `<li class="itemSelect custome-border"
                          data-id="${user.socketId}" value="${user.username}" receiverId="${user.userId}">
                            <a class="d-block text-decoration-none" href="#tab${index}"  data-mdb-toggle="tab" role="tab" aria-controls="#tab${index}">
                              ${user.username} <br>
                              <span class="icon-online"> </span>
                              <span>Online</span>
                            </a>
                            <span class="badge d-none">0</span>
                          </li>`;
          }
        });
        userSelects.innerHTML = listLi;
      }
    }
  });

  $("#user-selection").on("click", "li.itemSelect", function (event) {
    event.preventDefault();

    $("#right-block").removeClass("d-none");
    to = ""; //reset
    receiverId = "";
    let liSelected = event.currentTarget;
    to = $(liSelected).attr("data-id");
    receiverId = $(liSelected).attr("receiverId");
    let brand = $(liSelected).attr("value")?.toLocaleUpperCase();

    if (brand) $("#brand").text(brand);
  });

  buttonSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = document.querySelector("input#chatbox");
    var message = inputValue.value;
    if (message) {
      socket.emit("private-message:post", { message, to: to, receiverId });
      inputValue.value = "";
    }
  });

  socket.on("private-message:response", ({ from, message }) => {
    var ul = document.querySelector("ul.messages");
    var li = document.createElement("li");
    li.textContent = `${from}: ${message}`;
    ul.appendChild(li);

    if (from !== username) {
      let badge = $("li[value=" + from + "]").children(".badge");
      if (badge.length > 0) {
        let numMess = $(badge).text();

        numMess = Number.parseInt(numMess) ? Number.parseInt(numMess) : 0;

        $(badge).text(++numMess).removeClass("d-none");
      }
    }
  });

  socket.on("connect_failed", (data) => {
    document.write("Sorry, there seems to be an issue with the connection!");
  });
});
