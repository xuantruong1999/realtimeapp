const express = require("express");
const router = express.Router();
const accountController = require("../controllers/account.controller");

router.get("/login", accountController.login);
router.get("/signup", accountController.signup);
router.post("/create", accountController.create)
module.exports = router;
