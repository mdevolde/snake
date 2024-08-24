import init, { 
    new_game, move_snake, update_game,
    get_map_width, get_map_height, get_up_key, get_down_key, get_left_key, get_right_key
 } from './out/snake.js';
async function run() {
    await init();

    var game = new_game();
    var game_started = false;
    let lastRenderTime = 0;

    const MAP_HEIGHT = get_map_height();
    const MAP_WIDTH = get_map_width();

    const LEFT_KEY = get_left_key();
    const RIGHT_KEY = get_right_key();
    const UP_KEY = get_up_key();
    const DOWN_KEY = get_down_key();

    const snakeboard = document.getElementById("gameCanvas");
    const DisplayFactor = 35;
    snakeboard.width = MAP_WIDTH * DisplayFactor;
    snakeboard.height = MAP_HEIGHT * DisplayFactor;
    const snakeboard_ctx = gameCanvas.getContext("2d");

    drawGameBoard();

    function drawGameBoard() {
        clearCanvas();
        drawSnake();
        drawFood();
        displayScore();
    }

    function gameLoop(currentTime) {
        const gameSpeed = Math.max(50, 200 - (game.score * 10));
        if (currentTime - lastRenderTime < gameSpeed) {
            requestAnimationFrame(gameLoop);
            return;
        }

        lastRenderTime = currentTime;
        if (!game.game_over) {
            drawGameBoard();
            game = update_game();
            setTimeout(() => {
                requestAnimationFrame(gameLoop);
            }, gameSpeed);
        } else {
            PrintGameOver();
            game_started = false;
            game = new_game();
        }
    }

    $(document).keydown(function(e){
        if (game_started == false) {
            game_started = true;
            gameLoop(0);
        } else if (game_started == true && (e.keyCode == UP_KEY || e.keyCode == DOWN_KEY 
            || e.keyCode == LEFT_KEY || e.keyCode == RIGHT_KEY)) {
            game = move_snake(e.keyCode);
        }
    });    

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

}
run();
