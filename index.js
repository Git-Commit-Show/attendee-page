var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
app.use(bodyParser.urlencoded({
  extended: true
}));

let client = redis.createClient();
client.on("connect", function() {
  console.log("redis connected");
});

client.flushall();

app.use(express.static("public"));
const io = require("socket.io")(8080);
let users = [];

client.set("HandsRaised",0);

io.on("connection", socket => {


  socket.emit("pageOpened",users[0]);

  socket.on("raise-hand", function() {
    client.incr("HandsRaised");
    status();
  });

  socket.on("hand-raised", function() {
    client.decr("HandsRaised");
    status();
  });


});

var cookieParser = require('cookie-parser');
var session = require('express-session')
app.use(cookieParser());
app.use(session({
    secret: '34SDgsdgspxxxxxxxdfsG', // just a long random string
    resave: false,
    saveUninitialized: true
}));

app.listen(3000,function(){
  console.log("Server started at port 3000");
});

app.get("/", function(req, res) {
  const id = req.sessionID;

  res.render("home.ejs");

  if (users.indexOf(id) == -1) {
    users.unshift(id);
    client.lpush(["UsersId",id]);
    console.log("new user");
  } else {
    console.log("somebody returned");
  }
  status();
});

app.get("/chatroom",function(req,res){
 res.render("chatroom.ejs");
});

function status() {
  client.get("HandsRaised",function(err,hands){
    client.lrange("UsersId",0,-1,function(err,usersList){
      console.log("Active Users = "+ usersList.length+ "  Hands Raised = "+ (hands/usersList.length)*100+"%");
    });
  });
};
