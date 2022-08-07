const index = function (req, res) {
  res.render("home/index.pug", {title:"home page"});
};

const showName = function (req, res) {
  res.send(`<h1>Hello ${req.params.name}</h1>`);
};

module.exports = {
  index,
  showName,
};
