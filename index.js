require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
var socket=require("socket.io"); 

const password=process.env.PASSWORD;
const secret=process.env.SECRET;
const time=process.env.TIME;
const port=process.env.PORT;

app.use(bodyParser.urlencoded({
  extended: true
}));



let client = redis.createClient({
  port      : port,           
  password  : password
});
client.on("connect", function() {
  console.log("redis connected");
});

client.flushall();

app.use(express.static("public"));

let server=app.listen(3000,function(){
  console.log("Server started at port 3000");
});







const io = socket(server);

let users = [];

client.set("HandsRaised",0);
client.set("ClapsRaised",0);


io.on("connection", socket => {


  socket.emit("pageOpened",users[0]);
  
  socket.on("raise-hand", function() {
    client.incr("HandsRaised");
     status();
  });

  socket.on("clap-raised", function() {
    client.incr("ClapsRaised");
    statusclap();
  });

  

});



var cookieParser = require('cookie-parser');
var session = require('express-session')
app.use(cookieParser());
app.use(session({
    secret: secret, // just a long random string
    resave: false,
    saveUninitialized: true
}));



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

  
});


app.get("/chatroom",function(req,res){
 res.render("chatroom.ejs");
});

function status() {
  client.get("HandsRaised",function(err,data){
    client.lrange("UsersId",0,-1,function(err,usersList){
   
     const value=(data/usersList.length)*100;
     console.log("hands Raised = "+ value+"%");
      io.emit("handscount",value);
      setTimeout(function(){
        client.del("HandsRaised");
        },time);
      

    });
    
  });
  
};
  function statusclap() {
    client.get("ClapsRaised",function(err,claps){
      client.lrange("UsersId",0,-1,function(err,usersList){
     
        console.log("Claps Raised = "+ claps); 
        io.emit("clapscount",claps);
      
        setTimeout(function(){
        client.del("ClapsRaised");
        },time);
      
      
      }); 
     });
    };
  

