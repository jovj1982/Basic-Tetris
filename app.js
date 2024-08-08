document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    const scoreDisplay = document.querySelector('#score');
    const highScoreDisplay = document.querySelector('#highscore');
    const startBtn = document.querySelector('#start-button'); 
    const width = 10;
    let nextRandom = 0;
    let timerId;
    let score = 0;
    let highScore = localStorage.getItem('highscore') || 0;
    let intervalTime = 1000;
    let level = 0;
    let isFastDropping = false;

    highScoreDisplay.innerHTML = highScore;

    const colors = ['orange', 'red', 'purple', 'yellow', 'cyan'];

    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2]
    ];

    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1]
    ];

    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1]
    ];

    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1]
    ];

    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ];

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

    let currentPosition = 4;
    let currentRotation = 0;
    let random = Math.floor(Math.random() * theTetrominoes.length);
    let current = theTetrominoes[random][currentRotation];

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
            squares[currentPosition + index].style.backgroundColor = colors[random];
        });
    }

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
            squares[currentPosition + index].style.backgroundColor = '';
        });
    }

    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    }

    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            random = nextRandom;
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            updateSpeed();
            gameOver();
        }
    }

    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition -= 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition += 1;
        }
        draw();
    }

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition += 1;
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -= 1;
        }
        draw();
    }

    function rotate() {
        undraw();
        const nextRotation = (currentRotation + 1) % theTetrominoes[random].length;
        const nextPattern = theTetrominoes[random][nextRotation];
        const srsWallKicks = {
            0: [[0, -1, 1, -width, width], [0, 1, -1, width, -width]], 
            1: [[0, 1, -1, width, -width], [0, width, -width, -1, 1]], 
            2: [[0, width, -width, -1, 1], [0, -1, 1, -width, width]], 
            3: [[0, -1, 1, -width, width], [0, width, -width, 1, -1]]  
        };

        const currentKicks = srsWallKicks[currentRotation];
        const nextKicks = srsWallKicks[nextRotation];

        for (let i = 0; i < currentKicks.length; i++) {
            const currentKick = currentKicks[i];
            const nextKick = nextKicks[i];
            for (let j = 0; j < currentKick.length; j++) {
                const currentOffset = currentKick[j];
                const nextOffset = nextKick[j];
                const newPosition = currentPosition + currentOffset;

                if (!nextPattern.some(index =>
                    squares[newPosition + index] && squares[newPosition + index].classList.contains('taken')
                ) && newPosition >= 0 && newPosition < width * width) {
                    currentRotation = nextRotation;
                    current = nextPattern;
                    currentPosition = newPosition;
                    draw();
                    return;
                }
            }
        }
        draw();
    }

    const displaySquares = document.querySelectorAll('.mini-grid div');
    const displayWidth = 4;
    const displayIndex = 0;

    const upNextTetrominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ];

    function displayShape() {
        displaySquares.forEach(square => {
            square.classList.remove('tetromino');
            square.style.backgroundColor = '';
        });
        if (nextRandom < upNextTetrominoes.length) {
            upNextTetrominoes[nextRandom].forEach(index => {
                displaySquares[displayIndex + index].classList.add('tetromino');
                displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom];
            });
        }
    }

    function resetGame() {
        squares.forEach(square => {
            square.classList.remove('tetromino');
            square.classList.remove('taken');
            square.style.backgroundColor = '';
        });

        score = 0;
        level = 0;
        intervalTime = 1000;
        scoreDisplay.innerHTML = score;
        currentPosition = 4;
        currentRotation = 0;
        random = Math.floor(Math.random() * theTetrominoes.length);
        current = theTetrominoes[random][currentRotation];
        draw();
        displayShape();
        clearInterval(timerId);
        timerId = setInterval(moveDown, intervalTime);
    }

    startBtn.addEventListener('click', () => {
        if (timerId) {
            resetGame();
        } else {
            draw();
            timerId = setInterval(moveDown, intervalTime);
            nextRandom = Math.floor(Math.random() * theTetrominoes.length);
            displayShape();
        }
    });

    function addScore() {
        for (let i = 0; i < 199; i += width) {
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            if (row.every(index => squares[index].classList.contains('taken'))) {
                score += 10;
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                    squares[index].style.backgroundColor = '';
                });
                const squaresRemoved = squares.splice(i, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highscore', highScore);
            highScoreDisplay.innerHTML = highScore;
        }
    }

    function updateSpeed() {
        if (score >= (level + 1) * 100) {
            level++;
            intervalTime *= 0.9;
            clearInterval(timerId);
            timerId = setInterval(moveDown, intervalTime);
        }
    }

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'Game Over';
            clearInterval(timerId);
        }
    }

    function control(e) {
        if (timerId) {
            if (e.keyCode === 37) {
                moveLeft();
            } else if (e.keyCode === 38) {
                rotate();
            } else if (e.keyCode === 39) {
                moveRight();
            } else if (e.keyCode === 40) {
                if (!isFastDropping) {
                    clearInterval(timerId);
                    isFastDropping = true;
                    timerId = setInterval(moveDown, 50);
                }
            }
        }
    }

    function stopFastDrop(e) {
        if (e.keyCode === 40) {
            if (isFastDropping) {
                clearInterval(timerId);
                isFastDropping = false;
                timerId = setInterval(moveDown, intervalTime);
            }
        }
    }

    document.addEventListener('keydown', control);
    document.addEventListener('keyup', stopFastDrop);
});

