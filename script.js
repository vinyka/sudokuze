document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const cells = [];
    let selectedCell = null;
    let gameBoard = Array(9).fill().map(() => Array(9).fill(0));
    let solution = Array(9).fill().map(() => Array(9).fill(0));
    let timer = null;
    let seconds = 0;
    let isGameOver = false;

    // Initialize the game
    function init() {
        createBoard();
        startNewGame();
        setupEventListeners();
    }

    // Create the Sudoku board
    function createBoard() {
        board.innerHTML = '';
        cells.length = 0;
        
        for (let row = 0; row < 9; row++) {
            cells[row] = [];
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.addEventListener('click', () => selectCell(cell, row, col));
                board.appendChild(cell);
                cells[row][col] = cell;
            }
        }
    }


    // Start a new game
    function startNewGame() {
        // Reset game state
        if (timer) {
            clearInterval(timer);
        }
        seconds = 0;
        document.getElementById('timer').textContent = '00:00';
        isGameOver = false;
        document.getElementById('message').textContent = '';
        
        // Reset board
        gameBoard = Array(9).fill().map(() => Array(9).fill(0));
        solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // Generate a new puzzle
        generatePuzzle();
        
        // Start timer
        timer = setInterval(updateTimer, 1000);
    }

    // Generate a Sudoku puzzle
    function generatePuzzle() {
        // Clear the board
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                gameBoard[row][col] = 0;
                cells[row][col].textContent = '';
                cells[row][col].className = 'cell';
            }
        }
        
        // Fill the diagonal 3x3 boxes
        fillDiagonalBoxes();
        
        // Solve the puzzle to get a complete solution
        solveSudoku(solution);
        
        // Copy the solution to the game board
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                gameBoard[row][col] = solution[row][col];
            }
        }
        
        // Remove numbers to create the puzzle based on difficulty
        const difficulty = document.getElementById('difficulty').value;
        let cellsToRemove;
        
        switch(difficulty) {
            case 'easy':
                cellsToRemove = 40; // ~45-50 cells filled
                break;
            case 'hard':
                cellsToRemove = 60; // ~25-30 cells filled
                break;
            case 'medium':
            default:
                cellsToRemove = 50; // ~35-40 cells filled
        }
        
        // Remove numbers
        let cellsRemoved = 0;
        while (cellsRemoved < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (gameBoard[row][col] !== 0) {
                gameBoard[row][col] = 0;
                cellsRemoved++;
            }
        }
        
        // Update the UI
        updateBoard();
    }

    // Fill the diagonal 3x3 boxes
    function fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            fillBox(box, box);
        }
    }
    
    // Fill a 3x3 box
    function fillBox(row, col) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        shuffleArray(nums);
        
        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                gameBoard[row + i][col + j] = nums[index++];
            }
        }
    }
    
    // Shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Solve the Sudoku puzzle
    function solveSudoku(board) {
        const emptyCell = findEmptyCell(board);
        if (!emptyCell) return true;
        
        const [row, col] = emptyCell;
        
        for (let num = 1; num <= 9; num++) {
            if (isValid(board, row, col, num)) {
                board[row][col] = num;
                
                if (solveSudoku(board)) {
                    return true;
                }
                
                board[row][col] = 0;
            }
        }
        
        return false;
    }
    
    // Find an empty cell
    function findEmptyCell(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }
    
    // Check if a number is valid in a cell
    function isValid(board, row, col, num) {
        // Check row
        for (let x = 0; x < 9; x++) {
            if (board[row][x] === num) return false;
        }
        
        // Check column
        for (let x = 0; x < 9; x++) {
            if (board[x][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxStartRow = row - (row % 3);
        const boxStartCol = col - (col % 3);
        
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxStartRow + i][boxStartCol + j] === num) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // Update the board UI
    function updateBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = cells[row][col];
                const value = gameBoard[row][col];
                
                cell.textContent = value !== 0 ? value : '';
                cell.className = 'cell';
                
                if (value !== 0) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.add('user-input');
                }
                
                // Highlight selected cell
                if (selectedCell === cell) {
                    cell.classList.add('highlighted');
                }
            }
        }
    }
    
    // Select a cell
    function selectCell(cell, row, col) {
        if (isGameOver || cell.classList.contains('fixed')) return;
        
        // Remove highlight from previously selected cell
        if (selectedCell) {
            selectedCell.classList.remove('highlighted');
        }
        
        // Select new cell
        selectedCell = cell;
        cell.classList.add('highlighted');
    }
    
    // Handle number input
    function handleNumberInput(num) {
        if (!selectedCell || isGameOver) return;
        
        const row = parseInt(selectedCell.dataset.row);
        const col = parseInt(selectedCell.dataset.col);
        
        // Clear the cell if 0 is passed (clear button)
        if (num === 0) {
            gameBoard[row][col] = 0;
            selectedCell.textContent = '';
        } else {
            // Check if the number is valid
            if (isValidMove(row, col, num)) {
                gameBoard[row][col] = num;
                selectedCell.textContent = num;
                selectedCell.classList.remove('error');
                
                // Check if the game is won
                if (isBoardComplete()) {
                    endGame(true);
                }
            } else {
                // Show error
                selectedCell.classList.add('error');
                selectedCell.textContent = num;
                
                // Remove error class after a short delay
                setTimeout(() => {
                    if (selectedCell) {
                        selectedCell.classList.remove('error');
                        if (gameBoard[row][col] === 0) {
                            selectedCell.textContent = '';
                        }
                    }
                }, 500);
            }
        }
    }
    
    // Check if a move is valid
    function isValidMove(row, col, num) {
        // Temporarily set the number to check validity
        const temp = gameBoard[row][col];
        gameBoard[row][col] = 0;
        
        // Check if the number is valid
        const valid = isValid(gameBoard, row, col, num);
        
        // Restore the original value
        gameBoard[row][col] = temp;
        
        return valid;
    }
    
    // Check if the board is complete and correct
    function isBoardComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (gameBoard[row][col] === 0) {
                    return false;
                }
                
                const num = gameBoard[row][col];
                gameBoard[row][col] = 0;
                
                if (!isValid(gameBoard, row, col, num)) {
                    gameBoard[row][col] = num;
                    return false;
                }
                
                gameBoard[row][col] = num;
            }
        }
        return true;
    }
    
    // End the game
    function endGame(isWin) {
        isGameOver = true;
        clearInterval(timer);
        
        const messageEl = document.getElementById('message');
        messageEl.className = ''; // Clear previous classes
        
        if (isWin) {
            messageEl.textContent = '🎉 Parabéns! Você venceu o SUDOKU DO ZÉ!';
            messageEl.classList.add('success');
        } else {
            messageEl.textContent = '❌ Fim de jogo! Tente novamente!';
            messageEl.classList.add('error');
        }
    }
    
    // Update the timer
    function updateTimer() {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
            
        // Add pulse animation every minute
        if (seconds % 60 === 0) {
            const timerEl = document.getElementById('timer');
            timerEl.style.animation = 'pulse 0.5s';
            setTimeout(() => {
                timerEl.style.animation = '';
            }, 500);
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Number buttons
        document.querySelectorAll('.number-btn').forEach(button => {
            button.addEventListener('click', () => {
                const num = parseInt(button.dataset.number);
                handleNumberInput(num);
            });
        });
        
        // New game button
        document.getElementById('new-game').addEventListener('click', startNewGame);
        
        // Difficulty change
        document.getElementById('difficulty').addEventListener('change', startNewGame);
        
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (!selectedCell) return;
            
            if (e.key >= '1' && e.key <= '9') {
                handleNumberInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                handleNumberInput(0);
            } else if (e.key.startsWith('Arrow')) {
                moveSelection(e.key);
            }
        });
    }
    
    // Move selection with arrow keys
    function moveSelection(direction) {
        if (!selectedCell) return;
        
        let row = parseInt(selectedCell.dataset.row);
        let col = parseInt(selectedCell.dataset.col);
        
        switch(direction) {
            case 'ArrowUp':
                row = Math.max(0, row - 1);
                break;
            case 'ArrowDown':
                row = Math.min(8, row + 1);
                break;
            case 'ArrowLeft':
                col = Math.max(0, col - 1);
                break;
            case 'ArrowRight':
                col = Math.min(8, col + 1);
                break;
        }
        
        // Select the new cell
        selectCell(cells[row][col], row, col);
    }
    
    // Add animation for new game button
    document.getElementById('new-game').addEventListener('mouseover', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    document.getElementById('new-game').addEventListener('mouseout', function() {
        this.style.transform = 'scale(1)';
    });
    
    // Add keyboard shortcut for new game (Ctrl+N)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('new-game').click();
        }
    });
    
    // Modal de Instruções
    const modal = document.getElementById('instructions-modal');
    const helpBtn = document.getElementById('help-btn');
    const closeBtn = document.querySelector('.close-btn');
    const startBtn = document.getElementById('start-playing');
    
    // Mostrar modal quando a página carregar
    window.addEventListener('load', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Impede o scroll da página
    });
    
    // Mostrar modal ao clicar no botão de ajuda
    helpBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    // Fechar modal ao clicar no X
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Fechar modal ao clicar fora do conteúdo
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Botão Começar a Jogar
    startBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Inicializar o jogo
    init();
});
