import React, { useState, useEffect } from 'react';
import { Clock, Search, Trophy } from 'lucide-react';
import { gameLevels } from '../config/differences';

const PhotoHunt = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [differences, setDifferences] = useState(gameLevels[currentLevel].differences);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(gameLevels[currentLevel].timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [highScores, setHighScores] = useState([
    { name: "Player 1", score: 300 },
    { name: "Player 2", score: 250 },
    { name: "Player 3", score: 200 },
  ]);
  const [showHint, setShowHint] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    setIsGameActive(true);
    setScore(0);
    setTimeLeft(120);
    setDifferences(gameLevels[currentLevel].differences.map(diff => ({ ...diff, found: false })));
  };

  const endGame = () => {
    setIsGameActive(false);
    if (score > Math.min(...highScores.map(hs => hs.score))) {
      const name = prompt("New high score! Enter your name:");
      if (name) {
        const newHighScores = [...highScores, { name, score }]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);
        setHighScores(newHighScores);
      }
    }
  };

  const handleClick = (e) => {
    if (!isGameActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    // Convert click to percentage
    const x = (e.nativeEvent.offsetX / rect.width) * 100;
    const y = (e.nativeEvent.offsetY / rect.height) * 100;

    console.log('Click %:', x, y); // Debug log

    const newDifferences = [...differences];
    let found = false;
    
    newDifferences.forEach((diff, index) => {
      if (!diff.found && 
          Math.abs(diff.x - x) < (diff.radius || 5) && 
          Math.abs(diff.y - y) < (diff.radius || 5)) {
        newDifferences[index] = { ...diff, found: true };
        found = true;
        console.log('Found difference:', diff); // Debug log
      }
    });

    if (found) {
      setScore(prev => prev + 100);
      setDifferences(newDifferences);
      if (newDifferences.every(d => d.found)) {
        endGame();
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ImageWithMarkers = ({ src, onClick }) => (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <img 
        src={src}
        alt="Game"
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={onClick}
      />
      {differences.map((diff, index) => {
        if (diff.found) {
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: `${diff.x}%`,
                top: `${diff.y}%`,
                width: '30px',
                height: '30px',
                border: '3px solid yellow',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 0, 0.2)',
                boxShadow: '0 0 10px rgba(255, 255, 0, 0.5)',
                transform: 'translate(-50%, -50%)'
              }}
            />
          );
        }
        return showHint && (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${diff.x}%`,
              top: `${diff.y}%`,
              width: '20px',
              height: '20px',
              border: '2px solid red',
              borderRadius: '50%',
              animation: 'pulse 2s infinite',
              transform: 'translate(-50%, -50%)'
            }}
          />
        );
      })}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">PhotoHunt</h1>
          <div className="flex gap-4 items-center">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
            </span>
            <span>Score: {score}</span>
          </div>
        </div>

        {/* Images Container */}
        <div className="w-full">
          <table className="w-full border-collapse">
            <tbody>
              <tr>
                {/* Left Image Cell */}
                <td className="w-1/2 p-2">
                  <ImageWithMarkers 
                    src={gameLevels[currentLevel].images.original}
                    onClick={handleClick}
                  />
                </td>

                {/* Right Image Cell */}
                <td className="w-1/2 p-2">
                  <ImageWithMarkers 
                    src={gameLevels[currentLevel].images.modified}
                    onClick={handleClick}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Controls */}
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={isGameActive ? endGame : startGame}
          >
            {isGameActive ? 'End Game' : 'Start Game'}
          </button>
          
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
            onClick={() => setShowHint(prev => !prev)}
            disabled={!isGameActive}
          >
            <Search className="h-4 w-4" /> Hint
          </button>
          
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
            onClick={() => setShowHighScores(true)}
          >
            <Trophy className="h-4 w-4" /> High Scores
          </button>
        </div>

        {/* High Scores Modal */}
        {showHighScores && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">High Scores</h2>
              {highScores.map((hs, i) => (
                <div key={i} className="flex justify-between py-2 border-b">
                  <span>{hs.name}</span>
                  <span>{hs.score}</span>
                </div>
              ))}
              <button
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                onClick={() => setShowHighScores(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoHunt;