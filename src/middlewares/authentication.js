const { UserModel } = require("../models/user.model");
const helper = require("../helpers/helper");

const authenMiddware = async (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAuth) {
    console.log(`from ${req.session.user.id}`);
    return next();
  }

  if (req.cookies["remembermeToken"] && req.cookies["userId"]) {
    let user = await UserModel.findOne({
      _id: req.cookies["userId"],
      remembermeToken: req.cookies["remembermeToken"],
    }).exec();

    if (user) {
      req.session.user = { isAuth: true, id: user.id };
      console.log(`from ${req.session.user.id}`);
      return next();
    }
  }
  return res
    .status(401)
    .send('Unauthorized, Please <a href="/account/login">login<a/> again');
};
module.exports = {
  authenMiddware,
};
