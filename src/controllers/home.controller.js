const index = function (req, res) {
  var session = req.session != null ?  req.session.user : null;
  res.render("home/index.pug", {title:"home page", session});
};
module.exports = {
  index,
};
