const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const validator = require('../middlewares/validate');

router.get("/", usersController.index);
router.post("/update", validator.validateUserUpdate(), usersController.update);
module.exports = router;
