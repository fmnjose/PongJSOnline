# PongJSOnline
Pong with 2-player online multiplayer.
Project made to practice nodeJs and javascript in general.

The server is coded using Express and Socket io.
To host the server, change the port at the beggining of "server.js" (default is 3000). You may need to forward a port, in case you haven't already done that.
The player connects through the host ip address.

If more than 2 players join the server, they will be spectators, and can't interact with the game. If the host leaves the game, everyone is disconnected.

There is no reconnecting mechanism. If any of the players leave, there is no way to take their places, even if you are a spectator.
