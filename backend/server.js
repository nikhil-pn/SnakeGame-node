const express = require("express");
const app = express();
const server = require("http").Server(app);

const io = require("socket.io")(server);
const { v4: uuidv4 } = require("uuid");

const PORT = 3001;

const { initializeGame, gameLoop, getUpdatedVelocity } = require("./game");

const { FRAME_RATE } = 10;
const GRID_SIZE = 30;

const globalState = {};
const clientRooms = {};

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(globalState[roomName]);

    if (!winner) {
      emitGameState(roomName, globalState[roomName]);
    }
    if (winner) {
      emitGameOver(roomName, winner);
      globalState[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}
io.onconnection("connection", (client) => {
  client.on("keydown", handleKeyDown);
  client.on("newGame", handlenewGame);
  client.on("joinGame", handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numberofPlayer = 0;

    if (allUsers) {
      numberofPlayer = Object.keys(allUsers).length;
    }

    if (numberofPlayer === 0) {
      client.emit("unknowCode");
    }else if (numberofPlayer >1 ){
        client.emit('tooManyPlayers')
        return
    }
  }
});
