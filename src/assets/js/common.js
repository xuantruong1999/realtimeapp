function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function reduceNickNameString(nickname = "") {
  if (nickname) {
    nickname = nickname.substring(0, 2).toUpperCase();
  }
  return nickname;
}

function displayOneMessage(text, fromUser, receiverId) {
  let html = "";
  let name = getCookie("name");
  if (fromUser.fromUserName !== name) {
    if (fromUser.avatar !== "profile-picture-default.jpg") {
      html = `<li class="message-container">
      <div class="photo" style="background-image: url(/images/${fromUser.avatar});"
       data-bs-toggle="tooltip" data-bs-placement="top" title="${fromUser.fromUserName}">
        </div> 
      <div class="text-left d-inline-block">${text}</div>
    </li>`;
    } else {
      html = `<li class="message-container">
      <div class="nickname"  data-bs-toggle="tooltip" data-bs-placement="top" title="${
        fromUser.fromUserName
      }">${reduceNickNameString(fromUser.fromUserName)}
        </div> 
      <div class="text-left d-inline-block">${text}</div>
    </li>`;
    }
  } else {
    html = `<li class="message-container-right">
                <div class="text-right d-inline-block">${text}</div>
            </li>`;
  }

  return html;
}
