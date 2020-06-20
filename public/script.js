const socket = io("http://localhost:8080");


var hand = document.querySelector("#handraised");
var submit = document.querySelector("#submithand");
console.log(submit);
hand.addEventListener("submit", function(e) {
  e.preventDefault();
});
submit.addEventListener("click", function() {
  if (submit.innerText == "Raise Hands") {
    submit.style.background = "orange";
    submit.innerText = "Hand Raised";
    socket.emit("raise-hand");
  } else {
    submit.style.background = "#1762A7";
    submit.innerText = "Raise Hands";
    socket.emit("hand-raised");
  }
});


socket.on("pageOpened",function(id){
  console.log("session id = " +id);
});
