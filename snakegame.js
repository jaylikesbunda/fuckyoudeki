const SnakeGame = (() => {
    let game, score, snake, food, direction, touchStartX, touchStartY, highScore;
    let canvas, ctx, box = 20;
    let directionQueue = [];
    const initialGameSpeed = 170;
    let gameSpeed = initialGameSpeed;
    let lastFrameTime = 0;
    const swipeThreshold = 10; // Adjust this value to change sensitivity (lower is more sensitive, higher is less sensitive)
    let animationFrameId; // Declare animationFrameId here

    document.addEventListener('DOMContentLoaded', () => {
        highScore = localStorage.getItem('highScore') || 0;
        canvas = document.getElementById('snakeCanvas');
        if (!canvas) {
            console.error("Canvas element not found!");
            return;
        }
        ctx = canvas.getContext('2d');
        setupEventListeners();
        showStartScreen();
    });

    function setupEventListeners() {
        document.addEventListener('keydown', handleKeydown);
        canvas.addEventListener('touchstart', handleTouchStart, false);
        canvas.addEventListener('touchmove', handleTouchMove, false);
        document.getElementById('startButton').addEventListener('click', startGame);
        document.getElementById('restartButton').addEventListener('click', restartGame);
        window.addEventListener('resize', resizeSnakeCanvas);
    }

    function initSnakeGame() {
        snake = [{ x: 10 * box, y: 10 * box }];
        food = generateFood();
        score = 0;
        direction = 'RIGHT';
        gameSpeed = initialGameSpeed;
        directionQueue = [];

        resizeSnakeCanvas();

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        lastFrameTime = performance.now();
        draw(); // Start the drawing loop
    }

    function startGame() {
        hideStartScreen();
        hideGameOverScreen(); // Ensure the game over screen is hidden when starting the game
        initSnakeGame();
    }

    function restartGame() {
        hideGameOverScreen();
        initSnakeGame();
    }

    function resizeSnakeCanvas() {
        const windowElement = document.getElementById('snakeWindow');
        if (!windowElement) {
            console.error("Snake window element not found!");
            return;
        }

        const width = windowElement.clientWidth;
        const height = windowElement.clientHeight - windowElement.querySelector('.title-bar').offsetHeight;

        canvas.width = width;
        canvas.height = height;

        food = generateFood();

        for (let i = 0; i < snake.length; i++) {
            snake[i].x = Math.min(snake[i].x, canvas.width - box);
            snake[i].y = Math.min(snake[i].y, canvas.height - box);
        }
    }

    function handleKeydown(event) {
        const keyDirection = {
            37: 'LEFT',
            38: 'UP',
            39: 'RIGHT',
            40: 'DOWN'
        };

        if (keyDirection[event.keyCode] && isValidDirectionChange(keyDirection[event.keyCode])) {
            queueDirection(keyDirection[event.keyCode]);
        }
    }

    function isValidDirectionChange(newDirection) {
        const invalidChanges = {
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT',
            'UP': 'DOWN',
            'DOWN': 'UP'
        };
        return direction !== invalidChanges[newDirection];
    }

    function queueDirection(newDirection) {
        if (directionQueue.length < 2) {
            directionQueue.push(newDirection);
        }
    }

    function handleTouchStart(evt) {
        if (evt.touches.length === 1) {
            const touch = evt.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }
    }

    let lastTouchTime = 0;

    function handleTouchMove(evt) {
        const currentTime = performance.now();
        if (currentTime - lastTouchTime < 50) return; // Throttle to every 50ms

        lastTouchTime = currentTime;
        if (evt.touches.length === 1) {
            const touch = evt.touches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            let newDirection = null;
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > swipeThreshold) {
                    newDirection = diffX > 0 ? 'RIGHT' : 'LEFT';
                }
            } else {
                if (Math.abs(diffY) > swipeThreshold) {
                    newDirection = diffY > 0 ? 'DOWN' : 'UP';
                }
            }

            if (newDirection && isValidDirectionChange(newDirection)) {
                queueDirection(newDirection);
                touchStartX = touchEndX;
                touchStartY = touchEndY;
            }
        }
    }

    function draw() {
        const currentFrameTime = performance.now();
        const deltaTime = currentFrameTime - lastFrameTime;

        if (deltaTime > gameSpeed) {
            lastFrameTime = currentFrameTime - (deltaTime % gameSpeed);

            updateSnakePosition(); // Ensure the update function is called with correct timing

            // Clear the canvas and set the background to black
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear only the necessary area
            ctx.fillStyle = '#000'; // Black background color
            ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with black

            drawSnake(); // Draw the entire snake
            drawFood(); // Draw the food
            drawScore(); // Draw the score

            if (isGameOver()) {
                handleGameOver(); // Handle game over logic
                return;
            }
        }

        animationFrameId = requestAnimationFrame(draw); // Continue the animation loop and store the frame ID
    }

    function drawSnake() {
        if (snake.length === 0) return;

        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = box;
        ctx.lineCap = 'round'; // Rounded ends for the snake
        ctx.lineJoin = 'round'; // Rounded joints for the snake

        // Draw the snake body
        ctx.beginPath();
        ctx.moveTo(snake[0].x + box / 2, snake[0].y + box / 2);
        for (let i = 1; i < snake.length; i++) {
            ctx.lineTo(snake[i].x + box / 2, snake[i].y + box / 2);
        }
        ctx.stroke();

        // Draw the head with some detail
        drawSnakeHead(snake[0]);
    }

    function drawSnakeHead(head) {
        const headSize = box; // Head size matches the body
        const headX = head.x + box / 2;
        const headY = head.y + box / 2;

        // Draw head as a circle
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(headX, headY, headSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw eyes
        drawSnakeHeadDetails(headX, headY, headSize);
    }

    function drawSnakeHeadDetails(headX, headY, headSize) {
        const eyeSize = headSize / 10;
        const eyeOffsetX = headSize / 5;
        const eyeOffsetY = headSize / 6;

        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX - eyeOffsetX, headY - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + eyeOffsetX, headY - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFood() {
        // Draw the apple body
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw the apple stem
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(food.x + box / 2 - 2, food.y + box / 2 - box / 2 - 2);
        ctx.lineTo(food.x + box / 2 + 2, food.y + box / 2 - box / 2 - 2);
        ctx.lineTo(food.x + box / 2 + 2, food.y + box / 2 - box / 2 + 4);
        ctx.lineTo(food.x + box / 2 - 2, food.y + box / 2 - box / 2 + 4);
        ctx.closePath();
        ctx.fill();

        // Draw the apple leaf
        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.moveTo(food.x + box / 2, food.y + box / 2 - box / 2);
        ctx.quadraticCurveTo(food.x + box / 2 + 8, food.y + box / 2 - box / 2 - 8, food.x + box / 2 + 4, food.y + box / 2 - box / 2 + 2);
        ctx.quadraticCurveTo(food.x + box / 2, food.y + box / 2 - box / 2 + 4, food.x + box / 2, food.y + box / 2 - box / 2);
        ctx.closePath();
        ctx.fill();
    }

    function updateSnakePosition() {
        if (directionQueue.length) {
            direction = directionQueue.shift();
        }

        let newHeadX = snake[0].x;
        let newHeadY = snake[0].y;

        switch (direction) {
            case 'LEFT': newHeadX -= box; break;
            case 'UP': newHeadY -= box; break;
            case 'RIGHT': newHeadX += box; break;
            case 'DOWN': newHeadY += box; break;
        }

        const newHead = { x: newHeadX, y: newHeadY };
        snake.unshift(newHead); // Add new head based on direction

        if (!hasSnakeEatenFood()) {
            snake.pop(); // Remove the tail only if no food has been eaten
        } else {
            handleFoodConsumption(); // Handle food consumption if the food is eaten
        }
    }

    function hasSnakeEatenFood() {
        return snake[0].x === food.x && snake[0].y === food.y;
    }

    function handleFoodConsumption() {
        score++;
        food = generateFood();

        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }

        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
        }

        // const eatSound = new Audio('https://audio.jukehost.co.uk/sOzTYVOu0JLq91FEIJvyHnXhzjeInoGp');
        // eatSound.volume = 0.2; 
        // eatSound.play();
    }

    function isGameOver() {
        const snakeHead = snake[0];
        return (
            snakeHead.x < 0 || snakeHead.x >= canvas.width ||
            snakeHead.y < 0 || snakeHead.y >= canvas.height ||
            snakeCollision(snakeHead)
        );
    }

    function snakeCollision(head) {
        return snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
    }

    function handleGameOver() {
        cancelAnimationFrame(animationFrameId);
        showGameOverScreen();
    }

    function drawScore() {
        // Set text properties
        ctx.font = 'bold 20px Arial'; // Bold font for better visibility
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left'; // Align text to the left
        ctx.textBaseline = 'top'; // Align text vertically to the top

        // Adding shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'; // Black shadow with some transparency
        ctx.shadowOffsetX = 2; // Horizontal shadow offset
        ctx.shadowOffsetY = 2; // Vertical shadow offset
        ctx.shadowBlur = 3; // Shadow blur amount

        // Drawing current score
        ctx.fillText(`Score: ${score}`, 2 * box, 1.6 * box);

        // Drawing high score
        ctx.fillText(`High: ${highScore}`, 8 * box, 1.6 * box);

        // Clearing shadow for other elements not to get affected
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
    }

    function generateFood() {
        let foodPosition;
        do {
            const maxColumns = Math.floor(canvas.width / box);
            const maxRows = Math.floor(canvas.height / box);
            foodPosition = {
                x: Math.floor(Math.random() * maxColumns) * box,
                y: Math.floor(Math.random() * maxRows) * box
            };
        } while (snake.some(segment => segment.x === foodPosition.x && segment.y === foodPosition.y));
        return foodPosition;
    }

    function showStartScreen() {
        document.getElementById('startScreen').style.display = 'flex';
    }

    function hideStartScreen() {
        document.getElementById('startScreen').style.display = 'none';
    }

    function showGameOverScreen() {
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    function hideGameOverScreen() {
        document.getElementById('gameOverScreen').style.display = 'none';
    }

    return {
        startGame,
        restartGame,
        resizeSnakeCanvas
    };
})();

window.SnakeGame = SnakeGame; // Make sure SnakeGame is available globally

document.addEventListener('DOMContentLoaded', SnakeGame.startGame);
