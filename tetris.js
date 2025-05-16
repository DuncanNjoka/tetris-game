// Canvas setup
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPiece');
const nextCtx = nextPieceCanvas.getContext('2d');

// Game constants
const BLOCK_SIZE = 30;
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BOARD_COLOR = '#000000';
const BORDER_COLOR = '#333333';

// DOM elements
const scoreElement = document.getElementById('score');
const linesElement = document.getElementById('lines');
const levelElement = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');

// Game variables
let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
let score = 0;
let lines = 0;
let level = 1;
let isGameOver = false;
let isPaused = false;
let gameInterval;
let currentPiece;
let nextPiece;
let dropStart;
let dropCounter = 0;
let dropInterval = 1000; // Initial speed (milliseconds)

// Tetromino definitions with colors
const TETROMINOS = [
    // I piece
    {
        shape: [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        color: '#00FFFF' // Cyan
    },
    // J piece
    {
        shape: [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#0000FF' // Blue
    },
    // L piece
    {
        shape: [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF8000' // Orange
    },
    // O piece
    {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#FFFF00' // Yellow
    },
    // S piece
    {
        shape: [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0]
        ],
        color: '#00FF00' // Green
    },
    // T piece
    {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0]
        ],
        color: '#800080' // Purple
    },
    // Z piece
    {
        shape: [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0]
        ],
        color: '#FF0000' // Red
    }
];

// Create a piece
function createPiece() {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    return {
        tetromino: TETROMINOS[randomIndex],
        position: { x: 3, y: 0 },
        rotation: 0
    };
}

// Initialize the game
function init() {
    board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    isGameOver = false;
    isPaused = false;
    dropInterval = 1000;
    updateScoreDisplay();
    
    // Generate initial pieces
    currentPiece = createPiece();
    nextPiece = createPiece();
    
    // Start the game loop
    if (gameInterval) clearInterval(gameInterval);
    dropStart = Date.now();
    gameInterval = setInterval(gameLoop, 16.67); // Approximately 60 FPS
}

// Draw a single block
function drawBlock(x, y, color, ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = BORDER_COLOR;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the board
function drawBoard() {
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (board[y][x]) {
                drawBlock(x, y, board[y][x], ctx);
            }
        }
    }
}

// Draw the current tetromino
function drawTetromino(piece, ctx, offsetX = 0, offsetY = 0) {
    const tetromino = piece.tetromino;
    const shape = tetromino.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                drawBlock(
                    piece.position.x + x + offsetX,
                    piece.position.y + y + offsetY,
                    tetromino.color,
                    ctx
                );
            }
        }
    }
}

// Draw the next piece preview
function drawNextPiece() {
    nextCtx.fillStyle = BOARD_COLOR;
    nextCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    
    const centerX = (3 - nextPiece.tetromino.shape[0].length) / 2;
    const centerY = (3 - nextPiece.tetromino.shape.length) / 2;
    
    drawTetromino({
        tetromino: nextPiece.tetromino,
        position: { x: centerX, y: centerY },
        rotation: 0
    }, nextCtx);
}

// Collision detection
function collision(piece, offsetX, offsetY, rotation = 0) {
    const tetromino = piece.tetromino;
    const shape = tetromino.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const newX = piece.position.x + x + offsetX;
                const newY = piece.position.y + y + offsetY;
                
                if (
                    newX < 0 || newX >= BOARD_WIDTH ||
                    newY >= BOARD_HEIGHT ||
                    (newY >= 0 && board[newY][newX])
                ) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// Move the tetromino down
function moveDown() {
    if (!isPaused && !isGameOver) {
        if (!collision(currentPiece, 0, 1)) {
            currentPiece.position.y++;
            dropStart = Date.now();
        } else {
            // Lock the piece
            lockPiece();
            // Check for game over
            if (currentPiece.position.y <= 0) {
                gameOver();
                return;
            }
            // Get the next piece
            currentPiece = nextPiece;
            nextPiece = createPiece();
            // Draw the next piece preview
            drawNextPiece();
        }
    }
}

// Move the tetromino left
function moveLeft() {
    if (!isPaused && !isGameOver && !collision(currentPiece, -1, 0)) {
        currentPiece.position.x--;
    }
}

// Move the tetromino right
function moveRight() {
    if (!isPaused && !isGameOver && !collision(currentPiece, 1, 0)) {
        currentPiece.position.x++;
    }
}

// Rotate the tetromino
function rotate() {
    if (!isPaused && !isGameOver) {
        const rotatedShape = [];
        const shape = currentPiece.tetromino.shape;
        
        // Create rotated shape matrix
        for (let y = 0; y < shape[0].length; y++) {
            const row = [];
            for (let x = shape.length - 1; x >= 0; x--) {
                row.push(shape[x][y]);
            }
            rotatedShape.push(row);
        }
        
        // Check if rotation is possible
        const originalShape = currentPiece.tetromino.shape;
        currentPiece.tetromino.shape = rotatedShape;
        
        // Wall kicks - try to adjust position if rotation causes collision
        const kicks = [0, -1, 1, -2, 2]; // Position offsets to try
        let rotated = false;
        
        for (const kick of kicks) {
            if (!collision(currentPiece, kick, 0)) {
                currentPiece.position.x += kick;
                rotated = true;
                break;
            }
        }
        
        // If rotation is not possible, revert to original shape
        if (!rotated) {
            currentPiece.tetromino.shape = originalShape;
        }
    }
}

// Hard drop the tetromino
function hardDrop() {
    if (!isPaused && !isGameOver) {
        while (!collision(currentPiece, 0, 1)) {
            currentPiece.position.y++;
            score += 2; // 2 points per cell dropped
        }
        updateScoreDisplay();
        moveDown(); // Lock the piece
    }
}

// Lock the tetromino on the board
function lockPiece() {
    const tetromino = currentPiece.tetromino;
    const shape = tetromino.shape;
    
    for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
            if (shape[y][x]) {
                const boardY = currentPiece.position.y + y;
                const boardX = currentPiece.position.x + x;
                if (boardY >= 0) {
                    board[boardY][boardX] = tetromino.color;
                }
            }
        }
    }
    
    // Check for cleared lines
    checkLines();
}

// Check for completed lines
function checkLines() {
    let linesCleared = 0;
    
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        let isLineComplete = true;
        
        for (let x = 0; x < BOARD_WIDTH; x++) {
            if (!board[y][x]) {
                isLineComplete = false;
                break;
            }
        }
        
        if (isLineComplete) {
            // Remove the line
            board.splice(y, 1);
            // Add empty line at the top
            board.unshift(Array(BOARD_WIDTH).fill(0));
            // Increment line count
            linesCleared++;
            // Check the same line again (since we moved rows down)
            y++;
        }
    }
    
    // Update score
    if (linesCleared > 0) {
        // Scoring system: more points for multiple lines at once
        const lineScores = [40, 100, 300, 1200]; // Points for 1, 2, 3, 4 lines
        score += lineScores[linesCleared - 1] * level;
        lines += linesCleared;
        
        // Level up every 10 lines
        level = Math.floor(lines / 10) + 1;
        
        // Increase speed with level
        dropInterval = Math.max(100, 1000 - (level - 1) * 50);
        
        updateScoreDisplay();
    }
}

// Update the score display
function updateScoreDisplay() {
    scoreElement.textContent = score;
    linesElement.textContent = lines;
    levelElement.textContent = level;
}

// Game over
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px Arial';
    ctx.fillText('Press Start to Play Again', canvas.width / 2, canvas.height / 2 + 40);
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    
    if (isPaused) {
        pauseBtn.textContent = 'Resume';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    } else {
        pauseBtn.textContent = 'Pause';
        dropStart = Date.now();
    }
}

// Main game loop
function gameLoop() {
    if (!isPaused && !isGameOver) {
        const now = Date.now();
        dropCounter = now - dropStart;
        
        if (dropCounter > dropInterval) {
            moveDown();
        }
        
        drawBoard();
        drawTetromino(currentPiece, ctx);
    }
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            score++; // 1 point for soft drop
            updateScoreDisplay();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            hardDrop();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
    }
});

startBtn.addEventListener('click', init);
pauseBtn.addEventListener('click', togglePause);

// Initialize the game on load
window.addEventListener('load', () => {
    init();
}); 