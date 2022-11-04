const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

router.get("/index", usersController.index);
//router.get("/profile", usersController.view);
// router.get("/index", usersController.index);
module.exports = router;
