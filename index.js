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
const helpers = require("./src/helpers/helper");
const { UserModel } = require("./src/models/user.model");
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
app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist/"));

//apply middlewares
app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(
  cookieSession({
    keys: [process.env.SECRETKEY1],
    expires: new Date(Date.now() + 3600),
    httpOnly: true,
    // Cookie Options
    maxAge: 60 * 60 * 1000, // force expired 1 hour
  })
);

//Specified for development env
if (process.env.ENV === "Development") {
  //app.use(morgan("combined"));
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
io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const sessionId = helpers.getCookie(
    "session",
    socket.handshake.headers.cookie
  );
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  socket.sessionId = sessionId;

  next();
});

const onConnection = async function (socket) {
  const users = [];
  console.log("connection: ", socket.id);

  for (let [socketId, socket] of io.of("/").sockets) {
    var user = await UserModel.findOne(
      { username: socket.username },
      "id username profile.avatar"
    ).exec();
    users.push({
      username: user.username,
      socketId: socketId,
      userId: user.id,
      avatar: user.profile.avatar ?? "",
    });
  }

  io.sockets.emit("users", users);
  registerUserHandler(io, socket);

  socket.on("disconnect", async function () {
    console.log(`${socket.id} disconnect`);
    const users = [];

    for (let [socketId, socket] of io.of("/").sockets) {
      var user = await UserModel.findOne(
        { username: socket.username },
        "id username profile.avatar"
      ).exec();
      //console.log("user ", user);
      users.push({
        username: user.username,
        socketId: socketId,
        userId: user.id,
        avatar: user.profile.avatar ?? "",
      });
    }

    socket.broadcast.emit("private-message:disconnect", {
      socketId: socket.id,
    });
  });

  console.log("Rooms: ", io.sockets.adapter.rooms);
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
var port = process.env.PORT || 3000;
// Check the number of available CPU.
httpServer.listen(port, () => {
  //console.log("number of available CPU: ", numCPUs);
  console.log(`RealTime App listening on port ${port}`);
});
