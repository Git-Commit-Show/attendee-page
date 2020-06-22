const socket = io("http://localhost:3000");


console.log("welcome script is working")
var hand = document.querySelector("#hand");
var submit = document.querySelector("#submit");
var number=document.querySelector("#number"); 
console.log(submit.innerText);
hand.addEventListener("submit", function(e) {
  console.log(submit.innerText);
  e.preventDefault();
});
submit.addEventListener("click", function() {
  if (number.innerText == "Raise Hands") {
    submit.style.background = "red";
    setTimeout(function(){submit.style.background = "#EFEFEF";
  },5000)
    socket.emit("raise-hand");
  }
    
});


socket.on("pageOpened",function(id){
  console.log("session id = " +id);
});
