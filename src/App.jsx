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
    
    setTimeout(() => {
      setIsVisible(false);
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
  const hiraganaData = [
    { character: "あ", romaji: "a" }, { character: "い", romaji: "i" }, { character: "う", romaji: "u" }, { character: "え", romaji: "e" }, { character: "お", romaji: "o" },
    { character: "か", romaji: "Ka" }, { character: "き", romaji: "Ki" }, { character: "く", romaji: "Ku" }, { character: "け", romaji: "Ke" }, { character: "こ", romaji: "Ko" },
    { character: "さ", romaji: "Sa" }, { character: "し", romaji: "Shi" }, { character: "す", romaji: "Su" }, { character: "せ", romaji: "Se" }, { character: "そ", romaji: "So" },
    { character: "た", romaji: "ta" }, { character: "ち", romaji: "chi" }, { character: "つ", romaji: "tsu" }, { character: "て", romaji: "te" }, { character: "と", romaji: "to" },
    { character: "な", romaji: "na" }, { character: "に", romaji: "ni" }, { character: "ぬ", romaji: "nu" }, { character: "ね", romaji: "Ne" }, { character: "の", romaji: "No" },
    { character: "は", romaji: "Ha" }, { character: "ひ", romaji: "Hi" }, { character: "ふ", romaji: "Fu" }, { character: "へ", romaji: "He" }, { character: "ほ", romaji: "Ho" },
    { character: "ま", romaji: "Ma" }, { character: "み", romaji: "Mi" }, { character: "む", romaji: "Mu" }, { character: "め", romaji: "Me" }, { character: "も", romaji: "Mo" },
    { character: "や", romaji: "Ya" }, { character: "ゆ", romaji: "Yu" }, { character: "よ", romaji: "Yo" },
    { character: "ら", romaji: "Ra" }, { character: "れ", romaji: "Re" }, { character: "り", romaji: "Ri" }, { character: "ろ", romaji: "Ro" }, { character: "る", romaji: "Ru" },
    { character: "わ", romaji: "Wa" }, { character: "を", romaji: "o" }
  ];

  const initialCombinations = hiraganaData.map(item => item.romaji);

  // Mode selection
  const [currentMode, setCurrentMode] = useState('picker'); // 'picker' or 'quiz'
  
  // Picker mode states
  const [availableCombinations, setAvailableCombinations] = useState([...initialCombinations]);
  const [pickedCombinations, setPickedCombinations] = useState([]);
  const [currentPick, setCurrentPick] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [bubblePopCount, setBubblePopCount] = useState(0);

  // Quiz mode states
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

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
    
    const newAvailable = availableCombinations.filter((_, index) => index !== randomIndex);
    const newPicked = [...pickedCombinations, randomCombination];
    
    setAvailableCombinations(newAvailable);
    setPickedCombinations(newPicked);
    setCurrentPick(randomCombination);
    
    if (newAvailable.length === 0) {
      setIsFinished(true);
    }
  };

  const resetPicker = () => {
    setAvailableCombinations([...initialCombinations]);
    setPickedCombinations([]);
    setCurrentPick('');
    setIsFinished(false);
    setBubblePopCount(0);
  };

  const generateQuizQuestion = () => {
    const availableQuestions = hiraganaData.filter(item => !usedQuestions.includes(item.character));
    
    if (availableQuestions.length === 0) {
      // All questions used, reset
      setUsedQuestions([]);
      return generateQuizQuestion();
    }

    const correct = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    const wrongAnswers = hiraganaData
      .filter(item => item.romaji !== correct.romaji)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(item => item.romaji);
    
    const allOptions = [correct.romaji, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    setCurrentQuestion({
      character: correct.character,
      correctAnswer: correct.romaji,
      options: allOptions
    });
    
    setUsedQuestions(prev => [...prev, correct.character]);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    generateQuizQuestion();
  };

  const resetQuiz = () => {
    setScore(0);
    setTotalQuestions(0);
    setUsedQuestions([]);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
    if (mode === 'quiz' && !currentQuestion) {
      generateQuizQuestion();
    }
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
        <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-lg w-full border border-white/30">
          
          {/* Mode Selection */}
          <div className="flex mb-6 bg-white/10 rounded-xl p-1 backdrop-blur-sm">
            <button
              onClick={() => switchMode('picker')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                currentMode === 'picker' 
                  ? 'bg-white/30 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              🎲 Random Picker
            </button>
            <button
              onClick={() => switchMode('quiz')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                currentMode === 'quiz' 
                  ? 'bg-white/30 text-white shadow-lg' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              🧠 Multiple Choice
            </button>
          </div>

          {/* Bubble Pop Counter */}
          <div className="text-center mb-4">
            <span className="text-white/70 text-sm drop-shadow">
              Bubbles Popped: {bubblePopCount} 🫧
            </span>
          </div>

          {currentMode === 'picker' ? (
            // PICKER MODE
            <>
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
                    onClick={resetPicker}
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
            </>
          ) : (
            // QUIZ MODE
            <>
              <h1 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">
                🧠 Hiragana Quiz
              </h1>
              
              <div className="text-center mb-6">
                <div className="text-sm text-white/80 mb-2 drop-shadow">
                  Score: {score}/{totalQuestions} {totalQuestions > 0 && `(${Math.round((score/totalQuestions)*100)}%)`}
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: totalQuestions > 0 ? `${(score / totalQuestions) * 100}%` : '0%' }}
                  ></div>
                </div>
              </div>

              {currentQuestion && (
                <div className="text-center">
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 mb-6 border border-white/20 shadow-lg">
                    <p className="text-lg text-white/90 mb-4 drop-shadow">What is the romaji for:</p>
                    <p className="text-6xl font-bold text-white drop-shadow-lg mb-4">
                      {currentQuestion.character}
                    </p>
                    
                    {!showResult ? (
                      <div className="grid grid-cols-2 gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border border-white/20 shadow-lg"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl ${isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'} backdrop-blur-sm border ${isCorrect ? 'border-green-300/50' : 'border-red-300/50'}`}>
                          <p className="text-white font-bold text-xl">
                            {isCorrect ? '🎉 Correct!' : '❌ Wrong!'}
                          </p>
                          <p className="text-white/90">
                            {isCorrect 
                              ? `Great job! ${currentQuestion.character} = ${currentQuestion.correctAnswer}` 
                              : `Correct answer: ${currentQuestion.correctAnswer}`
                            }
                          </p>
                          {!isCorrect && (
                            <p className="text-white/80 text-sm">
                              You selected: {selectedAnswer}
                            </p>
                          )}
                        </div>
                        
                        <button
                          onClick={nextQuestion}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm border border-white/20"
                        >
                          Next Question ➡️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={resetQuiz}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm"
                  >
                    Reset Quiz 🔄
                  </button>
                </div>
              )}

              {!currentQuestion && (
                <div className="text-center">
                  <div className="bg-white/30 backdrop-blur-md rounded-xl p-6 mb-4 border border-white/20 shadow-lg">
                    <h2 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">🎯 Ready to Quiz?</h2>
                    <p className="text-white/90 drop-shadow mb-4">Test your hiragana knowledge!</p>
                    <button
                      onClick={generateQuizQuestion}
                      className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 px-8 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm border border-white/20"
                    >
                      Start Quiz! 🚀
                    </button>
                  </div>
                </div>
              )}
            </>
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
