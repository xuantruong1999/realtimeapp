const { UserModel } = require('../models/user.model');
const helper = require('../helpers/helper');

const authenMiddware = async (req, res, next) => {
  debugger
  if (req.session && req.session.user && req.session.user.isAuth) {
    return next();
  }

  if (req.cookies["remembermeToken"] && req.cookies["userId"]) {
    let user = await UserModel.findOneAndUpdate({ _id: req.cookies["userId"], remembermeToken: req.cookies["remembermeToken"] }).exec();

    if (user) {
      return next();
    }

  }
  return res.status(401).send("Unauthorized, Please login again");
}
module.exports = {
  authenMiddware
}