// no bonus round
import React, { useState, useEffect } from 'react';
import { Search, Play } from 'lucide-react';
import { gameLevels } from '../config/differences';

const PhotoHunt = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [differences, setDifferences] = useState(
    gameLevels[currentLevel].differences.map(diff => ({...diff, found: false }))
  );
  const [score, setScore] = useState(550);
  const [timeLeft, setTimeLeft] = useState(gameLevels[currentLevel].timeLimit);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [hasGameStarted, setHasGameStarted] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);

  useEffect(() => {
    let timer;
    if (isGameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsGameActive(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameActive, timeLeft]);

  const startGame = () => {
    setHasGameStarted(true);
    setIsGameActive(true);
    setTimeLeft(gameLevels[currentLevel].timeLimit);
    setDifferences(gameLevels[currentLevel].differences.map(diff => ({...diff, found: false })));
    setHintsRemaining(3);
    setShowLevelComplete(false);
  };

  const goToNextLevel = () => {
    if (currentLevel < gameLevels.length - 1) {
      setCurrentLevel(prev => prev + 1);
      setTimeLeft(gameLevels[currentLevel + 1].timeLimit);
      setDifferences(gameLevels[currentLevel + 1].differences.map(diff => ({...diff, found: false })));
      setShowLevelComplete(false);
      setIsGameActive(true);
      setHintsRemaining(3);
    } else {
      setShowLevelComplete(false);
      setHasGameStarted(false);
      setCurrentLevel(0);
      setScore(550);
    }
  };

  const handleClick = (e) => {
    if (!isGameActive) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    let x, y;
    
    // Handle both touch and mouse events
    if (e.type === 'touchstart') {
      e.preventDefault();
      const touch = e.touches[0];
      x = ((touch.clientX - rect.left) / rect.width) * 100;
      y = ((touch.clientY - rect.top) / rect.height) * 100;
    } else {
      x = (e.nativeEvent.offsetX / rect.width) * 100;
      y = (e.nativeEvent.offsetY / rect.height) * 100;
    }
    
    const newDifferences = [...differences];
    let found = false;
    
    newDifferences.forEach((diff, index) => {
      if (!diff.found && 
          Math.abs(diff.x - x) < (diff.radius || 5) && 
          Math.abs(diff.y - y) < (diff.radius || 5)) {
        newDifferences[index] = { ...diff, found: true };
        found = true;
      }
    });

    if (found) {
      setDifferences(newDifferences);
      setScore(prev => prev + 100);

      if (newDifferences.every(diff => diff.found)) {
        setIsGameActive(false);
        setShowLevelComplete(true);
      }
    }
  };

  const useHint = () => {
    if (hintsRemaining > 0 && isGameActive) {
      setShowHint(true);
      setHintsRemaining(prev => prev - 1);
      setTimeout(() => {
        setShowHint(false);
      }, 2000);
    }
  };

  const LevelCompleteOverlay = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{
        color: 'white',
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
        animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.7)'
      }}>
        Level Complete!
      </div>
      <div style={{
        color: '#ffd700',
        fontSize: '32px',
        marginTop: '20px',
        animation: 'slideUp 0.8s ease-out 0.3s both'
      }}>
        Score: {score}
      </div>
      <button
        onClick={goToNextLevel}
        style={{
          marginTop: '30px',
          background: 'linear-gradient(to right, #ff4d8c, #8b5cf6)',
          border: 'none',
          borderRadius: '25px',
          padding: '12px 24px',
          color: 'white',
          fontSize: '20px',
          fontWeight: 'bold',
          cursor: 'pointer',
          animation: 'slideUp 0.8s ease-out 0.6s both'
        }}
      >
        {currentLevel < gameLevels.length - 1 ? 'Next Level' : 'Play Again'}
      </button>
    </div>
  );

  const ImageWithMarkers = ({ src, onClick }) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <img
        src={src}
        alt="Game"
        style={{ 
          width: '100%', 
          cursor: isGameActive ? 'crosshair' : 'default',
          filter: !hasGameStarted ? 'blur(5px)' : 'none',
          touchAction: 'none',
          WebkitUserSelect: 'none'
        }}
        onClick={onClick}
        onTouchStart={onClick}
      />
      {differences.map((diff, index) => {
        if (diff.found) {
          return (
            <div
              key={`found-${index}`}
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
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          );
        }
        if (showHint && !diff.found) {
          return (
            <div
              key={`hint-${index}`}
              style={{
                position: 'absolute',
                left: `${diff.x}%`,
                top: `${diff.y}%`,
                width: '20px',
                height: '20px',
                border: '2px solid red',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 0, 0, 0.2)',
                animation: 'pulse 2s infinite',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 10
              }}
            />
          );
        }
        return null;
      })}
    </div>
  );

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a1a',
      padding: '20px'
    }}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes bounceIn {
            0% { transform: scale(0.3); opacity: 0; }
            50% { transform: scale(1.05); }
            70% { transform: scale(0.9); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}
      </style>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        background: '#000',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {showLevelComplete && <LevelCompleteOverlay />}
        
        <div style={{
          background: 'linear-gradient(to right, #ff4d8c, #8b5cf6)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>
              Photo Hunt - Level {currentLevel + 1}
            </span>
            <div style={{
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '4px 16px',
              borderRadius: '20px',
              color: '#ffd700',
              fontSize: '24px',
              fontWeight: 'bold'
            }}>{score}</div>
          </div>
          <div style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div style={{ height: '16px', background: '#1a1a1a', display: 'flex' }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '100%',
                background: i < (timeLeft / gameLevels[currentLevel].timeLimit) * 30 ? 
                  i < 10 ? '#ff4444' : i < 20 ? '#ffaa00' : '#00cc44' : 
                  'transparent',
                borderRight: '1px solid rgba(0, 0, 0, 0.2)'
              }}
            />
          ))}
        </div>

        <div style={{ padding: '20px', background: '#1a1a1a' }}>
          {!hasGameStarted ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <button
                onClick={startGame}
                style={{
                  background: 'linear-gradient(to right, #ff4d8c, #8b5cf6)',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px 24px',
                  color: 'white',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Play size={24} />
                Start Game
              </button>
            </div>
          ) : null}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '20px'
          }}>
            <ImageWithMarkers 
              src={gameLevels[currentLevel].images.original}
              onClick={handleClick}
            />
            <ImageWithMarkers 
              src={gameLevels[currentLevel].images.modified}
              onClick={handleClick}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginTop: '20px' 
          }}>
            {[...Array(3)].map((_, i) => (
              <button
                key={i}
                onClick={useHint}
                disabled={i >= hintsRemaining || !isGameActive}
                style={{
                  width: '40px',
                  height: '40px',
                  background: i < hintsRemaining && isGameActive ? '#2a2a2a' : '#1a1a1a',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: i < hintsRemaining && isGameActive ? 'pointer' : 'not-allowed',
                  opacity: i < hintsRemaining && isGameActive ? 1 : 0.5
                }}
              >
                <Search 
                  size={20} 
                  color={i < hintsRemaining && isGameActive ? '#4a4a4a' : '#2a2a2a'}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoHunt;