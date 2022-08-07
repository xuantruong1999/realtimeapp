require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const app = express();
app.use(helmet());
const port = 3000;
const compression = require("compression");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');

const homeRouter = require('./src/routes/home.route');
const accountRouter = require('./src/routes/account.route');

//setting view mapping with the template engine pug
app.use(express.static('public'));
app.set("views", path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

//apply middlewares
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
debugger
//app.use('/:name', homeRouter);
app.use('/account', accountRouter)
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send(err.stack)
})

//
app.listen(port, () => {
  console.log(`RealTime App listening on port ${port}`);
  console.log("__dir: ", __dirname)
});
