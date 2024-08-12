window.initGame = (React) => {
  const { useState, useEffect } = React;

  const TETROMINOS = [
    { shape: [[1, 1], [1, 1]], color: 'yellow' }, // Square
    { shape: [[0, 1, 0], [1, 1, 1]], color: 'purple' }, // T-shape
    { shape: [[1, 1, 0], [0, 1, 1]], color: 'red' }, // Z-shape
    { shape: [[0, 1, 1], [1, 1, 0]], color: 'green' }, // S-shape
    { shape: [[1], [1], [1], [1]], color: 'cyan' }, // I-shape
  ];

  const Tetris = () => {
    const BOARD_HEIGHT = 20;
    const BOARD_WIDTH = 10;
    const FALL_INTERVAL = 500; // milliseconds
    const [currentPosition, setCurrentPosition] = useState(0);
    const [squareColumn, setSquareColumn] = useState(4);
    const [currentTetromino, setCurrentTetromino] = useState(TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)]);
    const [board, setBoard] = useState(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);

    const dropNewSquare = () => {
  setSquareColumn(4);
  setCurrentPosition(0);
  // Set a new random tetromino
  const newTetromino = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
  setCurrentTetromino(newTetromino);

  // Check for game over condition
  if (checkCollision(0, 4)) {
    setGameOver(true);
  }
};

    const resetGame = () => {
      setBoard(Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0)));
      setScore(0);
      setGameOver(false);
      dropNewSquare();
    };

    const clearFullRows = (newBoard) => {
      const filledRows = newBoard.filter(row => row.every(cell => cell === 1)).length;
      const filteredBoard = newBoard.filter(row => row.some(cell => cell === 0));
      const emptyRows = Array.from({ length: filledRows }, () => Array(BOARD_WIDTH).fill(0));
      setScore(prev => prev + filledRows * 10);
      return [...emptyRows, ...filteredBoard];
    };

    const checkCollision = (newPosition) => {
  for (let y = 0; y < currentTetromino.shape.length; y++) {
    for (let x = 0; x < currentTetromino.shape[y].length; x++) {
      if (currentTetromino.shape[y][x]) {
        const newX = newPosition.x + x;
        const newY = newPosition.y + y;

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return true; // Collision with walls or bottom
        }
        if (newY >= 0 && board[newY][newX]) {
          return true; // Collision with existing blocks
        }
      }
    }
  }
  return false;
};

    const handleKeyDown = (event) => {
  let newPosition = { x: column, y: row };
  if (event.key === "ArrowRight") {
    newPosition.x += 1; // Attempt to move right
  } else if (event.key === "ArrowLeft") {
    newPosition.x -= 1; // Attempt to move left
  }
  // Check collision before updating the position
  if (!checkCollision(newPosition)) {
    setColumn(newPosition.x);
  } else {
    console.log(`Collision detected at: ${newPosition.x}, ${newPosition.y}`);
  }
};

    const rotateTetromino = () => {
      const newShape = currentTetromino.shape[0].map((_, index) =>
          currentTetromino.shape.map(row => row[index]).reverse()
      );

      const newTetromino = { ...currentTetromino, shape: newShape };

      if (!checkCollision(currentPosition, squareColumn, newTetromino)) {
          setCurrentTetromino(newTetromino);
      } else {
          // Adjust position if rotation fails
          if (!checkCollision(currentPosition, squareColumn - 1, newTetromino)) {
              setSquareColumn(prev => prev - 1); // Shift left
          } else if (!checkCollision(currentPosition, squareColumn + 1, newTetromino)) {
              setSquareColumn(prev => prev + 1); // Shift right
          }
      }
    };

    useEffect(() => {
      const handleInterval = setInterval(() => {
        if (!gameOver && currentPosition < BOARD_HEIGHT - currentTetromino.shape.length && !checkCollision(currentPosition + 1, squareColumn)) {
          setCurrentPosition(prev => prev + 1);
        } else {
          const newBoard = [...board];
          currentTetromino.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell) {
                newBoard[currentPosition + i][squareColumn + j] = 1;
              }
            });
          });
          setBoard(clearFullRows(newBoard));
          dropNewSquare();
        }
      }, FALL_INTERVAL);
      return () => clearInterval(handleInterval);
    }, [currentPosition, squareColumn, currentTetromino, gameOver]);

    useEffect(() => {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }, [gameOver]);

    return React.createElement(
      'div',
      { className: "tetris", tabIndex: 0, onFocus: () => dropNewSquare() },
      React.createElement('h2', null, "Simple Tetris"),
      React.createElement('h3', null, `Score: ${score}`),
      !gameOver ? (
        React.createElement(
          'div',
          { className: "game-board" },
          board.map((row, rowIndex) => {
            return React.createElement(
              'div',
              { key: `row-${rowIndex}`, className: "row" },
              row.map((cell, colIndex) => {
                const isActive = cell === 1 || 
                  currentTetromino.shape.some((row, i) => row.some((cell, j) => cell && rowIndex === currentPosition + i && colIndex === squareColumn + j));
                return React.createElement(
                  'div',
                  {
                    key: `cell-${rowIndex}-${colIndex}`,
                    className: `cell ${isActive ? 'active' : ''}`,
                    style: { backgroundColor: isActive ? currentTetromino.color : undefined },
                  },
                  ''
                );
              })
            );
          })
        )
      ) : (
        React.createElement('div', null,
          React.createElement('h3', null, "Game Over!"),
          React.createElement('button', { onClick: resetGame }, "Restart Game")
        )
      )
    );
  };

  return Tetris;
};

console.log('Tetris game script loaded');
