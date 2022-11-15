const index = function (req, res) {
  res.render("home/index.pug", {title:"home page", res});
};
module.exports = {
  index,
};
