$(document).ready(function () {
  var username = getCookie("name") || "";
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox");
  var userSelects = document.getElementById("friend");
  var tabContent = $("#right-block .tab-content");
  var to = { toSocketId: "", toUserName: "", receiverId: "" };

  socket.on("users", (users) => {
    console.log("list user connecting: ", users);
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
                          data-id="${user.socketId}" data-avatar="${user.avatar}" data-username="${user.username}" receiverId="${user.userId}">
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
        let loading = `<div class="preloader"><div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
      </div></div>`;
        tabContent.empty().append(loading).append(listUl);

        if (to.receiverId) {
          //clear active show tab pane if one user disconnected
          clearTabpane();

          let ulActive = $(`ul#tab-${to.receiverId}`);
          if ($(ulActive).length > 0) $(ulActive).toggleClass('active show"');
        }
      }
    }

    $("ul.tab-pane").each((index, val) => {
      let id = $(val).attr("id");
      let userId = id.split("-")[1] || "";
      console.log(
        `from: ${username}  | userid passed to loadPrivateMessages ===> ${userId} `
      );
      if (userId) loadPrivateMessages(userId);
      else {
        console.log("userId passing loadPrivateMessages is invalid");
      }
    });
  });

  $("#user-selection").on("click", "li.itemSelect", function (event) {
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

    event.preventDefault();
  });

  buttonSubmit.addEventListener("click", function (event) {
    event.preventDefault();
    var inputValue = document.querySelector("input#chatbox");
    var message = inputValue.value;
    if (message && to && to.toSocketId && to.toUserName && to.receiverId) {
      var tabPanelreceiverId = $(`#tab-${to.receiverId}`);

      if ($(tabPanelreceiverId).length > 0) {
        let html = `<li class="message-container-right">
                      <div class="text-right d-inline-block">${message}</div>
                    </li>`;
        $(tabPanelreceiverId).append(html);
      }

      socket.emit("private-message:post", { message, to: to });
      inputValue.value = "";
    }
  });

  socket.on("private-message:response", ({ from, message }) => {
    if (to.receiverId) {
      clearTabpane();
      let ulActive = $(`ul#tab-${to.receiverId}`);
      if ($(ulActive).length > 0) $(ulActive).toggleClass('active show"');
    }

    var tabPanelsenderId = $(`#tab-${from.senderId}`);

    if ($(tabPanelsenderId).length > 0) {
      var avatar = $(`li[receiverId="${from.senderId}"]`)?.attr("data-avatar");
      if (avatar !== "profile-picture-default.jpg") {
        html = `<li class="message-container">
        <div class="photo" style="background-image: url(/images/${avatar});"
         data-bs-toggle="tooltip" data-bs-placement="top" title="${from.fromUserName}">
         
          </div> 
        <div class="text-left d-inline-block">${message}</div>
      </li>`;
      } else {
        html = `<li class="message-container">
        <div class="nickname"  data-bs-toggle="tooltip" data-bs-placement="top" title="${
          from.fromUserName
        }">${reduceNickNameString(from.fromUserName)}
          </div> 
        <div class="text-left d-inline-block">${message}</div>
      </li>`;
      }
      $(tabPanelsenderId).append(html);

      if (from.senderId) {
        let id = `#tab-${from.senderId}`;
        let checkActive = $(id)?.hasClass("active");
        if (!checkActive) {
          //turn on badge notification
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
    }
  });

  function loadPrivateMessages(user1) {
    $.ajax({
      url: "loadPrivateMessages",
      dataType: "json",
      method: "POST",
      timeout: 5000,
      data: {
        user1,
        username: username,
      },
      beforeSend: function () {
        showLoading();
      },
    })
      .done(function (data) {
        console.log(data);
        showMessages(data);
      })
      .fail(function (err) {
        console.log(err);
      })
      .always(function () {
        hideLoading();
      });
  }

  function showMessages({ rows, receiverId }) {
    let id = `#tab-${receiverId}`;
    let ul = $(id);

    if (rows.length > 0 && $(ul).length > 0) {
      rows.forEach(({ text, fromUser, toUser }) => {
        let html = displayOneMessgae(text, fromUser, receiverId);
        $(ul).append(html);
      });
    }
  }

  function showLoading() {
    $(".preloader").show();
  }

  function hideLoading() {
    $(".preloader").hide();
  }

  function clearTabpane() {
    $("ul.tab-pane").each((index, value) => {
      if ($(value).hasClass("active show")) {
        $(value).removeClass("active show");
      }
    });
  }

  socket.on("connect_error", (err) => {
    document.write(
      "Sorry, there seems to be an issue with the connection! with error: ",
      err.message
    );
  });
});
