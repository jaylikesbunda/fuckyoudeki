const SnakeGame = (() => {
    let game, score, snake, food, direction, touchStartX, touchStartY, highScore;
    let canvas, ctx, box = 20;
    let directionQueue = [];
    const initialGameSpeed = 140;
    let gameSpeed = initialGameSpeed;

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
        console.log('DOMContentLoaded: Start screen shown');
    });

    function setupEventListeners() {
        document.addEventListener('keydown', handleKeydown);
        canvas.addEventListener('touchstart', handleTouchStart, false);
        canvas.addEventListener('touchmove', handleTouchMove, false);
        document.getElementById('startButton').addEventListener('click', startGame);
        document.getElementById('restartButton').addEventListener('click', restartGame);
        window.addEventListener('resize', resizeSnakeCanvas);
        console.log('Event listeners set up');
    }

    function initSnakeGame() {
        snake = [{ x: 10 * box, y: 10 * box }];
        food = generateFood();
        score = 0;
        direction = 'RIGHT';
        gameSpeed = initialGameSpeed;
        directionQueue = [];

        resizeSnakeCanvas();
        console.log('Snake game initialized', { snake, food, score, direction, gameSpeed });

        if (game) clearInterval(game);
        game = setInterval(draw, gameSpeed);
    }

    function startGame() {
        hideStartScreen();
        initSnakeGame();
        console.log('Game started');
    }

    function restartGame() {
        hideGameOverScreen();
        initSnakeGame();
        console.log('Game restarted');
    }

    function resizeSnakeCanvas() {
        const windowElement = document.getElementById('snakeWindow');
        if (!windowElement) {
            console.error("Snake window element not found!");
            return;
        }

        const width = windowElement.clientWidth;
        const height = windowElement.clientHeight - windowElement.querySelector('.title-bar').offsetHeight;

        console.log(`Resizing snake canvas to: ${width}x${height}`); // Debug log

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
            console.log('Direction changed', direction);
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
        const firstTouch = evt.touches[0];
        touchStartX = firstTouch.clientX;
        touchStartY = firstTouch.clientY;
    }

    function handleTouchMove(evt) {
        if (!touchStartX || !touchStartY) return;

        const touchEndX = evt.touches[0].clientX;
        const touchEndY = evt.touches[0].clientY;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        let newDirection;
        if (Math.abs(diffX) > Math.abs(diffY)) {
            newDirection = diffX > 0 ? 'LEFT' : 'RIGHT';
        } else {
            newDirection = diffY > 0 ? 'UP' : 'DOWN';
        }

        if (isValidDirectionChange(newDirection)) {
            queueDirection(newDirection);
        }

        touchStartX = null;
        touchStartY = null;
        console.log('Touch direction changed', direction);
    }

    function draw() {
        console.log('Drawing game frame'); // Debug log
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawSnake();
        drawFood();
        updateSnakePosition();

        if (hasSnakeEatenFood()) {
            handleFoodConsumption();
        } else {
            snake.pop();
        }

        if (isGameOver()) {
            handleGameOver();
        } else {
            drawScore();
        }
    }

    function drawSnake() {
        for (let i = 0; i < snake.length; i++) {
            ctx.fillStyle = i === 0 ? '#0f0' : '#fff';
            ctx.fillRect(snake[i].x, snake[i].y, box, box);
            ctx.strokeStyle = '#f00';
            ctx.lineWidth = 1;
            ctx.strokeRect(snake[i].x, snake[i].y, box, box);
        }
    }

    function drawFood() {
        ctx.fillStyle = '#f00';
        ctx.fillRect(food.x, food.y, box, box);
    }

    function updateSnakePosition() {
        if (directionQueue.length) {
            direction = directionQueue.shift();
        }

        let snakeX = snake[0].x;
        let snakeY = snake[0].y;

        switch (direction) {
            case 'LEFT': snakeX -= box; break;
            case 'UP': snakeY -= box; break;
            case 'RIGHT': snakeX += box; break;
            case 'DOWN': snakeY += box; break;
        }

        const newHead = { x: snakeX, y: snakeY };
        snake.unshift(newHead);
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
            clearInterval(game);
            game = setInterval(draw, gameSpeed);
        }

        console.log('Food consumed', { score, food, gameSpeed });
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
        clearInterval(game);
        showGameOverScreen();
        console.log('Game over', { score });
    }

    function drawScore() {
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 2 * box, 1.6 * box);
        ctx.fillText(`High: ${highScore}`, 8 * box, 1.6 * box);
    }

    function generateFood() {
        const maxColumns = Math.floor(canvas.width / box);
        const maxRows = Math.floor(canvas.height / box);
        return {
            x: Math.floor(Math.random() * maxColumns) * box,
            y: Math.floor(Math.random() * maxRows) * box
        };
    }

    function showStartScreen() {
        document.getElementById('startScreen').style.display = 'flex';
        console.log('Showing start screen');
    }

    function hideStartScreen() {
        document.getElementById('startScreen').style.display = 'none';
    }

    function showGameOverScreen() {
        document.getElementById('finalScore').innerText = score;
        document.getElementById('gameOverScreen').style.display = 'flex';
        console.log('Showing game over screen');
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

document.addEventListener('DOMContentLoaded', SnakeGame.startGame);
