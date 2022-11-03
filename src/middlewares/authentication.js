const authen = (req, res, next) => {
    if(req.session && req.session.user && req.session.user.isAuth){
      next();
    }
    else{
      return res.status(401).send("Unauthorized");
    }
  }


  module.exports = {
    authen
  }