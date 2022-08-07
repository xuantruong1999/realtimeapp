const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");

router.get("/login", accountController.login);
module.exports = router;
