const index = function (req, res) {
  debugger
  res.render("home/index.pug", {title:"home page"});
};


module.exports = {
  index,
};
