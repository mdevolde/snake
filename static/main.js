// Snake spritesheet: https://rembound.com/files/creating-a-snake-game-tutorial-with-html5/snake-graphics.png

import init, { 
    new_game, move_snake, update_game,
    get_map_width, get_map_height, get_up_key, get_down_key, get_left_key, get_right_key
 } from './out/snake.js';
async function run() {
    await init();

    const eatSound = new Audio('/static/sound/eat.wav');
    const gameOverSound = new Audio('/static/sound/game_over.wav');

    let game = new_game();
    let gameStarted = false;
    let lastRenderTime = 0;

    const scoreElement = document.getElementById('score');
    const gameOverElement = document.getElementById('game-over');

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
    const snakeboardCtx = gameCanvas.getContext("2d");

    drawGameBoard();

    function drawGameBoard() {
        clearCanvas();
        drawSnake();
        drawFood();
        displayScore();
    }

    function gameLoop(currentTime) {
        if (!gameStarted) return;
    
        const timeElapsed = currentTime - lastRenderTime;
        const gameSpeed = Math.max(100, 150 - (game.score * 5));
    
        if (timeElapsed > gameSpeed) {
            lastRenderTime = currentTime;
            if (!game.game_over) {
                const previous_score = game.score;
                game = update_game();
                if (game.score > previous_score) {
                    eatSound.currentTime = 0;
                    eatSound.play();
                }
                if (!game.game_over) {drawGameBoard();}
            } else {
                gameOverSound.play();
                gameOverElement.classList.remove('hidden');
                gameStarted = false;
                game = new_game();
            }
        }
    
        requestAnimationFrame(gameLoop);
    }

    $(document).keydown((e) => {
        if ([UP_KEY, DOWN_KEY, LEFT_KEY, RIGHT_KEY].includes(e.keyCode)) {
            if (gameStarted == true) {
                game = move_snake(e.keyCode);
            } else {
                gameStarted = true;
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
                    snakeboardCtx.fillStyle = '#FEC668'; // Couleur pour les cases claires
                } else {
                    snakeboardCtx.fillStyle = '#FAA63A'; // Couleur pour les cases foncées
                }
                snakeboardCtx.fillRect(col * DisplayFactor, row * DisplayFactor, DisplayFactor, DisplayFactor);
            }
        }
        snakeboardCtx.strokestyle = 'black';
        snakeboardCtx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
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
    
            snakeboardCtx.drawImage(
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
    
        snakeboardCtx.drawImage(
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
