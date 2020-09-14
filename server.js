//NETWORK RELATED VARIABLES
var express = require('express');
var app = express();

//PORT HERE
var server = app.listen(3000);


app.enable('trust proxy')

app.use(express.static('public'));

var socket = require('socket.io');

var io = socket(server);

var playerSockets = [];
//NETWORK RELATED VARIABLES (END)

/*-------------------------------------------*/

//GAME RELATED FUNCTIONS AND VARIABLES
const canvasWidth = 800;
const canvasHeight = 600;
const PADDLE_HEIGHT = 100;
const PADDLE_THICKNESS = 10;
const initialBallSpeedY = 10;
const initialBallSpeedX = 10;
const maxScore = 3;
const framesPerSecond = 30;

var canvas;

var ballX;
var ballY;
var ballSpeedX;
var ballSpeedY;

var paddle1Y;
var paddle2Y;

var player1Score;
var player2Score;

var ballReseted = true;

var currentIndex = 0;

function resetScore(){
	player1Score = player2Score = 0;
}

//Right --> direction = 1;
//Left  --> direction = -1;
function resetBall(direction){
  	ballSpeedX = direction * initialBallSpeedX;
  	ballX = canvasWidth/2;
  	ballY = canvasHeight/2;
  	ballReseted = true;
  	ballSpeedY = initialBallSpeedY;
}

function moveEverything(){
	ballX = ballX + ballSpeedX;
	ballY = ballY + ballSpeedY;

	if(ballX <= PADDLE_THICKNESS && ballY >= paddle1Y && ballY <= paddle1Y + PADDLE_HEIGHT){
		ballSpeedX = -ballSpeedX;
		let deltaY = ballY - (paddle1Y + PADDLE_HEIGHT/2);
		ballSpeedY += 0.35 * deltaY;
	}

	if(ballX >= canvasWidth - PADDLE_THICKNESS && ballY >= paddle2Y && ballY <= paddle2Y + PADDLE_HEIGHT){
		ballSpeedX = -ballSpeedX;
		let deltaY = ballY - (paddle2Y + PADDLE_HEIGHT/2);
		ballSpeedY += 0.35 * deltaY;
	}
	if(ballX < 0){
		player2Score++;
		resetBall(-1);
	}
	else if (ballX > canvasWidth){
		player1Score++;
		resetBall(1);
	}

	if(ballY > canvasHeight){
		ballSpeedY = -ballSpeedY;
	}
	else if(ballY < 0){
		ballSpeedY = -ballSpeedY;
	}
}

function initializeGame(){
  ballSpeedX = initialBallSpeedX;
  ballSpeedY = initialBallSpeedY;

  ballX = canvasWidth/2;
  ballY = canvasHeight/2;

  player1Score = 0;
  player2Score = 0;

  paddle1Y = canvasHeight/2 + PADDLE_HEIGHT/2;
  paddle2Y = canvasHeight/2 + PADDLE_HEIGHT/2;


  var gameData = {
    ballX: ballX,
	  ballY: ballY,
	  player1Score: player1Score,
	  player2Score: player2Score,

    paddle1Y: paddle1Y,
    paddle2Y: paddle2Y,

    paddleHeight: PADDLE_HEIGHT,
    paddleThickness: PADDLE_THICKNESS
  }

  return gameData;
}

function drawText(text,leftX,topY,drawColor){
  io.sockets.emit('drawText', {
    message: text,
    x: leftX,
    y: topY,
    color: drawColor
  });
}
//GAME RELATED FUNCTIONS AND VARIABLES (END)

/*----------------------------------------------*/

io.on('connection', function(socket){
  console.log('new connection ' + socket.id);

  playerSockets[currentIndex++] = socket;

  setTimeout(() => {
    console.log("Waiting for new client to load in")
  }, 500);

  socket.emit('connected', currentIndex - 1)
  //playerSockets.push(socket.id);

  //initialize UI
  var dataPack = initializeGame();

  io.sockets.emit('initializeGame', dataPack);

  //USER INPUT

  socket.on('mouseMov', function(data){
    //var new1Y = data.paddle1Y;
    //var new2Y = data.paddle2Y;

    if(socket == playerSockets[0]){
      paddle1Y = data.y;
    }
    if(socket == playerSockets[1]){
      paddle2Y = data.y;
    }
  });

  socket.on('disconnecting', function(index){
    if(Number.isInteger(index)){
      if(index == 0){
        playerSockets.forEach(player => {
          player.emit('hostDisconnected');
          player.disconnect();
          player = null;
        });
      }
      console.log("Client with index: " + index + " disconnected");
      
    }

  });

  socket.on('mouseClick',function(){
    if(socket == playerSockets[0] || socket == playerSockets[1])
      ballReseted = false;
  })
  //USER INPUT (END)

  /*------------------------------------------------*/


  //Broadcast game info
});

//gameLoop
setInterval(function(){
  if(!ballReseted){
    moveEverything();
    io.sockets.emit('draw', {
      ballX: ballX,
      ballY: ballY,
      paddle1Y: paddle1Y,
      paddle2Y: paddle2Y,
      player1Score:player1Score,
      player2Score:player2Score
    });
  }
  else{
    drawText('Click left mouse button to start',canvasWidth/2 - 150, canvasHeight/2 - 100,'white');
    if(player1Score == maxScore){
      drawText('Player1 Wins',canvasWidth/2 - 150, canvasHeight/2 - 200,'green');
      //resetScore();
      initializeGame();
    }
    else if(player2Score == maxScore){
      drawText('Player2 Wins',canvasWidth/2 - 75, canvasHeight/2 - 200,'green');
      //resetScore();
      initializeGame();
    }
  }
}, 1000/framesPerSecond);
