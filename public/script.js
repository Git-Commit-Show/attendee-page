const socket = io("http://localhost:3000");


console.log("welcome script is working")

// RAISE HAND CODE
var hand = document.querySelector("#hand");
var submit = document.querySelector("#submit");
var number=document.querySelector("#number"); 

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

// CLAP CODE 
var clap = document.querySelector("#clap");
var submitclap = document.querySelector("#submitclap");
var clapnumber=document.querySelector("#clapnumber"); 

clap.addEventListener("submit", function(e) {
  
  e.preventDefault();
});
submitclap.addEventListener("click", function() {
  if (clapnumber.innerText == "Claps") {
    submitclap.style.background = "red";
    setTimeout(function(){submitclap.style.background = "#EFEFEF";
  },5000)
    socket.emit("clap-raised");
  }
    
});


socket.on("pageOpened",function(id){
  console.log("session id = " +id);
});
