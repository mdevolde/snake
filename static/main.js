// Snake spritesheet: https://rembound.com/files/creating-a-snake-game-tutorial-with-html5/snake-graphics.png

import init, { 
    new_game, move_snake, update_game,
    get_map_width, get_map_height, get_up_key, get_down_key, get_left_key, get_right_key
 } from './out/snake.js';
async function run() {
    await init();

    var game = new_game();
    var game_started = false;
    let lastRenderTime = 0;

    var scoreElement = document.getElementById('score');
    var gameOverElement = document.getElementById('game-over');

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
            gameOverElement.classList.remove('hidden');
            game_started = false;
            game = new_game();
        }
    }

    $(document).keydown(function(e){
        if (e.keyCode == UP_KEY || e.keyCode == DOWN_KEY || e.keyCode == LEFT_KEY || e.keyCode == RIGHT_KEY) {
            if (game_started == true) {
                game = move_snake(e.keyCode);
            } else {
                game_started = true;
                if (!gameOverElement.classList.contains('hidden')) {
                    gameOverElement.classList.add('hidden');
                }
                gameLoop(0);
            }
        }
    });    

    function clearCanvas() {
        const rows = snakeboard.height / DisplayFactor;
        const cols = snakeboard.width / DisplayFactor;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if ((row + col) % 2 === 0) {
                    snakeboard_ctx.fillStyle = '#FEC668'; // Couleur pour les cases claires
                } else {
                    snakeboard_ctx.fillStyle = '#FAA63A'; // Couleur pour les cases foncées
                }
                snakeboard_ctx.fillRect(col * DisplayFactor, row * DisplayFactor, DisplayFactor, DisplayFactor);
            }
        }
        snakeboard_ctx.strokestyle = 'black';
        snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
    }

    function drawSnake() {
        let snake = game.snake.body;
        snake.forEach((segment, index) => {
            let segx = segment.x;
            let segy = segment.y;
            let tilex = segx * DisplayFactor;
            let tiley = segy * DisplayFactor;
    
            // Init positions on the sprite sheet
            let tx = 0;
            let ty = 0;
    
            // Determine correct image for the head
            if (index === 0) {
                let nseg = snake[index + 1]; // Next segment
                if (segy < nseg.y) {
                    // Top
                    tx = 3; ty = 0;
                } else if (segx > nseg.x) {
                    // Right
                    tx = 4; ty = 0;
                } else if (segy > nseg.y) {
                    // Bottom
                    tx = 4; ty = 1;
                } else if (segx < nseg.x) {
                    // Left
                    tx = 3; ty = 1;
                }
            // Determine correct image for the tail
            } else if (index === snake.length - 1) {
                let pseg = snake[index - 1]; // Previous segment
                if (pseg.y < segy) {
                    // Top
                    tx = 3; ty = 2;
                } else if (pseg.x > segx) {
                    // Right
                    tx = 4; ty = 2;
                } else if (pseg.y > segy) {
                    // Bottom
                    tx = 4; ty = 3;
                } else if (pseg.x < segx) {
                    // Left
                    tx = 3; ty = 3;
                }
            // Determine correct image for the body
            } else {
                let pseg = snake[index - 1]; // Previous segment
                let nseg = snake[index + 1]; // Next segment
                if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                    // Horizontal left-right
                    tx = 1; ty = 0;
                } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                    // Angle left-bottom
                    tx = 2; ty = 0;
                } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                    // Vertical top-bottom
                    tx = 2; ty = 1;
                } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                    // Angle top-left
                    tx = 2; ty = 2;
                } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                    // Angle right-top
                    tx = 0; ty = 1;
                } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                    // Angle bottom-right
                    tx = 0; ty = 0;
                }
            }
    
            snakeboard_ctx.drawImage(
                tileimage,
                tx * 64, ty * 64, // Coordinates in the sprite
                64, 64, // Size of the cut
                tilex, tiley, // Position on the canvas
                DisplayFactor, DisplayFactor // Size on the canvas
            );
        });
    }

    function drawFood() {
        let food = game.food;
    
        const appleX = 0 * 64; // X position of the apple in the sprite
        const appleY = 3 * 64; // Y position of the apple in the sprite
    
        snakeboard_ctx.drawImage(
            tileimage, 
            appleX, appleY, // Coordinates in the sprite
            64, 64, // Size of the cut
            food.x * DisplayFactor, food.y * DisplayFactor, // Position on the canvas
            DisplayFactor, DisplayFactor // Size on the canvas
        );
    }

    function displayScore() {
        scoreElement.textContent = game.score;
    }
}

let tileimage = new Image();
tileimage.src = '/static/img/snake-sprites.png';
tileimage.onload = function() {
    run();
};
