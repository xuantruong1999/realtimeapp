const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");

router.get("/", usersController.index);
router.post("/update", usersController.update);
module.exports = router;
