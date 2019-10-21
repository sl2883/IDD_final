// WebSocket connection setup
var socket = io();
var questionRecieved = false;
// keep count of question, used for IF condition.
var output = document.getElementById('output'); // store id="output" in output variable
output.innerHTML = "<h1 id=response> </h1><h2 id=response2></h2>"; // ouput first question

function sendMessage() {
  var input = document.getElementById("input").value;
  socket.emit('message', input);
  document.getElementById("input").value = "";
  document.getElementById("input").style.display = "none";
}

//push enter key (using jquery), to run bot function.
$(document).keypress(function(e) {
  if (e.which == 13 && questionRecieved === true) {
    questionRecieved = false;
    sendMessage(); // run bot function when enter key pressed
  }
});

function playMusic() {
	document.getElementById('music').play();
}


function changeText(input) {
  document.getElementById('response').textContent = input;
  document.getElementById('response2').textContent = "";
}
function changeText2(input, input2) {
  document.getElementById('response').textContent = input;
  document.getElementById('response2').textContent = input2;
}

socket.on('answer', function(msg, msg2) {
  console.log('Incomming answer:', msg + " " + msg2);
  changeText2(msg, msg2);
});

socket.on('question', function(msg, ph) {
  console.log('Incomming Question:', msg);
  questionRecieved = true;
	
  document.getElementById("input").style.display = "block";
  document.getElementById("input").placeholder = ph;
  
	changeText(msg);
});

socket.on('playMusic', function(msg) {
	console.log('Playing music');
	playMusic();
});

socket.on('changeBG', function(msg) {
  console.log('Changeing backgroundColor to:', msg);
  document.body.style.backgroundColor = msg;
});

socket.on('changeFont', function(msg) {
  console.log('Changeing Font to:', msg);
  var h1 = document.getElementById('response');
  h1.style.color = 'white';


  //document.body.style.backgroundColor = msg;
});
socket.on('connect', function() { // We let the server know that we are up and running also from the client side;
  socket.emit('loaded');
  document.getElementById("input").style.display = "none"; // Here we wait for the first question to appear
});
