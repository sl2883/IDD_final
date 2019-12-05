// WebSocket connection setup
var socket = io();

document.getElementById('up').onclick = function () {
  console.log('up pressed');
  socket.emit('key_pressed', 'up');
}

document.getElementById('down').onclick = function () {
  console.log('down pressed');
  socket.emit('key_pressed', 'down');
};

document.getElementById('left').onclick = function () {
  console.log('left pressed');
  socket.emit('key_pressed', 'left');
};

document.getElementById('right').onclick = function () {
  console.log('right pressed');
  socket.emit('key_pressed', 'right');
};

document.getElementById('play').onclick = function () {
  console.log('play pressed');
  socket.emit('key_pressed', 'play');

};

socket.on('turn_changed', function (msg) {
  console.log('turn changed');

  if (msg != socket.id) {
    document.getElementById('up').disabled = false;
    document.getElementById('down').disabled = false;
    document.getElementById('right').disabled = false;
    document.getElementById('left').disabled = false;
    document.getElementById('play').disabled = false;
  }
  else {
    document.getElementById('up').disabled = true;
    document.getElementById('down').disabled = true;
    document.getElementById('left').disabled = true;
    document.getElementById('right').disabled = true;
    document.getElementById('play').disabled = true;
  }

});

socket.on('connect', function() { // We let the server know that we are up and running also from the client side;
  socket.emit('loaded');
});

socket.on('disconnect', function() { // We let the server know that we are up and running also from the client side;
  socket.emit('disconnected');
});

socket.on('userName', function(msg) { // We let the server know that we are up and running also from the client side;
  socket.username = msg;
});

socket.on('game_updated', function (game, currentX, currentY, board_width) {
  for (var i = 0; i < game.length; i++) {
    var elem = document.getElementById("b"+(i+1).toString());
    elem.innerText =
        (game[i] == 1)?"X":
            (game[i] == -1)?"0":
                ((currentY*board_width + currentX) == i)?"_":" ";

    var newStyle =
        (game[i] == 1)?"color:red":
            (game[i] == -1)?"color:orange":
                ((currentY*board_width + currentX) == i)?"color:black":" ";
    elem.setAttribute("style", newStyle);
  }
});

socket.on('won', function(msg) { // We let the server know that we are up and running also from the client side;
  if(socket.username == msg) {
    alert("You won!");
  }
});

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("active");

    /* Toggle between hiding and showing the active panel */
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
