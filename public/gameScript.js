var socket;

var canvas;
var canvasContext;

var paddleHeight;
var paddleThickness;


var ballX;
var ballY;

var paddle1Y = 250;
var paddle2Y = 250;

var ballReseted = true;

var player1Score;
var player2Score;

var playerIndex;

const COMPUTER_SPEED = 10;
const defaultFont = '20px  Verdana';

function calculateMousePos(evt){
	var rect = canvas.getBoundingClientRect();
	var root = document.documentElement;
	var mouseX = evt.clientX - rect.left - root.scrollLeft;
	var mouseY = evt.clientY - rect.top - root.scrollTop;

	var data = {
		x: mouseX,
		y: mouseY,
		paddle1Y,
		paddle2Y
	};

	socket.emit('mouseMov', data);
}

function mouseDownHandler(event){
		socket.emit('mouseClick');
}

var disconnected = false;

window.onunload = function(){
	if(!disconnected){
		disconnected = true;
		socket.emit('disconnecting', playerIndex);
		socket.disconnect();
	}
	//socket.disconnect();
}

window.onload = function(){
	canvas = document.getElementById("gameCanvas");
	canvasContext = canvas.getContext('2d');

	socket = io();

	socket.on('connected', function(index){
		playerIndex = index;
		console.log(playerIndex);
	});

	socket.on('hostDisconnected', function(){
		document.getElementById("hostDisconnText").innerHTML = "Host has Disconnected";
	});


	socket.on('initializeGame', function(data){
			ballX = data.ballX;
			ballY = data.ballY;

			player1Score = data.player1Score;
			player2Score = data.player2Score;

			paddle1Y = data.paddle1Y;
			paddle2Y = data.paddle2Y;

			paddleHeight = data.paddleHeight;
			paddleThickness = data.paddleThickness;

			drawEverything();
	});

	socket.on('draw',function (data){
		ballX = data.ballX;
		ballY = data.ballY;

		player1Score = data.player1Score;
		player2Score = data.player2Score;

		paddle1Y = data.paddle1Y;
		paddle2Y = data.paddle2Y;

		drawEverything();
	});

	socket.on('drawText', function(args){
		drawText(args.message,defaultFont,args.x,args.y,args.color);
	})

	canvas.addEventListener('mousedown', mouseDownHandler);

	canvas.addEventListener('mousemove', calculateMousePos);

}

function computerMovement(){
	if(paddle2Y + paddleHeight/2 < ballY - 35){
		paddle2Y += COMPUTER_SPEED;
	}
	else if(paddle2Y + paddleHeight/2 > ballY + 35){
		paddle2Y -= COMPUTER_SPEED;
	}
}

function moveEverything(){

}

function drawEverything(){
	//Fills background with black
	colorRect(0,0,canvas.width,canvas.height,'black');

	//Draws left (player) paddle
	colorRect(0,paddle1Y,paddleThickness,
				paddleHeight,'white');

	//Draws right (computer) paddle
	colorRect(canvas.width - paddleThickness,
				paddle2Y,paddleThickness,paddleHeight,'white');

	//Draws ball
	colorCircle(ballX,ballY,10,'white');

	drawNet();
	drawText(player1Score,defaultFont,100,50,'white');
	drawText(player2Score,defaultFont,canvas.width - 100,50,'white');
}

function drawText(text,font,leftX,topY,drawColor){
		canvasContext.fillStyle = drawColor;
		canvasContext.font = font;
		canvasContext.fillText(text,leftX,topY);
}

function drawNet(){
	for(let i = 0; i<canvas.height; i+=40){
		colorRect(canvas.width/2,i,2,20,'white');
	}
}

function colorCircle(centerX,centerY,radius,drawColor){
	canvasContext.fillStyle = drawColor;
	canvasContext.beginPath();
	canvasContext.arc(centerX,centerY,radius,0,2*Math.PI,true);
	canvasContext.fill();
}

function colorRect(leftX,topY,width,height,drawColor){
	canvasContext.fillStyle = drawColor;
	canvasContext.fillRect(leftX,topY,width,height);
}
