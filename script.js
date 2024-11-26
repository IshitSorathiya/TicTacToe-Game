const setupScreen = document.getElementById("setup-screen");
const gameScreen = document.getElementById("game-screen");
const gridSizeInput = document.getElementById("grid-size");
const winStreakInput = document.getElementById("win-streak");
const modeSelect = document.getElementById("mode");
const startGameButton = document.getElementById("start-game");
const gameBoard = document.getElementById("game-board");
const playerTurnText = document.getElementById("player-turn");
const streakText = document.getElementById("streak");
const restartButton = document.getElementById("restart");

let gridSize = 3;
let winStreak = 3;
let mode = "user-vs-bot";
let currentPlayer = "X";
let board = [];
let userWinStreak = 0;

startGameButton.addEventListener("click", () => {
    gridSize = parseInt(gridSizeInput.value);
    winStreak = parseInt(winStreakInput.value);
    mode = modeSelect.value;

    if (gridSize < 3 || gridSize > 10 || winStreak < 3 || winStreak > gridSize) {
        alert("Invalid grid size or win streak!");
        return;
    }

    setupGame();
    setupScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
});

restartButton.addEventListener("click", () => {
    setupScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
    userWinStreak = 0;
    streakText.textContent = "Win Streak: 0";
});

function setupGame() {
    // Initialize board and grid
    board = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));
    gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    gameBoard.innerHTML = ""; // Clear previous cells

    // Reset turn indicator
    currentPlayer = "X";
    updateTurnIndicator();

    // Create the cells dynamically
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener("click", () => handleMove(i, j, cell)); // Handle clicks
            gameBoard.appendChild(cell);
        }
    }
}

function handleMove(row, col, cell) {
    if (board[row][col] !== "") return; // Ignore if cell is already taken

    // Update board and UI
    board[row][col] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer === "X" ? "player-x" : "player-o", "taken");

    // Check for win or draw
    if (checkWin(row, col)) {
        alert(`${currentPlayer} wins!`);
        userWinStreak = currentPlayer === "X" ? userWinStreak + 1 : 0;
        streakText.textContent = `Win Streak: ${userWinStreak}`;
        setupGame();
        return;
    }

    if (board.flat().every(cell => cell !== "")) {
        alert("It's a draw!");
        userWinStreak = 0;
        streakText.textContent = "Win Streak: 0";
        setupGame();
        return;
    }

    // Switch turn
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    updateTurnIndicator();

    // If mode is User vs Bot, make the bot play
    if (mode === "user-vs-bot" && currentPlayer === "O") {
        botMove();
    }
}

function botMove() {
    // Bot randomly selects an empty cell
    let emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === "") emptyCells.push([i, j]);
        }
    }
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const cell = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
    handleMove(row, col, cell);
}

function updateTurnIndicator() {
    playerTurnText.textContent =
        mode === "user-vs-bot"
            ? currentPlayer === "X"
                ? "Your Turn (X)"
                : "Bot's Turn (O)"
            : `Player ${currentPlayer}'s Turn`;

    playerTurnText.className = currentPlayer === "X" ? "player-x" : "player-o";
}

function checkWin(row, col) {
    const directions = [
        [0, 1], // Horizontal
        [1, 0], // Vertical
        [1, 1], // Diagonal down-right
        [1, -1], // Diagonal down-left
    ];

    for (let [dx, dy] of directions) {
        let count = 1; // Current cell counts as 1

        // Check both directions for the current player
        for (let dir of [-1, 1]) {
            let x = row, y = col;
            while (true) {
                x += dir * dx;
                y += dir * dy;

                if (
                    x < 0 ||
                    y < 0 ||
                    x >= gridSize ||
                    y >= gridSize ||
                    board[x][y] !== currentPlayer
                ) break;

                count++;
            }
        }

        if (count >= winStreak) return true; // Win condition met
    }

    return false; // No win condition met
}
