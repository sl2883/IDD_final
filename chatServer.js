/*
chatServer.js
Author: David Goedicke (da.goedicke@gmail.com)
Closley based on work from Nikolas Martelaro (nmartelaro@gmail.com) as well as Captain Anonymous (https://codepen.io/anon/pen/PEVYXz) who forked of an original work by Ian Tairea (https://codepen.io/mrtairea/pen/yJapwv)
*/

var express = require('express'); // web server application
var app = express(); // webapp
var http = require('http').Server(app); // connects http library to server
var io = require('socket.io')(http); // connect websocket library to server
var serverPort = 8000;


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
	var questionNum = 0; // keep count of question, used for IF condition.
	socket.on('loaded', function() { // we wait until the client has loaded and contacted us that it is ready to go.

		socket.emit('answer', "Hey, I am a CalmBot.", ""); //We start with the introduction;
		setTimeout(playMusic, 0, socket);
		setTimeout(timedColor, 1000, socket, "blue");
		setTimeout(timedAnswer, 2000, socket, "I can help you relax"); // Wait a moment and respond with a question.
		setTimeout(timedColor, 3000, socket, "yellow");
		setTimeout(timedQuestion, 4000, socket, "Would you like to know more benefits?", "Yes or No"); // Wait a moment and respond with a question.
	});
	socket.on('message', (data) => { // If we get a new message from the client we process it;
		console.log(data);
		questionNum = bot(data, socket, questionNum); // run the bot function with the new message
	});
	socket.on('disconnect', function() { // This function  gets called when the browser window gets closed
		console.log('user disconnected');
	});
});

//--------------------------CHAT BOT FUNCTION-------------------------------//
function bot(data, socket, questionNum) {
	var input = data; // This is generally really terrible from a security point of view ToDo avoid code injection
	var answer;
	var answer2 = "";
	var question;
	var waitTime;
	var timerTime = -1;
	/// These are the main statments that make up the conversation.
	if (questionNum == 0) {

		if(input == "Yes" || input == "yes" || input == "y" || input == "Y") {
			answer = "Here are some benefits";
			answer2 = "Reduces stress, Controls anxiety, Promotes emotional health";
			waitTime = 5000;
			question = "Would you like to meditate now?"
			ph = "Yes or No";
		}
		else {
			answer = "Aww. I am sad.";
			waitTime = 2000;
			question = "Would you like to meditate?";
			ph = "Yes or No";
		}
	} else if (questionNum == 1) {
		if(input == "Yes" || input == "yes" || input == "y" || input == "Y") {
			answer = "Very well.";
			waitTime = 2000;
			question = "How long would you like to meditate?";
			ph = "1, 10, 20 (in mins)";
		}
		else {
			answer = "Aww. I am sad, again.";
			waitTime = 2000;
			question = "Would you like to read a joke?";

			ph = "Yes or No";
		}
	} else if (questionNum == 2) {

		if(input == "Yes" || input == "yes" || input == "y" || input == "Y") {
			answer = "Q: Why do mindfulness students love going to airports?";
			answer2 = "A: Because they always get a free body scan!";

			waitTime = 5000;
			question = "How long would you like to meditate now?";
			ph = "1, 10, 20 (in mins)";
		}
		else if(input == "1") {
			timerTime = 1;
		}
		else if(input == "10") {
			timerTime = 10;
		}
		else {
			answer = "Aww. I am sad, again.";
			waitTime = 2000;
			question = "Would you like to read another joke?";

			ph = "Yes or No";
		}
	} else if (questionNum == 3) {

		if(input == "Yes" || input == "yes" || input == "y" || input == "Y") {
			answer = "Q: Why could the mindfulness teacher not decide which chocolate to buy?";
			answer2 = "A: Because she was practising choiceless awareness.";
			waitTime = 5000;
			question = "How long would you like to meditate now?";
			ph = "1, 10, 20 (in mins)";
		}
		else if(input == "1") {
			timerTime = 1;
		}
		else if(input == "10") {
			timerTime = 10;
		}
		else {
			answer = "Aww. I have nothing more to say!";
			waitTime = 0;
			question = ""; 
		}
		// load next question
	} else {
		answer = 'I have nothing more to say!'; // output response
		waitTime = 0;
		question = '';
	}

	if(timerTime != -1) {
		startTimer(socket, timerTime);
	}
	else {
		/// We take the changed data and distribute it across the required objects.
		socket.emit('answer', answer, answer2);

		setTimeout(timedQuestion, waitTime, socket, question, ph);
	}
	return (questionNum + 1);
}

function startTimer(socket, dur) {
	setTimeout(timedAnswer, 5000, socket, "Close your eyes and focus on your breathing","Open your eyes when I beep.");
	for (i = 0; i<dur*60; i++ ) {
		setTimeout(timedAnswer, i*1000 + 5000 , socket, "Breath in, Breath out", (dur*60 - i) + "");
	}
	setTimeout(timedAnswer, 5000+dur*60000 , socket, "and we are done", "Bye");
	setTimeout(playMusic, 5000+dur*60000 , socket);

}

function playMusic(socket) {
	socket.emit('playMusic');
}

function timedColor(socket, color) {
	if (color != '') {
		socket.emit('changeBG', color);
	}
	else {
	}
}

function timedAnswer(socket, answer, answer2) {
	if (answer != '') {
		socket.emit('answer', answer, answer2);
	}
	else {
	}
}

function timedQuestion(socket, question, ph) {
	if (question != '') {
		socket.emit('question', question, ph);
		socket.emit('playMusic');
	} else {
		//console.log('No Question send!');
	}

}
//----------------------------------------------------------------------------//
