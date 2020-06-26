require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
var socket = require("socket.io");

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const SESSIONS_SECRET = process.env.SESSIONS_SECRET;
const HANDS_RAISED_TIME = process.env.HANDS_RAISED_TIME;
const REDIS_PORT = process.env.REDIS_PORT;
const SERVER_PORT = process.env.SERVER_PORT;

app.use(bodyParser.urlencoded({
    extended: true
}));


let client = redis.createClient({
    port: REDIS_PORT,
    password: REDIS_PASSWORD
});
client.on("connect", function() {
    console.log("redis connected");
});

client.flushall();

app.use(express.static("public"));

let server = app.listen(SERVER_PORT, function() {
    console.log(`Server started at port ${SERVER_PORT}`);
});

const io = socket(server);

let users = [];

client.set("HandsRaised", 0);
client.set("ClapsRaised", 0);


io.on("connection", socket => {

    //  TO FETCH THE QUESTIONS TO THE SERVER 
    socket.emit("questions", "Welcome to Invid");

    // TO EMIT QUESTIONS ASKED to everyone
    socket.on("questionmessage", function(msg) {
        // function storeQuestions(msg){
        client.lpush(["allQuestions", msg]);
        client.lrange("allQuestions", 0, -1, function(err, dta) {
            io.emit("questions", dta);
        });

        // client.llen("allQuestions",function(err,da){
        //   for(i=0;i<da;i++){
        //     client.lrange("allQuestions",i,i,function(err,dta){
        //       io.emit("questions",dta);
        //       // console.log(dta)
        //     });
        //   }

        //   console.log(da);
        // });
    });


    socket.emit("pageOpened", users[0]);

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
    secret: SESSIONS_SECRET, // just a long random string
    resave: false,
    saveUninitialized: true
}));



app.get("/", function(req, res) {
    const id = req.sessionID;

    res.render("home.ejs");



    if (users.indexOf(id) == -1) {
        users.unshift(id);
        client.lpush(["UsersId", id]);
        console.log("new user");
    } else {
        console.log("somebody returned");
    }


});


app.get("/chatroom", function(req, res) {
    res.render("chatroom.ejs");
});

function status() {
    client.get("HandsRaised", function(err, data) {
        client.lrange("UsersId", 0, -1, function(err, usersList) {

            let value = ((data / usersList.length) * 100).toFixed(0);
            console.log("hands Raised = " + value + "%");
            io.emit("handscount", value);
            setTimeout(function() {
                client.del("HandsRaised");
            }, HANDS_RAISED_TIME);


        });

    });

};

function statusclap() {
    client.get("ClapsRaised", function(err, claps) {
        client.lrange("UsersId", 0, -1, function(err, usersList) {

            console.log("Claps Raised = " + claps);
            io.emit("clapscount", claps);

            setTimeout(function() {
                client.del("ClapsRaised");
            }, HANDS_RAISED_TIME);


        });
    });
};