function MessageViewModel(text = "", fromUser = "", toUser = "") {
  this.text = text;
  this.fromUser = fromUser;
  this.toUser = toUser;
}
module.exports = {
  MessageViewModel,
};
