function MessageViewModel(text = "", fromUser = "", toUser = "") {
  this.text = text;
  this.fromUser = fromUser;
  this.toUser = toUser;
}

function MessageRoomViewModel(text = "", fromUser = "", toGroup = "") {
  this.text = text;
  this.fromUser = fromUser;
}
module.exports = {
  MessageViewModel,
  MessageRoomViewModel,
};
