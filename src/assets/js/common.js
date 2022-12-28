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

function displayOneMessgae(text, fromUser, receiverId) {
  let html = "";
  if (fromUser._id == receiverId) {
    if (fromUser.profile.avatar !== "profile-picture-default.jpg") {
      html = `<li class="message-container">
      <div class="photo" style="background-image: url(/images/${fromUser.profile.avatar});"
       data-bs-toggle="tooltip" data-bs-placement="top" title="${fromUser.username}">
       
        </div> 
      <div class="text-left d-inline-block">${text}</div>
    </li>`;
    } else {
      html = `<li class="message-container">
      <div class="nickname"  data-bs-toggle="tooltip" data-bs-placement="top" title="${
        fromUser.username
      }">${reduceNickNameString(fromUser.username)}
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
