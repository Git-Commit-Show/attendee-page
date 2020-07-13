"use strict"
require('dotenv').config();
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const redis = require("redis");
var cookieParser = require('cookie-parser');
var session = require('express-session')

const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const SESSIONS_SECRET = process.env.SESSIONS_SECRET;
const HANDS_RAISED_TIME = process.env.HANDS_RAISED_TIME;
const REDIS_PORT = process.env.REDIS_PORT;
const SERVER_PORT = process.env.SERVER_PORT;
const CHAT_SERVER = process.env.CHAT_SERVER;
const ONLINE_COUNT_REFRESH_TIME = process.env.ONLINE_COUNT_REFRESH_TIME;


const server = require('http').createServer(app);
var socket = require("socket.io");
const { Session } = require('inspector');
const io = socket(server);

server.listen(SERVER_PORT, function () {
    console.log(`Server started at port ${SERVER_PORT}`);
});

app.use(bodyParser.urlencoded({
    extended: true
}));

//Conecting with redis
let redisClient = redis.createClient({
    port: REDIS_PORT,
    password: REDIS_PASSWORD
});
redisClient.on("connect", function () {
    console.log("redis connected");
    //Delete all previous online user count
    redisClient.del('online-user-count')
});

// redisClient.flushall();

app.use(express.static("public"));


let users = [];
let msgvalue = ''; //variable used to store initial value of Question
redisClient.set("HandsRaised", 0);
redisClient.set("ClapsRaised", 0);


app.use(cookieParser());

const sessionMiddleware = session({
    secret: SESSIONS_SECRET,
    resave: false,
    saveUninitialized: true
});
//Register session middleware in express
app.use(sessionMiddleware);

//Register express like middleware for socket.io requests
io.use(function(socket, next){
    sessionMiddleware(socket.request, {}, next);
    // sessionMiddleware(socket.request, socket.request.res, next); will not work with websocket-only
    // connections, as 'socket.request.res' will be undefined in that case
});

app.get("/", function (req, res) {
    const id = req.sessionID;

    res.render("home.ejs");

    if (users.indexOf(id) == -1) {
        users.unshift(id);
        redisClient.lpush(["UsersId", id]);
        console.log("new user");
    } else {
    }
});


app.get("/chatroom", function (req, res) {
    res.render("chatroom.ejs");
});


io.on("connection", function(socket) {
    // Session management
    console.log("Connected: "+socket.handshake.address);
    socket.request.session.connections++;
    socket.request.session.save();
    redisClient.sadd("OnlineSessionIds", socket.request.session.id);
    console.log(socket.request.session.connections+ " sessions connected for "+socket.request.session.id);

    //Code for subscribig to a rpom
    socket.on('subscribe', function (room) {
        console.log(socket.id + 'Joined room: ' + room);
        socket.join(room);
    })

    //Fetch all questions
    socket.emit("questions", msgvalue);

    //Store the questions received from user when you received it
    socket.on("questionmessage", function (msg) {
        io.emit("message", msg);
        redisClient.lpush(["allQuestions", msg]);
        io.to('public').emit('message', msg);
    });

    redisClient.lrange("allQuestions", 0, 30, function (err, data) {
        var msgHtml = data.map(function (msg) {
            return "<div class='message-item'><span style='opacity:0.8;font-size:70%;margin-top:0px;margin-bottom:5px;'>#NewQuestion #ToSpeaker</span><br/>" + msg + "</div>"
        })
        io.emit("loadAllQuestions", msgHtml ? msgHtml.join(' ') : "");
    });

    socket.emit("pageOpened", users[0]);

    sendClapCount();
    sendHandRaisedCount();

    socket.on("raise-hand", function () {
        redisClient.incr("HandsRaised");
        sendHandRaisedCount();
    });

    socket.on("clap-raised", function () {
        redisClient.incr("ClapsRaised");
        sendClapCount();
    });

    //Send online user count to users on a fixed interval
    setInterval(function(){
        redisClient.scard("OnlineSessionIds", function(err, onlineUserCount){
            socket.emit("online-user-count", onlineUserCount);
        })
    }, ONLINE_COUNT_REFRESH_TIME)

    socket.on('disconnect', function() {
        socket.request.session.connections--;
        socket.request.session.save();
        redisClient.srem("OnlineSessionIds", socket.request.session.id);
        console.log("Disconnected: "+socket.handshake.address);
        console.log(socket.request.session.connections+ " sessions connected for "+socket.request.session.id);
    });
});

function sendHandRaisedCount() {
    redisClient.get("HandsRaised", function (err, data) {
        io.of('/').clients((error, clients) => {
            if (error) throw error;
            let value = ((data / clients.length) * 100).toFixed(0);
            console.log("hands Raised = " + value + "%");
            io.emit("handscount", value);
            setTimeout(function () {
                redisClient.del("HandsRaised");
            }, HANDS_RAISED_TIME);
        });
    });
};

function sendClapCount() {
    redisClient.get("ClapsRaised", function (err, claps) {
        io.emit("clapscount", claps);
    });
};