var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
var socket=require("socket.io");  
app.use(bodyParser.urlencoded({
  extended: true
}));

let client = redis.createClient();
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
    setTimeout(function(){
    client.decr("HandsRaised");
    status();
    },5000);
    

  });

  socket.on("clap-raised", function() {
    client.incr("ClapsRaised");
    
    statusclap();
    setTimeout(function(){
    client.decr("ClapsRaised");
    statusclap();
    },5000);
    
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
  statusclap();
});

app.get("/chatroom",function(req,res){
 res.render("chatroom.ejs");
});

function status() {
  client.get("HandsRaised",function(err,hands){
    client.lrange("UsersId",0,-1,function(err,usersList){
     
      const per=(hands/usersList.length)*100;
      // I'VE TO USE THIS VALUE SUCH THAT INNERTEXT OF CURRENT % CHANGES,SO THAT CHANGED 
      // PERCENTAGE GET DISPLAYED   
      console.log("Active Users = "+ usersList.length+ "  Hands Raised = "+ (hands/usersList.length)*100+"%");
    
    
    });
  });
};
  function statusclap() {
    client.get("ClapsRaised",function(err,claps){
      client.lrange("UsersId",0,-1,function(err,usersList){
     
        console.log("Claps Raised = "+ claps);  
      
      }); 
      
      
      
      });
    };
  

