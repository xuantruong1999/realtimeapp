$(document).ready(function () {
  var username = getCookie("name") || "";
  var socket = io({ auth: { username } });
  var buttonSubmit = document.querySelector("#btn-chatbox-1");
  var userSelects = document.getElementById("friend");
  var tabContent = $("#right-block-1 #private-messages-box");
  var to = { toSocketId: "", toUserName: "", receiverId: "" };
  var groupId = "";

  socket.on("users", (users) => {
    console.log("list user connecting: ", users);
    if (users.length >= 1) {
      if (userSelects) {
        userSelects.replaceChildren();
        let listLi = `<div class="itemSelect custome-border">${username} (yourself) <br>
          <span class="icon-online"></span>
          <span>Online</span>
        </div>`;
        let listUl = "";
        //generate list friend user vs tab content combine,showing private messages
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

            if (to.receiverId !== user.userId) {
              listUl += `<ul class="tab-pane p-2" role="tabpanel" 
                    id="tab-${user.userId}"></ul>`;
            } else {
              listUl += `<ul class="tab-pane p-2 active show" role="tabpanel" 
              id="tab-${user.userId}"></ul>`;
            }
          }
        });
        userSelects.innerHTML = listLi;

        let loading = "";
        if (users.length > 1) {
          loading = `<div class="preloader"><div class="spinner-border" style="width: 2rem; height: 2rem;" role="status">
                    </div></div>`;
        }

        tabContent.empty().append(loading).append(listUl);
      }
    }

    $("ul.tab-pane").each((index, val) => {
      let id = $(val).attr("id");
      let userId = id.split("-")[1] || "";
      if (userId) {
        loadPrivateMessages(userId);
      } else {
        console.log("userId passing loadPrivateMessages is invalid");
        throw new Error("userid is invalid");
      }
    });
  });

  socket.on("private-message:disconnect", ({ socketId }) => {
    console.log("Disconect socket id ========> ", socketId);
    setOffLine(socketId);
  });

  $("#user-selection").on("click", "li.itemSelect", function (event) {
    let liSelected = event.currentTarget;
    groupId = $(liSelected).attr("data-group-id");
    if (groupId) {
      $("#right-block-2").removeClass("d-none");
      $("#right-block-1").addClass("d-none");
      let brand = $(liSelected).children("button").first()?.text();
      $("#brand").text(brand?.toLocaleUpperCase());
    } else {
      $("#right-block-1").removeClass("d-none");
      $("#right-block-2").addClass("d-none");
      to = { toSocketId: "", toUserName: "", receiverId: "" }; //reset
      to.toSocketId = $(liSelected).attr("data-id");
      to.receiverId = $(liSelected).attr("receiverId");
      to.toUserName = $(liSelected).attr("data-username");
      if (to.toUserName) $("#brand").text(to.toUserName.toLocaleUpperCase());
    }

    //remove badge noti
    let badge = $(liSelected).children(".badge");
    if ($(badge).length > 0 && !$(badge).hasClass("d-none")) {
      $(badge).addClass("d-none");
      $(badge).text(0);
    }

    event.preventDefault();
  });

  buttonSubmit.addEventListener("click", function (event) {
    var inputValue = document.querySelector("input#chatbox-1");
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
    } else {
      //handle for chat group
    }

    event.preventDefault();
  });

  $("#btn-chatbox-2").click(function (event) {
    let value = $("input#chatbox-2").val();
    if (value) {
      socket.emit("room-message:post", { message: value, groupId: groupId });
    }
    $("input#chatbox-2").val("");
    event.preventDefault();
  });

  socket.on("room-message:response", function ({ message, groupId, from }) {
    console.log("message: =================> ", message);
    console.log("groupId: =================> ", groupId);
    console.log("from: =================> ", from);
    let ul = $(`#tab-${groupId}`);
    if ($(ul).length > 0) {
      var { fromUserName, senderId, avatar } = from;
      let html = "";

      if (fromUserName === username) {
        html = `<li class="message-container-right">
                  <div class="text-right d-inline-block">${message}</div>
                </li>`;
        $(ul).append(html);
        return;
      }

      if (avatar !== "profile-picture-default.jpg") {
        html = `<li class="message-container">
        <div class="photo" style="background-image: url(/images/${avatar});"
         data-bs-toggle="tooltip" data-bs-placement="top" title="${username}">
         
          </div> 
        <div class="text-left d-inline-block">${message}</div>
      </li>`;
      } else {
        html = `<li class="message-container">
        <div class="nickname"  data-bs-toggle="tooltip" data-bs-placement="top" title="${fromUserName}">${reduceNickNameString(
          fromUserName
        )}
          </div> 
        <div class="text-left d-inline-block">${message}</div>
      </li>`;
      }

      $(ul).append(html);
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

  function setOffLine(socketId) {
    let button = $(`li[data-id="${socketId}"]`).children("button");
    if ($(button).length > 0) {
      var tagSpans = $(button).children("span");
      $(tagSpans).first().css("background-color", "orange");
      $(tagSpans).last().text("Offline");
    }
  }

  socket.on("connect_error", (err) => {
    document.write(
      "Sorry, there seems to be an issue with the connection! with error: ",
      err.message
    );
  });

  socket.on("error", (err) => {
    document.write(
      "Sorry, there seems to be an issue with the connection! with error: ",
      err.message
    );
  });
});
