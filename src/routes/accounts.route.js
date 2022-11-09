const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accounts.controller");
const validator = require('../middlewares/validate');

router.get("/login", accountController.login);
router.get("/signup", accountController.signup);
router.post("/create", validator.validateSignup(), accountController.create);
router.post("/login", validator.validateLogin(), accountController.authen);
router.get("/logout", accountController.logout);
module.exports = router;
