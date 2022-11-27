const { UserModel } = require("../models/user.model");
const helper = require("../helpers/helper");

const authenMiddware = async (req, res, next) => {
  if (req.session && req.session.user && req.session.user.isAuth) {
    return next();
  }

  if (req.cookies["remembermeToken"] && req.cookies["userId"]) {
    let user = await UserModel.findOneAndUpdate({
      id: req.cookies["userId"],
      remembermeToken: req.cookies["remembermeToken"],
    }).exec();

    if (user) {
      req.session.user = { isAuth: true, id: user.id };
      return next();
    }
  }
  return res.status(401).send("Unauthorized, Please login again");
};
module.exports = {
  authenMiddware,
};
