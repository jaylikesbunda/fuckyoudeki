import { submitSnakeScore } from './firebaseInit.js';
console.log('Initializing SnakeGame...');

const SnakeGame = (() => {
    let game, score, snake, food, direction, touchStartX, touchStartY, highScore;
    let canvas, ctx, box = 20;
    let directionQueue = [];
    const initialGameSpeed = 170;
    let gameSpeed = initialGameSpeed;
    let lastFrameTime = 0;
    const speedFactor = 6;
    let animationFrameId;
    let targetX, targetY;
    const swipeThreshold = 10;

    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded event fired in snakeGame.js');
        highScore = localStorage.getItem('highScore') || 0;
        console.log('High score loaded:', highScore);
        canvas = document.getElementById('snakeCanvas');
        if (!canvas) {
            console.error("Canvas element not found!");
            return;
        }
        ctx = canvas.getContext('2d');
        setupEventListeners();
        showStartScreen();
        console.log('SnakeGame initialized:', window.SnakeGame);
    });

    function setupEventListeners() {
        console.log('Setting up event listeners');
        document.addEventListener('keydown', handleKeydown);
        canvas.addEventListener('touchstart', handleTouchStart, false);
        canvas.addEventListener('touchmove', handleTouchMove, false);
        document.getElementById('startButton').addEventListener('click', startGame);
        document.getElementById('restartButton').addEventListener('click', restartGame);
        window.addEventListener('resize', resizeSnakeCanvas);
    }

    function initSnakeGame() {
        console.log('Initializing SnakeGame');
        snake = [{ x: 10 * box, y: 10 * box }];
        food = generateFood();
        score = 0;
        direction = 'RIGHT';
        gameSpeed = initialGameSpeed;
        directionQueue = [];

        resizeSnakeCanvas();

        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        lastFrameTime = performance.now();
        draw();
    }

    function startGame() {
        console.log('Starting game');
        hideStartScreen();
        initSnakeGame();
    }

    function restartGame() {
        console.log('Restarting game');
        hideGameOverScreen();
        initSnakeGame();
    }

    function resizeSnakeCanvas() {
        console.log('Resizing snake canvas');
        const windowElement = document.getElementById('snakeWindow');
        if (!windowElement) {
            console.error("Snake window element not found!");
            return;
        }

        const width = windowElement.clientWidth;
        const height = windowElement.clientHeight - windowElement.querySelector('.title-bar').offsetHeight;
        console.log(`Resized canvas to: ${width}x${height}`);

        canvas.width = width;
        canvas.height = height;

        food = generateFood();

        for (let i = 0; i < snake.length; i++) {
            snake[i].x = Math.min(snake[i].x, canvas.width - box);
            snake[i].y = Math.min(snake[i].y, canvas.height - box);
        }
    }

    function handleKeydown(event) {
        console.log('Keydown event:', event.keyCode);
        const keyDirection = {
            37: 'LEFT',
            38: 'UP',
            39: 'RIGHT',
            40: 'DOWN'
        };

        if (keyDirection[event.keyCode] && isValidDirectionChange(keyDirection[event.keyCode])) {
            console.log('Valid direction change:', keyDirection[event.keyCode]);
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
            console.log('Queuing direction:', newDirection);
            directionQueue.push(newDirection);
        }
    }

    function handleTouchStart(evt) {
        if (evt.touches.length === 1) {
            const touch = evt.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            console.log('Touch start:', touchStartX, touchStartY);
        }
    }

    let lastTouchTime = 0;

    function handleTouchMove(evt) {
        const currentTime = performance.now();
        if (currentTime - lastTouchTime < 50) return;

        lastTouchTime = currentTime;
        if (evt.touches.length === 1) {
            const touch = evt.touches[0];
            const touchEndX = touch.clientX;
            const touchEndY = touch.clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            console.log('Touch move:', diffX, diffY);

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
                console.log('Valid swipe direction:', newDirection);
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

            updateSnakePosition();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawSnake();
            drawFood();
            drawScore();

            if (isGameOver()) {
                handleGameOver();
                return;
            }
        }

        requestAnimationFrame(draw);
    }

    function drawSnake() {
        if (snake.length === 0) return;

        ctx.strokeStyle = '#0f0';
        ctx.lineWidth = box;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(snake[0].x + box / 2, snake[0].y + box / 2);
        for (let i = 1; i < snake.length; i++) {
            ctx.lineTo(snake[i].x + box / 2, snake[i].y + box / 2);
        }
        ctx.stroke();

        drawSnakeHead(snake[0]);
    }

    function drawSnakeHead(head) {
        const headSize = box;
        const headX = head.x + box / 2;
        const headY = head.y + box / 2;

        ctx.fillStyle = '#0f0';
        ctx.beginPath();
        ctx.arc(headX, headY, headSize / 2, 0, Math.PI * 2);
        ctx.fill();

        drawSnakeHeadDetails(headX, headY, headSize);
    }

    function drawSnakeHeadDetails(headX, headY, headSize) {
        const eyeSize = headSize / 10;
        const eyeOffsetX = headSize / 5;
        const eyeOffsetY = headSize / 6;

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(headX - eyeOffsetX, headY - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headX + eyeOffsetX, headY - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawFood() {
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(food.x + box / 2 - 2, food.y + box / 2 - box / 2 - 2);
        ctx.lineTo(food.x + box / 2 + 2, food.y + box / 2 - box / 2 - 2);
        ctx.lineTo(food.x + box / 2 + 2, food.y + box / 2 - box / 2 + 4);
        ctx.lineTo(food.x + box / 2 - 2, food.y + box / 2 - box / 2 + 4);
        ctx.closePath();
        ctx.fill();

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
        snake.unshift(newHead);

        if (!hasSnakeEatenFood()) {
            snake.pop();
        } else {
            handleFoodConsumption();
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
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 3;

        ctx.fillText(`Score: ${score}`, 2 * box, 1.6 * box);
        ctx.fillText(`High: ${highScore}`, 8 * box, 1.6 * box);

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

        const submitButton = document.getElementById('submitScoreButton');
        submitButton.onclick = () => {
            const usernameInput = document.getElementById('usernameInput');
            const username = usernameInput.value.trim().substring(0, 4);
            if (username && score) {
                submitSnakeScore(username, score).then(() => {
                    alert('Score submitted successfully!');
                }).catch((error) => {
                    alert('Error submitting score: ' + error);
                });
            } else {
                alert('Please enter a valid username (4 letters max).');
            }
        };
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

window.SnakeGame = SnakeGame;
console.log('SnakeGame defined:', window.SnakeGame);