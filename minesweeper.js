document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

function closeWindow() {
    document.getElementById('minesweeperWindow').style.display = 'none';
}

function initializeGame() {
    const gameBoard = document.getElementById('gameBoard');
    const gameStatus = document.getElementById('gameStatus');
    gameBoard.innerHTML = '';
    gameStatus.innerHTML = 'Good luck!';
    
    const boardSize = 8;
    const mineCount = 10;
    let cells = [];
    let minePositions = [];

    // Initialize cells
    for (let row = 0; row < boardSize; row++) {
        cells[row] = [];
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => revealCell(row, col));
            gameBoard.appendChild(cell);
            cells[row][col] = cell;
        }
    }

    // Place mines
    while (minePositions.length < mineCount) {
        const row = Math.floor(Math.random() * boardSize);
        const col = Math.floor(Math.random() * boardSize);
        const position = `${row},${col}`;
        if (!minePositions.includes(position)) {
            minePositions.push(position);
            cells[row][col].dataset.mine = 'true';
        }
    }

    function revealCell(row, col) {
        const cell = cells[row][col];
        if (cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');

        if (cell.dataset.mine === 'true') {
            cell.classList.add('mine');
            gameStatus.innerHTML = 'Game Over!';
            revealMines();
            return;
        }

        const mineCount = countAdjacentMines(row, col);
        if (mineCount > 0) {
            cell.innerText = mineCount;
        } else {
            revealAdjacentCells(row, col);
        }
    }

    function countAdjacentMines(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        return directions.reduce((count, [dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize && cells[newRow][newCol].dataset.mine === 'true') {
                return count + 1;
            }
            return count;
        }, 0);
    }

    function revealAdjacentCells(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        directions.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < boardSize && newCol >= 0 && newCol < boardSize) {
                revealCell(newRow, newCol);
            }
        });
    }

    function revealMines() {
        cells.forEach(row => {
            row.forEach(cell => {
                if (cell.dataset.mine === 'true') {
                    cell.classList.add('mine');
                }
                cell.classList.add('revealed');
            });
        });
    }
}
