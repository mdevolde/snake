// based upon code from https://www.educative.io/blog/javascript-snake-game-tutorial

const join_btn = document.querySelector("#join-game");
var game = null;
var websocket = null;
var send_need = true;

join_btn.addEventListener("click", function(e) {

    if (websocket != null) {
        return
    }
    websocket = new WebSocket(`${location.origin.replace("http", "ws")}/ws`);

    websocket.onopen = function() {
        console.log("connection opened");
    }

    websocket.onclose = function() {
        console.log("connection closed");
    }

    websocket.onmessage = function(e) {
        game = JSON.parse(e.data);
        if (game.game_over == true) {
            PrintGameOver();
            websocket.close();
            websocket = null;
        } else {
            send_need = true;
            clearCanvas();
            drawSnake();
            drawFood();
            displayScore();
        }
    }
});

$(document).keydown(function(e){
    if (websocket != null && send_need == true && (e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40)) {
        websocket.send(e.keyCode)
        send_need = false;
    }
});    

const snakeboard = document.getElementById("gameCanvas");
const DisplayFactor = 20;
snakeboard.width = 20 * DisplayFactor;
snakeboard.height = 20 * DisplayFactor;
const snakeboard_ctx = gameCanvas.getContext("2d");

function clearCanvas() {
    snakeboard_ctx.fillStyle = "white";
    snakeboard_ctx.strokestyle = 'black';
    snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
    snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

function drawSnake() {
    let snake = game.snake.body;
    snake.forEach(drawSnakePart)
}

function drawSnakePart(snakePart) {
    snakeboard_ctx.fillStyle = "green";
    snakeboard_ctx.strokestyle = "darkgreen";
    snakeboard_ctx.fillRect(snakePart.x * DisplayFactor, snakePart.y * DisplayFactor, DisplayFactor, DisplayFactor);
    snakeboard_ctx.strokeRect(snakePart.x * DisplayFactor, snakePart.y * DisplayFactor, DisplayFactor, DisplayFactor);
}

function drawFood() {
    let food = game.food;
    snakeboard_ctx.fillStyle = "red";
    snakeboard_ctx.strokestyle = "darkred";
    snakeboard_ctx.fillRect(food.x * DisplayFactor, food.y * DisplayFactor, DisplayFactor, DisplayFactor);
    snakeboard_ctx.strokeRect(food.x * DisplayFactor, food.y * DisplayFactor, DisplayFactor, DisplayFactor);
}

function displayScore() {
    snakeboard_ctx.fillStyle = "black";
    snakeboard_ctx.font = "20px Arial";
    snakeboard_ctx.fillText("Score: " + game.score, 10, 20);
}

function PrintGameOver() {
    snakeboard_ctx.fillStyle = "red";
    snakeboard_ctx.font = "30px Arial";
    snakeboard_ctx.fillText("Game Over", snakeboard.width / 3, snakeboard.height / 2);
}