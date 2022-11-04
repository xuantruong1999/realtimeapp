const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accounts.controller");

router.get("/login", accountController.login);
router.get("/signup", accountController.signup);
router.post("/create", accountController.create);
router.post("/login", accountController.authen);
router.get("/logout", accountController.logout);
module.exports = router;
