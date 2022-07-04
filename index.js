require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;
const compression = require("compression");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const homeRouter = require('./src/routes/home.route');

//setting view mapping with the template engine pug
//app.set("views", path.join(__dirname, 'views'));
//app.set('view engine', 'pug');

//apply middlewares
app.use(express.static('public'));
app.use(morgan("combined"));
app.use(cors());
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.CONNECTION_URI, {
    connectTimeoutMS: 1000,
  })
  .then(() => {
    console.log('Connect to mongoDB successfully')
  })
  .catch((err) => console.log(`Can not connect to mongodb server with error: ${err}`));

//routers
app.use('/', homeRouter);

app.listen(port, () => {
  console.log(`RealTime App listening on port ${port}`);
});
