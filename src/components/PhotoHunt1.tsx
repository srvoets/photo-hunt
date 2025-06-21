import React, { useState, useEffect } from 'react';
import { Clock, Search, Trophy } from 'lucide-react';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SpotDifferenceGame = () => {
  const [differences] = useState([
    { x: 25, y: 30, found: false },
    { x: 75, y: 45, found: false },
    { x: 40, y: 60, found: false },
  ]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isGameActive, setIsGameActive] = useState(false);
  const [highScores, setHighScores] = useState([
    { name: "Player 1", score: 300 },
    { name: "Player 2", score: 250 },
    { name: "Player 3", score: 200 },
  ]);
  const [showHint, setShowHint] = useState(false);

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
    differences.forEach(diff => diff.found = false);
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

    const rect = e.target.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    differences.forEach((diff, index) => {
      if (!diff.found && 
          Math.abs(diff.x - x) < 5 && 
          Math.abs(diff.y - y) < 5) {
        diff.found = true;
        setScore(prev => prev + 100);
        if (differences.every(d => d.found)) {
          endGame();
        }
      }
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Spot the Difference</span>
            <div className="flex gap-4 items-center">
              <Clock className="h-5 w-5" /> {formatTime(timeLeft)}
              <span>Score: {score}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative w-1/2">
              <img 
                src="/api/placeholder/400/300"
                alt="Original"
                className="w-full cursor-pointer"
                onClick={handleClick}
              />
              {showHint && differences.map((diff, i) => (
                !diff.found && (
                  <div
                    key={i}
                    className="absolute w-4 h-4 border-2 border-red-500 rounded-full animate-pulse"
                    style={{
                      left: `${diff.x}%`,
                      top: `${diff.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                )
              ))}
            </div>
            <div className="relative w-1/2">
              <img 
                src="/api/placeholder/400/300"
                alt="Modified"
                className="w-full cursor-pointer"
                onClick={handleClick}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={isGameActive ? endGame : startGame}
          >
            {isGameActive ? 'End Game' : 'Start Game'}
          </button>
          <button
            className="px-4 py-2 bg-yellow-500 text-white rounded flex items-center gap-2"
            onClick={() => setShowHint(prev => !prev)}
            disabled={!isGameActive}
          >
            <Search className="h-4 w-4" /> Hint
          </button>
          <Dialog>
            <DialogTrigger className="px-4 py-2 bg-green-500 text-white rounded flex items-center gap-2">
              <Trophy className="h-4 w-4" /> High Scores
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>High Scores</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {highScores.map((hs, i) => (
                  <div key={i} className="flex justify-between py-2 border-b">
                    <span>{hs.name}</span>
                    <span>{hs.score}</span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SpotDifferenceGame;
