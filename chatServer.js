/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server

var SerialPort = require('serialport');
var Readline = SerialPort.parsers.Readline; // read serial data as lines

var io = require('socket.io')(http); // connect websocket library to server

// check to make sure that the user provides the serial port for the Arduino
// when running the server
if (!process.argv[2]) {
	console.error('Usage: node ' + process.argv[1] + ' SERIAL_PORT');
	process.exit(1);
}

var serverPort = 8000;
current = 0;
var gameState = 0;
var game = [0, 0, 0, 0, 0, 0, 0, 0, 0];
var currentX = 0;
var currentY = 0;
var BOARD_WIDTH = 3;
var BOARD_HEIGHT = 3;
var currentCross = true;

//---------------------- SERIAL COMMUNICATION (Arduino) ----------------------//
// start the serial port connection and read on newlines
const serial = new SerialPort(process.argv[2], {});
const parser = new Readline({
	delimiter: '\r\n'
});

// Read data that is available on the serial port and send it to the websocket
serial.pipe(parser);
parser.on('data', function(data) {
	console.log('Data:', data);
	io.emit('server-msg', data);
	if(data == "light") {

		console.log('ledON');
	}
});

//---------------------- WEBAPP SERVER SETUP ---------------------------------//
// use express to create the simple webapp
app.use(express.static('public')); // find pages in public directory

// start the server and say what port it is on
http.listen(serverPort, function() {
	console.log('listening on *:%s', serverPort);
});
//----------------------------------------------------------------------------//


//---------------------- WEBSOCKET COMMUNICATION -----------------------------//
// this is the websocket event handler and say if someone connects
// as long as someone is connected, listen for messages
io.on('connect', function(socket) {
	console.log('a new user connected');
	console.log(current + 1);
	// var questionNum = 0; // keep count of question, used for IF condition.
	socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.
		// setTimeout(playMusic, 0, socket);
		// socket.emit('turn_changed', "your turn");
		socket.username = current++;
		socket.emit("userName", socket.username);
		printGame();
	});

	socket.on('key_pressed', (data) => { // If we get a new message from the client we process it;
		console.log(data + " " + socket.username);
		action(data, socket); // run the bot function with the new message
	});

	socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
		console.log('user disconnected');
		current--;
	});
});

function action(data, socket) {
	if (data == "play") {
		ticTak(data, socket);
		var next = socket.id;
		io.sockets.emit("turn_changed", next) ;
	}
	else {
		updateCurrentPos(data, socket);
	}
}

function ticTak(data, socket) {
	//updateCurrentPos(data, socket);

	if (currentCross) 	game[currentY * BOARD_HEIGHT + currentX] = 1;
	else 				game[currentY * BOARD_HEIGHT + currentX] = -1;

	currentCross = !currentCross;
	checkGame(socket);
	printGame();
}

function nextPlayable() {
	var i = currentY * BOARD_HEIGHT + currentX;
	while (game[i] != 0) {
		i++;

		i = i % (BOARD_HEIGHT * BOARD_WIDTH);

		currentX = i % BOARD_WIDTH;
		currentY = Math.floor(i / BOARD_HEIGHT);
	}
}

function updateCurrentPos(data, socket) {

	switch (data) {
		case "up":
			currentY = (currentY - 1) % BOARD_HEIGHT;
			break;
		case "down":
			currentY = (currentY + 1) % BOARD_HEIGHT;
			break;
		case "left":
			currentX = (currentX - 1) % BOARD_WIDTH;
			break;
		case "right":
			currentX = (currentX + 1) % BOARD_WIDTH;
			break;
	}

	if (currentX < 0) currentX = currentX + BOARD_WIDTH;
	if (currentY < 0) currentY = currentY + BOARD_HEIGHT;

	for(var i = currentY; i < BOARD_HEIGHT + currentY; i++) {
		for (var j = currentX; j < BOARD_WIDTH + currentX; j++) {

			i = i % BOARD_WIDTH;
			j = j % BOARD_HEIGHT;

			if (game[i * BOARD_HEIGHT + j] == 0) {
				currentX = j;
				currentY = i;

				i = BOARD_HEIGHT + currentY;
				j = BOARD_WIDTH + currentX;
			}
		}
	}

	console.log("X: " + currentX + " Y: " + currentY);

	printGame();

}

function checkGame(socket) {
	var gameCount = 0;
	for(var i = 0; i < 9; i++) {
		if(game[i] != 0) gameCount++;
	}

	if(checkAllRows() || checkAllColumns() || checkAllDiagonals())
	{
		socket.emit("won", socket.username);
		resetGame();
		return;
	}

	if (gameCount == 9) {
		resetGame();
	}
	else {
		nextPlayable();
	}

	printGame();
}

function checkAllRows() {
	var ret = false;

	if(	(game[0] != 0 && (game[0] == game[1] && game[1]== game[2]))
		|| ((game[3] != 0) && (game[3] == game[4] && game[4]== game[5]))
		|| ((game[6] != 0) && (game[6] == game[7] && game[7]== game[8]))) {
		ret = true;
	}

	return ret;
}

function checkAllColumns() {

	var ret = false;

	if(	(game[0] != 0 && (game[0] == game[3] && game[3]== game[6]))
		|| (game[1] != 0 && (game[1] == game[4] && game[4]== game[7]))
		|| (game[2] != 0 && (game[2] == game[5] && game[5]== game[8]))) {
		ret = true;
	}

	return ret;
}

function checkAllDiagonals() {

	var ret = false;

	if(	(game[0] != 0 && (game[0] == game[4] && game[4]== game[8]))
		|| (game[2] != 0 && (game[2] == game[4] && game[4]== game[6]))) {
		ret = true;
	}

	return ret;
}

function resetGame() {
	currentX = 0;
	currentY = 0;

	game = [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

function printGame() {
	io.sockets.emit("game_updated", game, currentX, currentY, BOARD_WIDTH);
	var game_temp = [];
	for(i = 0; i < game.length; i++) {
		if(game[i] == -1) game_temp[i] = 2;
		else game_temp[i] = game[i];
	}

	serial.write(game_temp.toString() + "\n");
}