import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const rows = 9;
  const cols = 9;
  const minesCount = 10;

  const [board, setBoard] = useState([]);
  const [flagCount, setFlagCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');
  const [initialBoard, setInitialBoard] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const timerRef = useRef(null);
  const gameStartedRef = useRef(false);

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const initGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setTimer(0);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setRevealedCount(0);
    setFlagCount(0);
    setShowMessage(false);
    setShowConfetti(false);
    gameStartedRef.current = false;

    let newBoard = [];

    for (let i = 0; i < rows; i++) {
      newBoard[i] = [];
      for (let j = 0; j < cols; j++) {
        newBoard[i][j] = {
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          value: 0
        };
      }
    }

    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);
      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!newBoard[i][j].isMine) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              if (di === 0 && dj === 0) continue;
              const ni = i + di;
              const nj = j + dj;
              if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && newBoard[ni][nj].isMine) {
                count++;
              }
            }
          }
          newBoard[i][j].value = count;
        }
      }
    }

    setBoard(newBoard);
    setInitialBoard(JSON.parse(JSON.stringify(newBoard)));
  };

  const restartGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    setTimer(0);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setRevealedCount(0);
    setFlagCount(0);
    setShowMessage(false);
    setShowConfetti(false);
    gameStartedRef.current = false;

    const restoredBoard = JSON.parse(JSON.stringify(initialBoard));
    setBoard(restoredBoard);
  };

  const startTimer = () => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      timerRef.current = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
  };

  const handleCellClick = (row, col) => {
    if (gameOver || board[row][col].isRevealed || board[row][col].isFlagged) return;
    if (revealedCount === 0) startTimer();
    revealCell(row, col);
  };

  const handleRightClick = (e, row, col) => {
    e.preventDefault();
    if (gameOver || board[row][col].isRevealed) return;

    const newBoard = [...board];

    if (board[row][col].isFlagged) {
      newBoard[row][col].isFlagged = false;
      setFlagCount(prevCount => prevCount - 1);
    } else {
      if (flagCount >= minesCount) return;
      newBoard[row][col].isFlagged = true;
      setFlagCount(prevCount => prevCount + 1);
    }

    setBoard(newBoard);
  };

  const revealCell = (row, col) => {
    if (row < 0 || row >= rows || col < 0 || col >= cols || 
        board[row][col].isRevealed || board[row][col].isFlagged) return;

    const newBoard = [...board];
    newBoard[row][col].isRevealed = true;

    setRevealedCount(prevCount => {
      const newCount = prevCount + 1;

      const totalSafeCells = rows * cols - minesCount;
      const allSafeRevealed = newCount === totalSafeCells;
      const allMinesFlagged = newBoard.flat().filter(cell => cell.isMine && cell.isFlagged).length === minesCount;

      if (!gameOver && !newBoard[row][col].isMine && allSafeRevealed && allMinesFlagged) {
        endGame(true);
      }

      return newCount;
    });

    if (newBoard[row][col].isMine) {
      endGame(false);
      setBoard(newBoard);
      return;
    }

    if (newBoard[row][col].value > 0) {
      setScore(prevScore => prevScore + newBoard[row][col].value * 10);
    }

    if (newBoard[row][col].value === 0) {
      setBoard(newBoard);
      setTimeout(() => {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            if (di === 0 && dj === 0) continue;
            revealCell(row + di, col + dj);
          }
        }
      }, 0);
    } else {
      setBoard(newBoard);
    }
  };

  const endGame = (won) => {
    setGameOver(true);
    if (timerRef.current) clearInterval(timerRef.current);

    if (won) {
      setGameWon(true);
      setScore(prevScore => prevScore + Math.max(0, 5000 - timer * 10));
      setMessage('You Won! 🎉');
      setMessageClass('win');
      setShowMessage(true);
      setShowConfetti(true);
    } else {
      setMessage('Game Over! 💥');
      setMessageClass('lose');
      setShowMessage(true);

      const finalBoard = [...board];
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          if (finalBoard[i][j].isMine && !finalBoard[i][j].isFlagged) {
            finalBoard[i][j].isRevealed = true;
          } else if (!finalBoard[i][j].isMine && finalBoard[i][j].isFlagged) {
            finalBoard[i][j].isRevealed = true;
            finalBoard[i][j].isWrongFlag = true;
          }
        }
      }
      setBoard(finalBoard);
    }
  };

  const renderCell = (cell) => {
    if (cell.isFlagged) return <span className="flag">🚩</span>;
    if (cell.isRevealed) {
      if (cell.isMine) return <span className="bomb">💣</span>;
      if (cell.isWrongFlag) return <span className="wrong-flag">❌</span>;
      if (cell.value > 0) return <span className={`number-${cell.value}`}>{cell.value}</span>;
    }
    return null;
  };

  const Confetti = () => {
    if (!showConfetti) return null;
    const confettiPieces = Array.from({ length: 100 }, (_, i) => {
      const randomLeft = Math.random() * 100;
      const randomWidth = Math.random() * 10 + 5;
      const randomHeight = Math.random() * 10 + 5;
      const randomDuration = Math.random() * 2 + 2;
      const randomDelay = Math.random() * 1;
      const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      return (
        <div 
          key={i}
          className="confetti-piece"
          style={{
            left: `${randomLeft}%`,
            width: `${randomWidth}px`,
            height: `${randomHeight}px`,
            backgroundColor: randomColor,
            animationDuration: `${randomDuration}s`,
            animationDelay: `${randomDelay}s`
          }}
        />
      );
    });
    return <div className="confetti-container">{confettiPieces}</div>;
  };

  return (
    <div className="game-wrapper">
      {showConfetti && <Confetti />}
      <div className="game-container">
        <h1 className="game-title">Minesweeper</h1>
        <div className="game-header">
          <div className="game-stat">
            <span className="icon flag-icon">🚩</span>
            <span className="stat-value">{minesCount - flagCount}</span>
          </div>
          <div className="button-group">
            <button onClick={restartGame} className="game-button restart-button">
              <span className="icon">🔄</span>Restart
            </button>
            <button onClick={initGame} className="game-button new-game-button">
              <span className="icon">🆕</span>New Game
            </button>
          </div>
          <div className="game-stat">
            <span className="icon clock-icon">⏱️</span>
            <span className="stat-value">{timer}</span>
          </div>
        </div>
        <div className="score-container">
          <span className="score-label">Score: </span>
          <span className="score-value">{score}</span>
        </div>
        <div className="board">
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${cell.isRevealed ? 'revealed' : 'untouched'} ${cell.isRevealed && cell.isMine ? 'mine' : ''}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}
              >
                {renderCell(cell)}
              </div>
            ))
          ))}
        </div>
        {showMessage && (
          <div className={`message ${messageClass}`}>{message}</div>
        )}
        {gameOver && (
          <button onClick={initGame} className="game-button play-again-button">
            <span className="icon">▶️</span>Play Again
          </button>
        )}
        <div className="instructions">
          <p className="instructions-title">How to play:</p>
          <p className="instruction-item">• Left-click to reveal a cell</p>
          <p className="instruction-item">• Right-click to place/remove a flag</p>
          <p className="instruction-item">• Find all mines without clicking on them</p>
        </div>
      </div>
    </div>
  );
}

export default App;
