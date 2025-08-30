import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import React, { useEffect } from 'react';

const FloatingBubble = ({ delay = 0, duration = 8, onPop }) => {
  const [position, setPosition] = useState({
    x: Math.random() * 100,
    y: 100,
    size: Math.random() * 60 + 20
  });
  const [isPopping, setIsPopping] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPopping) {
        setPosition(prev => ({
          ...prev,
          x: Math.random() * 100,
          y: Math.random() * 100
        }));
      }
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [duration, isPopping]);

  const handleClick = () => {
    if (isPopping) return;
    
    setIsPopping(true);
    onPop();
    
    // Hide bubble after pop animation
    setTimeout(() => {
      setIsVisible(false);
      // Respawn bubble after a delay
      setTimeout(() => {
        setIsVisible(true);
        setIsPopping(false);
        setPosition({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 20
        });
      }, 2000);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`absolute rounded-full opacity-20 animate-pulse cursor-pointer hover:opacity-30 transition-all duration-200 ${isPopping ? 'animate-ping' : ''}`}
      onClick={handleClick}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.size}px`,
        height: `${position.size}px`,
        background: `linear-gradient(45deg, 
          rgba(147, 51, 234, 0.6), 
          rgba(236, 72, 153, 0.6), 
          rgba(59, 130, 246, 0.6))`,
        animationDelay: isPopping ? '0s' : `${delay}s`,
        animationDuration: isPopping ? '0.3s' : `${duration}s`,
        transition: isPopping ? 'all 0.3s ease-out' : 'all 3s ease-in-out',
        filter: 'blur(1px)',
        transform: isPopping ? 'scale(3)' : 'scale(1)',
        zIndex: 1
      }}
    />
  );
};

const App = () => {
  const initialCombinations = [
    "a", "i", "u", "e", "Ka", "Ki", "Ku", "Ko", "Sa", "Shi", "Su", "Se", "So", 
    "ta", "chi", "tsu", "tu", "to", "na", "ni", "nu", "Ne", "No", "Ha", "Hi", 
    "Fu", "He", "Ho", "Ma", "Mi", "Mu", "Me", "Mo", "Ya", "Yu", "Yo", "Ra", 
    "Re", "Ri", "Ro", "Ru", "Wa", "o"
  ];

  const [availableCombinations, setAvailableCombinations] = useState([...initialCombinations]);
  const [pickedCombinations, setPickedCombinations] = useState([]);
  const [currentPick, setCurrentPick] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [bubblePopCount, setBubblePopCount] = useState(0);

  const handleBubblePop = () => {
    setBubblePopCount(prev => prev + 1);
  };

  const pickRandomCombination = () => {
    if (availableCombinations.length === 0) {
      setIsFinished(true);
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableCombinations.length);
    const randomCombination = availableCombinations[randomIndex];
    
    // Update state
    const newAvailable = availableCombinations.filter((_, index) => index !== randomIndex);
    const newPicked = [...pickedCombinations, randomCombination];
    
    setAvailableCombinations(newAvailable);
    setPickedCombinations(newPicked);
    setCurrentPick(randomCombination);
    
    if (newAvailable.length === 0) {
      setIsFinished(true);
    }
  };

  const resetGame = () => {
    setAvailableCombinations([...initialCombinations]);
    setPickedCombinations([]);
    setCurrentPick('');
    setIsFinished(false);
    setBubblePopCount(0);
  };

  // Create array of bubbles
  const bubbles = Array.from({ length: 15 }, (_, i) => (
    <FloatingBubble 
      key={i} 
      delay={i * 0.5} 
      duration={6 + Math.random() * 4}
      onPop={handleBubblePop}
    />
  ));

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Blurred animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 via-blue-500 to-red-500 animate-pulse"></div>
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
          `,
          filter: 'blur(40px)'
        }}
      />
      
      {/* Floating bubbles */}
      {bubbles}
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/30">
          <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
            🎌 Hiragana Picker
          </h1>
          
          <div className="text-center mb-6">
            <div className="text-sm text-white/80 mb-2 drop-shadow">
              Remaining: {availableCombinations.length} | Picked: {pickedCombinations.length}
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                style={{ width: `${(pickedCombinations.length / initialCombinations.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {!isFinished ? (
            <div className="text-center">
              <div className="mb-6">
                {currentPick && (
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 mb-4 border border-white/20 shadow-lg">
                    <p className="text-lg text-white/90 mb-2 drop-shadow">Your random combination is:</p>
                    <p className="text-5xl font-bold text-white drop-shadow-lg animate-bounce">
                      {currentPick}
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={pickRandomCombination}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/20"
              >
                {currentPick ? 'Get Another Rizz! 🎲' : 'Get Random Combination! 🎲'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 mb-4 border border-white/20 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg animate-bounce">🎉 All Done!</h2>
                <p className="text-white/90 drop-shadow">All combinations have been picked!</p>
              </div>
              
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 px-8 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-white/20"
              >
                Start Over 🔄
              </button>
            </div>
          )}

          {pickedCombinations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white/90 mb-3 drop-shadow">Picked Combinations:</h3>
              <div className="max-h-32 overflow-y-auto bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex flex-wrap gap-2">
                  {pickedCombinations.map((combo, index) => (
                    <span
                      key={index}
                      className="bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20 shadow-sm"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      {combo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-center text-sm text-white/70 drop-shadow">
            #SenadorJaniel
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
