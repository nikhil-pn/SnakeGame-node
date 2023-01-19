const BACKGROUND_COLOR = "#659DBD";
const PLAYER_ONE_COLOUR = "#8D8741";
const PLAYER_TWO_COLOUR = "#FC4445";
const FOOD_COLOUR = "#FBEEC1";

const socket = io("http://localhost:3001", {
  extraHeaders: {
    "Access-Control-Allow-Orgin": "http://localhost:8080/",
  },
});

socket.on("init", handleInit);
socket.on("gameStart", handleGameStart);
socket.on("gameOver", handlegameOver);
socket.on("unknowCode", handleunknowCode);
socket.on("tooManyPlayer", handletooManyPlayer);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
  socket.emit("newGame");
  startGame();
}

function joinGame() {
  const code = gameCodeInput.ariaValueMax;
  socket.emit("joinGame", code);
  startGame();
}

let canvas, canvasContext;

let playerNumber;
let gameActive = false;

function startGame() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById("canvas");
  canvasContext = canvas.getContext("2d");

  canvas.width = canvas.height = 600;
  canvasContext.fillStyle = BACKGROUND_COLOR;
  canvasContext.fillRect(0, 0, canvas.width, canvas, height);

  document.addEventListener("keydown", keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit("keydown", e.keyCode);
}

function paintGame(state) {
  canvasContext.fillStyle = BACKGROUND_COLOR;
  canvasContext.fillRect(0, 0, canvas.width, canvas, height);

  const food = state.food;
  const grideSize = state.grideSize;
  const size = canvas.width / grideSize;

  canvasContext.fillStyle = FOOD_COLOUR;
  canvasContext.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, PLAYER_ONE_COLOUR);
  paintPlayer(state.players[1], size, PLAYER_TWO_COLOUR);
}

function paintPlayer(playerState, size, color) {
  const snake = playerState.snake;
  canvasContext.fillStyle = color;

  for (let cell of snake) {
    canvas.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(num) {
  playerNumber = num;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handlegameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);
  gameActive = false;

  if (data.winner === playerNumber) {
    alert("You win");
  } else {
    alert("You Lost");
  }
}
