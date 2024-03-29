$(document).ready(function () {
  //Global variables
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
            listLi += `<li class="itemSelect custome-border" group="false"
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

    $("#right-block-1 ul.tab-pane").each((index, val) => {
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

  //handle when user selecte a list item
  $("#user-selection").on("click", "li.itemSelect", function (event) {
    let liSelected = event.currentTarget;
    let check = $(liSelected).attr("group") == "false";
    if (!check) {
      //group chat process
      clearTabpane(true);
      groupId = $(liSelected).attr("receiverId");
      $("#right-block-2").removeClass("d-none");
      $("#right-block-1").addClass("d-none");
      to = { toSocketId: "", toUserName: "", receiverId: "" }; //reset
      to.receiverId = groupId;
      let brand = $(liSelected).children("button").first()?.text();
      $("#brand").text(brand?.toLocaleUpperCase());
    } else {
      //private message
      clearTabpane();
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

  //join group
  if ($("#groups li.itemSelect").length > 0) {
    $("#groups li.itemSelect")
      .first()
      .one("click", function () {
        console.log("this: ", this);
        let id = $(this).attr("receiverId");

        if (id) {
          socket.emit("join", id);
          let generalRoom = $(`ul#tab-${id}`);
          if ($(generalRoom).length > 0) {
            loadRoomMesssages(id);
          }
        }
      });
  }

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

  $("#chatbox-1").focusin(function () {
    typingIndicatorShow("private", to);
  });

  $("#chatbox-1").focusout(function () {
    typingIndicatorHide("private", to);
  });

  $("#chatbox-2").focusin(function () {
    typingIndicatorShow("group", to);
  });

  $("#chatbox-2").focusout(function () {
    typingIndicatorHide("group", to);
  });

  $("#btn-chatbox-2").click(function (event) {
    let value = $("input#chatbox-2").val();
    if (value) {
      let html = "";
      let ul = $(`#tab-${groupId}`);
      html = `<li class="message-container-right">
                  <div class="text-right d-inline-block">${value}</div>
                </li>`;
      $(ul).append(html);

      socket.emit("room-message:post", { message: value, groupId: groupId });
    }
    $("input#chatbox-2").val("");
    event.preventDefault();
  });

  socket.on("room-message:response", function ({ message, groupId, from }) {
    var checkActive = $("li[receiverId=" + groupId + "]")
      .children("button")
      .first();

    if (!$(checkActive).hasClass("active")) {
      //turn on badge notification
      let badge = $("li[receiverId=" + groupId + "]").children(".badge");
      if (badge.length > 0) {
        let numMess = $(badge).text();
        numMess = Number.parseInt(numMess) || 0;
        numMess++;
        if (numMess !== 0) {
          $(badge).text(numMess).removeClass("d-none");
        }
      }
    }

    let ul = $(`#tab-${groupId}`);
    if ($(ul).length > 0) {
      var { fromUserName, senderId, avatar } = from;
      let html = "";

      if (avatar !== "profile-picture-default.jpg") {
        html = `<li class="message-container">
        <div class="photo" style="background-image: url(/images/${avatar});"
         data-bs-toggle="tooltip" data-bs-placement="top" title="${fromUserName}">
         
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

  socket.on("room-message:notification-join", ({ newUser }) => {
    console.log(`${newUser} joined`);
    alert(`${newUser} joined in general group`);
  });

  socket.on("private-message:response", ({ from, message }) => {
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
        let checkActive = $(
          `li[receiverId="${from.senderId}"] button`
        )?.hasClass("active");
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
        showMessages(data.rows, data.receiverId);
      })
      .fail(function () {
        console.log("err in function loadPrivateMessages");
      })
      .always(function () {
        hideLoading();
      });
  }

  function loadRoomMesssages(groupId) {
    if (!groupId) {
      return alert("Group id is invalid");
    }
    $.ajax({
      url: "loadRoomMessages",
      dataType: "json",
      method: "POST",
      timeout: 5000,
      data: {
        groupId,
      },
      beforeSend: function () {
        showLoading();
      },
    })
      .done(function (data) {
        console.log(data);
        showMessages(data.rows, data.groupId);
      })
      .fail(function () {
        console.log("load room messages failed: ", err.message);
      })
      .always(function () {
        hideLoading();
      });
  }

  function showMessages(rows, userId) {
    let id = `#tab-${userId}`;
    let ul = $(id);

    if (rows.length > 0 && $(ul).length > 0) {
      rows.forEach(({ text, fromUser }) => {
        let html = displayOneMessage(text, fromUser, userId);
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

  function typingIndicatorShow(type, to) {
    return socket.emit("typing-show", { type, to });
  }

  function typingIndicatorHide(type, to) {
    return socket.emit("typing-hide", { type, to });
  }

  function clearTabpane(isFriendBlock = false) {
    if (isFriendBlock) {
      $("#friend li button.active").each(function (index, value) {
        if ($(value).hasClass("active")) {
          $(value).removeClass("active");
        }
      });
    } else {
      $("#group li button.active").each(function (index, value) {
        if ($(value).hasClass("active")) {
          $(value).removeClass("active");
        }
      });
    }
  }

  function setOffLine(socketId) {
    let button = $(`li[data-id="${socketId}"]`).children("button");
    if ($(button).length > 0) {
      var tagSpans = $(button).children("span");
      $(tagSpans).first().css("background-color", "orange");
      $(tagSpans).last().text("Offline");
    }
  }

  socket.on("typing-private-chat-show", ({ usernameTyping }) => {
    let span = $("#typing-private-chat .tiblock")
      .children("span.list-username-typing")
      .first();
    $(span).text(usernameTyping);
    $("#typing-private-chat").show();
  });

  socket.on("typing-group-show", ({ usernameTyping }) => {
    let span = $("#typing-group-chat .tiblock")
      .children("span.list-username-typing")
      .first();
    if ($(span).text() === "") {
      $(span).text(" " + usernameTyping);
    } else {
      $(span).text().concat(", ", usernameTyping);
    }

    $("#typing-group-chat").show();
  });

  socket.on("typing-private-chat-hide", () => {
    $("#typing-private-chat").hide();
  });

  socket.on("typing-group-hide", () => {
    $("#typing-group-chat").hide();
  });

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
