const express = require("express");
const router = express.Router();
const usersController = require("../controllers/users.controller");
const validator = require("../middlewares/validate");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, filename + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });
router.get("/", usersController.index);
router.post("/update", upload.single('avatar'),validator.validateUserUpdate(), usersController.update);
module.exports = router;
