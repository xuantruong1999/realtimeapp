require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const app = express();
const { createServer } = require("http");
const httpServer = createServer(app);
const compression = require("compression");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const cookieSession = require("cookie-session");
const homeRouter = require("./src/routes/home.route");
const accountsRouter = require("./src/routes/accounts.route");
const usersRouter = require("./src/routes/users.route");
const { authenMiddware } = require("./src/middlewares/authentication");
const cookieParser = require("cookie-parser");
const registerUserHandler = require("./src/socketHandlers/regiesterUserHandler");
const { Server } = require("socket.io");

const io = new Server(httpServer);

//setting view mapping with the template engine pug
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "pug");
app.use("/assets", express.static(__dirname + "/src/assets/"));
app.use(
  "/css",
  express.static(__dirname + "/node_modules/bootstrap/dist/css/")
);
app.use("/js", express.static(__dirname + "/node_modules/bootstrap/dist/js/"));

//apply middlewares
app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cookieSession({
    //secure: true,
    keys: [process.env.SECRETKEY1],
    expires: new Date(Date.now() + 3600),
    httpOnly: true,
    // Cookie Options
    maxAge: 60 * 60 * 1000, // force expired 1 hour
  })
);

//Specified for development env
if (process.env.ENV === "Development") {
  app.use(morgan("combined"));
}
app.use(compression());

app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

//#region routers
app.use("/", homeRouter);
app.use("/account", accountsRouter);
app.use("/users", authenMiddware, usersRouter);

app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});
//#endregion

//Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send(err.stack);
});

//#region Socket.IO integrate
const onConnection = function (socket) {
  console.log(socket);
  registerUserHandler(io, socket);
};
io.on("connection", onConnection);
//#endregion

mongoose
  .connect(process.env.CONNECTION_URI, {
    connectTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    dbName: "Mydb",
  })
  .then(() => {
    console.log("Connect to mongoDB successfully");
  })
  .catch((err) =>
    console.log(`Can not connect to mongodb server with error: ${err}`)
  );
var port = process.env.PORT;

httpServer.listen(port, () => {
  console.log(`RealTime App listening on port ${port}`);
});
