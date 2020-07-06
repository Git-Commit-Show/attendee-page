"use strict"
require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
var socket = require("socket.io");
var cookieParser = require('cookie-parser');
var session = require('express-session')

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const SESSIONS_SECRET = process.env.SESSIONS_SECRET;
const HANDS_RAISED_TIME = process.env.HANDS_RAISED_TIME;
const REDIS_PORT = process.env.REDIS_PORT;
const SERVER_PORT = process.env.SERVER_PORT;
const CHAT_SERVER = process.env.CHAT_SERVER;


const server = app.listen(SERVER_PORT, function () {
    console.log(`Server started at port ${SERVER_PORT}`);
});

const io = socket(server);

app.use(bodyParser.urlencoded({
    extended: true
}));

//Conecting with redis
let client = redis.createClient({
    port: REDIS_PORT,
    password: REDIS_PASSWORD
});
client.on("connect", function () {
    console.log("redis connected");
});

// client.flushall();

app.use(express.static("public"));


let users = [];
let msgvalue = ''; //variable used to store initial value of Question
client.set("HandsRaised", 0);
client.set("ClapsRaised", 0);


io.on("connection", function(socket) {
    console.log("Connected: "+socket.handshake.address);
    socket.on('subscribe', function (room) {
        console.log(socket.id + 'Joined room: ' + room);
        socket.join(room);
    })
    //  TO FETCH THE QUESTIONS TO THE SERVER 
    socket.emit("questions", msgvalue);

    // TO EMIT QUESTIONS ASKED to everyone
    socket.on("questionmessage", function (msg) {
        io.emit("message", msg);
        client.lpush(["allQuestions", msg]);
        io.to('public').emit('message', msg);
    });


    client.lrange("allQuestions", 0, 30, function (err, data) {
        var msgHtml = data.map(function (msg) {
            return "<div class='message-item'><span style='opacity:0.8;font-size:70%;margin-top:0px;margin-bottom:5px;'>#NewQuestion #ToSpeaker</span><br/>" + msg + "</div>"
        })
        io.emit("loadAllQuestions", msgHtml ? msgHtml.join(' ') : "");
    });

    socket.emit("pageOpened", users[0]);

    sendClapCount();
    sendHandRaisedCount();

    socket.on("raise-hand", function () {
        client.incr("HandsRaised");
        sendHandRaisedCount();
    });

    socket.on("clap-raised", function () {
        client.incr("ClapsRaised");
        sendClapCount();
    });

    socket.on('disconnect', function() {
        console.log("Disconnected: "+socket.handshake.address);
    });
});


app.use(cookieParser());
app.use(session({
    secret: SESSIONS_SECRET, // just a long random string
    resave: false,
    saveUninitialized: true
}));



app.get("/", function (req, res) {
    const id = req.sessionID;

    res.render("home.ejs");

    if (users.indexOf(id) == -1) {
        users.unshift(id);
        client.lpush(["UsersId", id]);
        console.log("new user");
    } else {
        // console.log("somebody returned");
    }
});


app.get("/chatroom", function (req, res) {
    res.render("chatroom.ejs");
});

function sendHandRaisedCount() {
    client.get("HandsRaised", function (err, data) {
        client.lrange("UsersId", 0, -1, function (err, usersList) {
            let value = ((data / usersList.length) * 100).toFixed(0);
            console.log("hands Raised = " + value + "%");
            io.emit("handscount", value);
            setTimeout(function () {
                client.del("HandsRaised");
            }, HANDS_RAISED_TIME);
        });
    });
};

function sendClapCount() {
    client.get("ClapsRaised", function (err, claps) {
        io.emit("clapscount", claps);
    });
};