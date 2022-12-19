$(document).ready(function () {
  var username = getCookie("name");
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox");
  var userSelects = document.getElementById("friend");
  var tabContent = $("#right-block .tab-content");
  var to = { toSocketId: "", toUserName: "", receiverId: "" };
  socket.on("users", (users) => {
    if (users.length > 0) {
      if (userSelects) {
        userSelects.replaceChildren();
        let listLi = `<div class="itemSelect custome-border">${username} (yourself) <br>
          <span class="icon-online"></span>
          <span>Online</span>
        </div>`;
        let listUl = "";
        users.forEach((user, index) => {
          if (user.username !== username) {
            listLi += `<li class="itemSelect custome-border"
                          data-id="${user.socketId}" data-username="${user.username}" receiverId="${user.userId}">
                          <button class="d-block"
                            data-bs-target="#tab-${user.userId}" 
                            data-bs-toggle="tab" 
                            type="button" aria-selected="true"
                            role="tab" aria-controls="tab-${user.userId}">
                            ${user.username} <br>
                            <span class="icon-online"> </span>
                            <span>Online</span>
                            </button>
                            <span class="badge d-none">0</span>
                        </li>`;

            listUl += `<ul class="tab-pane p-2" role="tabpanel" 
                    id="tab-${user.userId}"></ul>`;
          }
        });
        userSelects.innerHTML = listLi;
        tabContent.empty().append(listUl);
      }
    }
  });

  $("#user-selection").on("click", "li.itemSelect", function (event) {
    event.preventDefault();

    $("#right-block").removeClass("d-none");
    to = { toSocketId: "", toUserName: "", receiverId: "" }; //reset
    let liSelected = event.currentTarget;
    to.toSocketId = $(liSelected).attr("data-id");
    to.receiverId = $(liSelected).attr("receiverId");
    to.toUserName = $(liSelected).attr("data-username");
    if (to.toUserName) $("#brand").text(to.toUserName.toLocaleUpperCase());

    //remove badge noti
    let badge = $(liSelected).children(".badge");
    if ($(badge).length > 0 && !$(badge).hasClass("d-none")) {
      $(badge).addClass("d-none");
      $(badge).text(0);
    }
  });

  buttonSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = document.querySelector("input#chatbox");
    var message = inputValue.value;
    if (message && to && to.toSocketId && to.toUserName && to.receiverId) {
      socket.emit("private-message:post", { message, to: to });
      inputValue.value = "";
    }
  });

  socket.on("private-message:response", ({ from, message, to }) => {
    var tabPanelSenderId = $(`#tab-${to.receiverId}`);
    var tabPanelreceiverId = $(`#tab-${from.senderId}`);
    var textContent = "";

    if ($(tabPanelSenderId).length > 0) {
      textContent = `${from.fromUserName}: ${message}`;
      $(tabPanelSenderId).append(`<li>${textContent}</li>`);
    }

    if ($(tabPanelreceiverId).length > 0) {
      textContent = `${from.fromUserName}: ${message}`;
      $(tabPanelreceiverId).append(`<li>${textContent}</li>`);
    }

    if (from.fromUserName !== username) {
      let id = `#tab-${from.senderId}`;
      let checkActive = $(id)?.hasClass("active");
      if (!checkActive) {
        let badge = $("li[data-username=" + from.fromUserName + "]").children(
          ".badge"
        );
        if (badge.length > 0) {
          let numMess = $(badge).text();
          numMess = Number.parseInt(numMess) || 0;
          numMess++;
          if (numMess !== 0) {
            $(badge).text(numMess).removeClass("d-none");
          }
        }
      }
    }
  });

  socket.on("connect_failed", (data) => {
    document.write("Sorry, there seems to be an issue with the connection!");
  });
});
