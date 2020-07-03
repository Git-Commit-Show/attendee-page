socket.on('connected', function(data) {
    console.log(data);
    socket.emit('subscribe', 'public');
});

socket.on('message', function(message) {
    updateMessageUI(message);
})

socket.on('loadAllQuestions', function(data) {
    updateAllQuestions(data)
})

document.getElementById("iframe-text-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const msg = e.target.elements.message.value;
    console.log(msg);

    // EMIT QUESTION TEXT TO SERVER
    socket.emit("questionmessage", msg);

    // CLEAR INPUT 
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
})


// UPDATE DOM WITH CURRENT VALUE OF QUESTIONS
socket.on("questions", function(message) {
    // updateAllQuestions(message);
})


// CLAP CODE 
socket.on("clapscount", function(data) {
    updateClapCount(data);
});

function clapNow(){
    socket.emit("clap-raised");
    deactivateClapBtn();
}

// RAISE HAND CODE
socket.on("handscount", function(data) {
    updateHandsRaisedCount(data);
});

function raiseHandNow(){
    socket.emit("raise-hand");
    deactivateHandRaiseBtn();
}


socket.on("pageOpened", function(id) {
    console.log("session id = " + id);
});