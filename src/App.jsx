import React, { useState, useEffect } from 'react';
import * as Tone from 'tone';

const TypewriterEffect = ({ strings, typeSpeed = 120, backSpeed = 140, loop = true }) => {
  const [currentStringIndex, setCurrentStringIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentString = strings[currentStringIndex];
    
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false);
        setIsDeleting(true);
        return;
      }

      if (isDeleting) {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentStringIndex((prev) => (prev + 1) % strings.length);
        }
      } else {
        if (currentText.length < currentString.length) {
          setCurrentText(currentString.slice(0, currentText.length + 1));
        } else {
          if (loop) {
            setIsPaused(true);
          }
        }
      }
    }, isDeleting ? backSpeed : (isPaused ? 1500 : typeSpeed));

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentStringIndex, strings, typeSpeed, backSpeed, loop]);

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-pulse ml-1 text-purple-300">|</span>
    </span>
  );
};

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
      className={`absolute rounded-full opacity-40 animate-pulse cursor-pointer hover:opacity-60 transition-all duration-200 ${isPopping ? 'animate-ping' : ''}`}
      onClick={handleClick}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.size}px`,
        height: `${position.size}px`,
        background: `linear-gradient(45deg, 
          rgba(147, 51, 234, 0.8), 
          rgba(236, 72, 153, 0.8), 
          rgba(59, 130, 246, 0.8))`,
        animationDelay: isPopping ? '0s' : `${delay}s`,
        animationDuration: isPopping ? '0.3s' : `${duration}s`,
        transition: isPopping ? 'all 0.3s ease-out' : 'all 3s ease-in-out',
        filter: 'blur(1px)',
        transform: isPopping ? 'scale(3)' : 'scale(1)',
        zIndex: 20,
        border: '2px solid rgba(255,255,255,0.3)',
        boxShadow: '0 4px 15px rgba(147, 51, 234, 0.3)'
      }}
    />
  );
};

const App = () => {
  const hiraganaData = [
    { character: "あ", romaji: "a" }, { character: "い", romaji: "i" }, { character: "う", romaji: "u" }, { character: "え", romaji: "e" }, { character: "お", romaji: "o" },
    { character: "か", romaji: "ka" }, { character: "き", romaji: "ki" }, { character: "く", romaji: "ku" }, { character: "け", romaji: "ke" }, { character: "こ", romaji: "ko" },
    { character: "さ", romaji: "sa" }, { character: "し", romaji: "shi" }, { character: "す", romaji: "su" }, { character: "せ", romaji: "se" }, { character: "そ", romaji: "so" },
    { character: "た", romaji: "ta" }, { character: "ち", romaji: "chi" }, { character: "つ", romaji: "tsu" }, { character: "て", romaji: "te" }, { character: "と", romaji: "to" },
    { character: "な", romaji: "na" }, { character: "に", romaji: "ni" }, { character: "ぬ", romaji: "nu" }, { character: "ね", romaji: "ne" }, { character: "の", romaji: "no" },
    { character: "は", romaji: "ha" }, { character: "ひ", romaji: "hi" }, { character: "ふ", romaji: "fu" }, { character: "へ", romaji: "he" }, { character: "ほ", romaji: "ho" },
    { character: "ま", romaji: "ma" }, { character: "み", romaji: "mi" }, { character: "む", romaji: "mu" }, { character: "め", romaji: "me" }, { character: "も", romaji: "mo" },
    { character: "や", romaji: "ya" }, { character: "ゆ", romaji: "yu" }, { character: "よ", romaji: "yo" },
    { character: "ら", romaji: "ra" }, { character: "れ", romaji: "re" }, { character: "り", romaji: "ri" }, { character: "ろ", romaji: "ro" }, { character: "る", romaji: "ru" },
    { character: "わ", romaji: "wa" }, { character: "を", romaji: "wo" }, { character: "ん", romaji: "n" }
  ];

  const initialCombinations = hiraganaData.map(item => item.romaji);

  // Audio states
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [synth, setSynth] = useState(null);
  
  // Mode selection
  const [currentMode, setCurrentMode] = useState('picker');
  
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
  
  // Timer states
  const [timerSeconds, setTimerSeconds] = useState(10);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  
  // App states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Audio initialization
  useEffect(() => {
    const initAudio = async () => {
      if (audioEnabled && !audioInitialized) {
        try {
          await Tone.start();
          
          // Create ambient background music with Japanese-inspired pentatonic scale
          const reverb = new Tone.Reverb(4).toDestination();
          const filter = new Tone.Filter(800, "lowpass").connect(reverb);
          const synthInst = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 2, decay: 1, sustain: 0.3, release: 4 }
          }).connect(filter);
          
          setSynth(synthInst);
          
          // Japanese pentatonic scale notes
          const pentatonicNotes = ["C4", "D4", "F4", "G4", "A4", "C5", "D5", "F5"];
          
          // Create gentle ambient background music
          const bgMusic = new Tone.Loop((time) => {
            const note = pentatonicNotes[Math.floor(Math.random() * pentatonicNotes.length)];
            synthInst.triggerAttackRelease(note, "2n", time, 0.1);
          }, "4n").start(0);
          
          Tone.Transport.bpm.value = 60;
          setBackgroundMusic(bgMusic);
          setAudioInitialized(true);
        } catch (error) {
          console.log("Audio initialization failed:", error);
        }
      }
    };
    
    initAudio();
  }, [audioEnabled, audioInitialized]);

  // Control background music
  useEffect(() => {
    if (audioInitialized && backgroundMusic) {
      if (audioEnabled) {
        Tone.Transport.start();
      } else {
        Tone.Transport.stop();
      }
    }
  }, [audioEnabled, audioInitialized, backgroundMusic]);

  // Sound effects functions
  const playCorrectSound = () => {
    if (audioEnabled && synth) {
      synth.triggerAttackRelease(["C5", "E5", "G5"], "8n", Tone.now(), 0.3);
    }
  };

  const playWrongSound = () => {
    if (audioEnabled && synth) {
      synth.triggerAttackRelease(["C3", "B2"], "4n", Tone.now(), 0.2);
    }
  };

  const playBubbleSound = () => {
    if (audioEnabled && synth) {
      const notes = ["C5", "D5", "E5", "F5", "G5"];
      const note = notes[Math.floor(Math.random() * notes.length)];
      synth.triggerAttackRelease(note, "16n", Tone.now(), 0.1);
    }
  };

  const playButtonSound = () => {
    if (audioEnabled && synth) {
      synth.triggerAttackRelease("A4", "32n", Tone.now(), 0.05);
    }
  };

  const toggleAudio = async () => {
    if (!audioEnabled) {
      // Enable audio - this will trigger initialization
      setAudioEnabled(true);
    } else {
      // Disable audio
      setAudioEnabled(false);
      if (backgroundMusic) {
        Tone.Transport.stop();
      }
    }
  };

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            handleTimeUp();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const handleTimeUp = () => {
    setTimerActive(false);
    setSelectedAnswer('TIME_UP');
    setIsCorrect(false);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    playWrongSound();
  };

  const handleBubblePop = () => {
    setBubblePopCount(prev => prev + 1);
    playBubbleSound();
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
    
    playButtonSound();
  };

  const resetPicker = () => {
    setAvailableCombinations([...initialCombinations]);
    setPickedCombinations([]);
    setCurrentPick('');
    setIsFinished(false);
    setBubblePopCount(0);
  };

  const generateQuizQuestion = () => {
    if (usedQuestions.length >= hiraganaData.length) {
      setCurrentQuestion(null);
      setTimerActive(false);
      return;
    }

    const availableQuestions = hiraganaData.filter(item => !usedQuestions.includes(item.character));
    
    if (availableQuestions.length === 0) {
      setCurrentQuestion(null);
      setTimerActive(false);
      return;
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
    
    setTimeLeft(timerSeconds);
    setTimerActive(true);
  };

  const handleAnswerSelect = (answer) => {
    if (showResult) return;
    
    setTimerActive(false);
    setSelectedAnswer(answer);
    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    setTotalQuestions(prev => prev + 1);
    
    if (correct) {
      setScore(prev => prev + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const nextQuestion = () => {
    if (usedQuestions.length >= hiraganaData.length) {
      setCurrentQuestion(null);
      setTimerActive(false);
      return;
    }
    generateQuizQuestion();
  };

  const resetQuiz = () => {
    setScore(0);
    setTotalQuestions(0);
    setUsedQuestions([]);
    setCurrentQuestion(null);
    setSelectedAnswer('');
    setShowResult(false);
    setTimerActive(false);
    setTimeLeft(0);
  };

  const switchMode = (mode) => {
    setCurrentMode(mode);
  };

  const startQuizWithTimer = () => {
    setShowTimerSettings(false);
    generateQuizQuestion();
  };

  const handleExit = () => {
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    resetPicker();
    resetQuiz();
    setCurrentMode('picker');
    setShowExitConfirm(false);
    setIsDarkMode(false);
    setBubblePopCount(0);
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  const bubbles = Array.from({ length: 12 }, (_, i) => (
    <FloatingBubble 
      key={i} 
      delay={i * 0.5} 
      duration={6 + Math.random() * 4}
      onPop={handleBubblePop}
    />
  ));

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 ${isDarkMode ? 'dark' : ''}`}>
      <div className={`absolute inset-0 transition-all duration-500 ${
        isDarkMode 
          ? 'bg-gradient-to-br from-gray-900 via-purple-900 via-indigo-900 to-black' 
          : 'bg-gradient-to-br from-purple-400 via-pink-500 via-blue-500 to-red-500 animate-pulse'
      }`}></div>
      <div 
        className="absolute inset-0"
        style={{
          background: isDarkMode 
            ? `
              radial-gradient(circle at 20% 80%, rgba(88, 28, 135, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(67, 56, 202, 0.4) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(30, 41, 59, 0.4) 0%, transparent 50%)
            `
            : `
              radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
            `,
          filter: 'blur(40px)'
        }}
      />
      
      <div className="absolute bottom-0 left-0 right-0 z-0 opacity-50">
        <svg viewBox="0 0 800 500" className="w-full h-auto" style={{ minHeight: '50vh' }}>
          <path
            d="M150 500 L400 80 L650 500 Z"
            fill={isDarkMode ? 'rgba(200,200,255,0.3)' : 'rgba(80,50,150,0.25)'}
            className="transition-all duration-500"
            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="1"
          />
          <path
            d="M320 160 L400 80 L480 160 L450 180 L400 130 L350 180 Z"
            fill={isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)'}
            className="transition-all duration-500"
            stroke={isDarkMode ? 'rgba(200,200,255,0.3)' : 'rgba(180,180,220,0.4)'}
            strokeWidth="1"
          />
          <path
            d="M0 500 L180 200 L360 500 Z"
            fill={isDarkMode ? 'rgba(150,150,200,0.2)' : 'rgba(60,40,120,0.15)'}
            className="transition-all duration-500"
            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            strokeWidth="1"
          />
          <path
            d="M440 500 L620 220 L800 500 Z"
            fill={isDarkMode ? 'rgba(150,150,200,0.2)' : 'rgba(60,40,120,0.15)'}
            className="transition-all duration-500"
            stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
            strokeWidth="1"
          />
          <ellipse cx="280" cy="200" rx="60" ry="25" 
            fill={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)'} 
            className="transition-all duration-500" />
          <ellipse cx="520" cy="180" rx="50" ry="20" 
            fill={isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)'} 
            className="transition-all duration-500" />
          <ellipse cx="350" cy="240" rx="40" ry="18" 
            fill={isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.35)'} 
            className="transition-all duration-500" />
          <path
            d="M200 450 Q300 400 400 430 Q500 400 600 450"
            fill="none"
            stroke={isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
            strokeWidth="2"
            className="transition-all duration-500"
          />
        </svg>
      </div>
      
      {bubbles}
      
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`${
            isDarkMode ? 'bg-gray-900/90' : 'bg-purple-900/90'
          } backdrop-blur-md rounded-2xl p-6 max-w-sm w-full border ${
            isDarkMode ? 'border-gray-600/50' : 'border-purple-300/50'
          } shadow-2xl`}>
            <h3 className="text-xl font-bold text-white text-center mb-4">Exit App?</h3>
            <p className="text-white/80 text-center mb-6 text-sm">
              This will reset all progress and return to the beginning. Are you sure?
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelExit}
                className={`flex-1 ${
                  isDarkMode ? 'bg-gray-700/60 hover:bg-gray-600/70' : 'bg-purple-600/60 hover:bg-purple-500/70'
                } text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border ${
                  isDarkMode ? 'border-gray-500/50' : 'border-purple-400/50'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className={`${
          isDarkMode ? 'bg-gray-900/40' : 'bg-purple-900/30'
        } backdrop-blur-md rounded-2xl shadow-2xl p-4 sm:p-8 max-w-lg w-full border ${
          isDarkMode ? 'border-gray-600/30' : 'border-purple-300/30'
        } mx-2 transition-all duration-500`}>
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`${
                  isDarkMode 
                    ? 'bg-yellow-500/20 hover:bg-yellow-400/30 border-yellow-400/50' 
                    : 'bg-gray-800/20 hover:bg-gray-700/30 border-gray-400/50'
                } text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border text-sm flex items-center gap-2`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`${
                  audioEnabled 
                    ? 'bg-green-500/20 hover:bg-green-400/30 border-green-400/50' 
                    : 'bg-red-500/20 hover:bg-red-400/30 border-red-400/50'
                } text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border text-sm flex items-center gap-2`}
              >
                {audioEnabled ? '🔊' : '🔇'}
              </button>
            </div>
            
            <button
              onClick={handleExit}
              className="bg-red-600/20 hover:bg-red-500/30 text-white font-semibold py-2 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-red-400/50 text-sm flex items-center gap-2"
            >
              🚪 Exit
            </button>
          </div>
          
          <div className={`flex mb-4 sm:mb-6 ${
            isDarkMode ? 'bg-gray-800/30' : 'bg-purple-800/20'
          } rounded-xl p-1 backdrop-blur-sm transition-all duration-500`}>
            <button
              onClick={() => switchMode('picker')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                currentMode === 'picker' 
                  ? `${isDarkMode ? 'bg-gray-600/50' : 'bg-purple-600/40'} text-white shadow-lg` 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              🎲 Random Picker
            </button>
            <button
              onClick={() => switchMode('quiz')}
              className={`flex-1 py-2 px-2 sm:px-4 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                currentMode === 'quiz' 
                  ? `${isDarkMode ? 'bg-gray-600/50' : 'bg-purple-600/40'} text-white shadow-lg` 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              🧠 Multiple Choice
            </button>
          </div>

          <div className="text-center mb-4">
            <span className="text-white/70 text-xs sm:text-sm drop-shadow">
              Bubbles Popped: {bubblePopCount} 🫧
            </span>
          </div>

          {currentMode === 'picker' ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-white drop-shadow-lg">
                🎌 Hiragana Picker
              </h1>
              
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-xs sm:text-sm text-white/80 mb-2 drop-shadow">
                  Remaining: {availableCombinations.length} | Picked: {pickedCombinations.length}
                </div>
                <div className={`w-full ${
                  isDarkMode ? 'bg-gray-700/40' : 'bg-purple-800/30'
                } rounded-full h-3 backdrop-blur-sm transition-all duration-500`}>
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${(pickedCombinations.length / initialCombinations.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {!isFinished ? (
                <div className="text-center">
                  <div className="mb-4 sm:mb-6">
                    {currentPick && (
                      <div className={`${
                        isDarkMode ? 'bg-gray-800/40' : 'bg-purple-800/30'
                      } backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 border ${
                        isDarkMode ? 'border-gray-500/40' : 'border-purple-300/30'
                      } shadow-lg transition-all duration-500`}>
                        <p className="text-sm sm:text-lg text-white/90 mb-2 drop-shadow">Your random combination is:</p>
                        <p className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg animate-bounce">
                          {currentPick}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={pickRandomCombination}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-purple-300/30 text-sm sm:text-base"
                  >
                    {currentPick ? 'Get Another! 🎲' : 'Get Random Combination! 🎲'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-purple-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 border border-purple-300/30 shadow-lg">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg animate-bounce">🎉 All Done!</h2>
                    <p className="text-white/90 drop-shadow text-sm sm:text-base">All combinations have been picked!</p>
                  </div>
                  
                  <button
                    onClick={resetPicker}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl backdrop-blur-sm border border-purple-300/30 text-sm sm:text-base"
                  >
                    Start Over 🔄
                  </button>
                </div>
              )}

              {pickedCombinations.length > 0 && (
                <div className="mt-4 sm:mt-6">
                  <h3 className="text-sm sm:text-lg font-semibold text-white/90 mb-3 drop-shadow">Picked Combinations:</h3>
                  <div className="max-h-24 sm:max-h-32 overflow-y-auto bg-purple-800/20 backdrop-blur-sm rounded-xl p-3 border border-purple-300/30">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {pickedCombinations.map((combo, index) => (
                        <span
                          key={index}
                          className="bg-purple-700/30 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium border border-purple-300/30 shadow-sm"
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
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-white drop-shadow-lg">
                🧠 Hiragana Quiz
              </h1>
              
              {showTimerSettings && (
                <div className="bg-purple-800/40 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-300/30 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 text-center drop-shadow">⏱️ Timer Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/90 text-sm mb-2">Seconds per question:</label>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[5, 10, 15, 20, 30].map(seconds => (
                          <button
                            key={seconds}
                            onClick={() => setTimerSeconds(seconds)}
                            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                              timerSeconds === seconds
                                ? 'bg-purple-600/60 text-white border-2 border-purple-300/50'
                                : 'bg-purple-700/30 text-white/80 hover:bg-purple-600/40 border border-purple-300/30'
                            }`}
                          >
                            {seconds}s
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        onClick={startQuizWithTimer}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm border border-purple-300/30 text-sm sm:text-base"
                      >
                        Start Quiz! 🚀
                      </button>
                      <button
                        onClick={() => setShowTimerSettings(false)}
                        className="bg-purple-600/40 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600/60 transition-all duration-200 backdrop-blur-sm border border-purple-300/30 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="text-center mb-4 sm:mb-6">
                <div className="text-xs sm:text-sm text-white/80 mb-2 drop-shadow">
                  Progress: {usedQuestions.length}/{hiraganaData.length} characters | Score: {score}/{totalQuestions} {totalQuestions > 0 && `(${Math.round((score/totalQuestions)*100)}%)`}
                </div>
                <div className="w-full bg-purple-800/30 rounded-full h-3 backdrop-blur-sm mb-2">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${(usedQuestions.length / hiraganaData.length) * 100}%` }}
                  ></div>
                </div>
                <div className="w-full bg-purple-800/30 rounded-full h-2 backdrop-blur-sm">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: totalQuestions > 0 ? `${(score / totalQuestions) * 100}%` : '0%' }}
                  ></div>
                </div>
                {usedQuestions.length === hiraganaData.length && (
                  <div className="mt-2 text-xs text-yellow-300 animate-pulse drop-shadow">
                    🎌 Complete cycle! All {hiraganaData.length} characters covered!
                  </div>
                )}
              </div>

              {currentQuestion && (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="bg-purple-800/40 backdrop-blur-md rounded-xl p-3 border border-purple-300/30 shadow-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-white/90 text-sm sm:text-base">⏱️ Time Left:</span>
                        <span className={`font-bold text-lg sm:text-xl ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                          {timeLeft}s
                        </span>
                      </div>
                      <div className="w-full bg-purple-900/40 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-green-400 to-blue-500'}`}
                          style={{ width: `${(timeLeft / timerSeconds) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-purple-300/30 shadow-lg">
                    <p className="text-sm sm:text-lg text-white/90 mb-4 drop-shadow">What is the romaji for:</p>
                    <p className="text-4xl sm:text-6xl font-bold text-white drop-shadow-lg mb-4 sm:mb-6">
                      {currentQuestion.character}
                    </p>
                    
                    {!showResult ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {currentQuestion.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(option)}
                            disabled={timeLeft === 0}
                            className="bg-purple-800/80 hover:bg-purple-700/90 disabled:bg-purple-900/50 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 backdrop-blur-sm border-2 border-purple-500/60 shadow-xl text-sm sm:text-base disabled:cursor-not-allowed disabled:transform-none hover:border-purple-400/80 disabled:text-white/50"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl backdrop-blur-sm border ${
                          selectedAnswer === 'TIME_UP' 
                            ? 'bg-orange-500/30 border-orange-300/50' 
                            : isCorrect 
                              ? 'bg-green-500/30 border-green-300/50' 
                              : 'bg-red-500/30 border-red-300/50'
                        }`}>
                          <p className="text-white font-bold text-lg sm:text-xl">
                            {selectedAnswer === 'TIME_UP' 
                              ? '⏰ Time\'s Up!' 
                              : isCorrect 
                                ? '🎉 Correct!' 
                                : '❌ Wrong!'
                            }
                          </p>
                          <p className="text-white/90 text-sm sm:text-base">
                            {selectedAnswer === 'TIME_UP'
                              ? `Correct answer: ${currentQuestion.correctAnswer}`
                              : isCorrect 
                                ? `Great job! ${currentQuestion.character} = ${currentQuestion.correctAnswer}` 
                                : `Correct answer: ${currentQuestion.correctAnswer}`
                            }
                          </p>
                          {!isCorrect && selectedAnswer !== 'TIME_UP' && (
                            <p className="text-white/80 text-xs sm:text-sm">
                              You selected: {selectedAnswer}
                            </p>
                          )}
                        </div>
                        
                        {usedQuestions.length < hiraganaData.length ? (
                          <button
                            onClick={nextQuestion}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-4 sm:px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm border border-purple-300/30 text-sm sm:text-base"
                          >
                            Next Question ➡️
                          </button>
                        ) : (
                          <div className="bg-gradient-to-r from-green-500/30 to-blue-500/30 backdrop-blur-sm rounded-xl p-4 border border-green-300/50">
                            <h3 className="text-xl font-bold text-white mb-2">🎌 Quiz Complete!</h3>
                            <p className="text-white/90 mb-2">
                              Final Score: {score}/{totalQuestions} ({Math.round((score/totalQuestions)*100)}%)
                            </p>
                            <p className="text-white/80 text-sm mb-4">
                              You've completed all {hiraganaData.length} hiragana characters!
                            </p>
                            <button
                              onClick={resetQuiz}
                              className="bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
                            >
                              Start New Quiz 🔄
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={resetQuiz}
                      className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 backdrop-blur-sm border border-purple-300/30 text-xs sm:text-sm"
                    >
                      Reset Quiz 🔄
                    </button>
                    <button
                      onClick={() => setShowTimerSettings(true)}
                      className="flex-1 bg-purple-600/40 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600/60 transition-all duration-200 backdrop-blur-sm border border-purple-300/30 text-xs sm:text-sm"
                    >
                      Timer Settings ⚙️
                    </button>
                  </div>
                </div>
              )}

              {!currentQuestion && !showTimerSettings && (
                <div className="text-center">
                  <div className="bg-purple-800/30 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-4 border border-purple-300/30 shadow-lg">
                    {usedQuestions.length === 0 ? (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg">🎯 Ready to Quiz?</h2>
                        <p className="text-white/90 drop-shadow mb-4 text-sm sm:text-base">Test your hiragana knowledge!</p>
                        <p className="text-white/70 text-xs sm:text-sm mb-4">Current timer: {timerSeconds} seconds per question</p>
                        <p className="text-yellow-300/80 text-xs sm:text-sm mb-4">
                          🎌 Complete all {hiraganaData.length} hiragana characters without repeats!
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-lg animate-bounce">🎉 Quiz Completed!</h2>
                        <p className="text-white/90 drop-shadow mb-2 text-sm sm:text-base">
                          Amazing! You've mastered all {hiraganaData.length} hiragana characters!
                        </p>
                        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-3 mb-4">
                          <p className="text-white font-bold text-lg">
                            Final Score: {score}/{totalQuestions} ({Math.round((score/totalQuestions)*100)}%)
                          </p>
                        </div>
                        <p className="text-white/70 text-xs sm:text-sm mb-4">
                          Ready for another round?
                        </p>
                      </>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <button
                        onClick={startQuizWithTimer}
                        className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl backdrop-blur-sm border border-purple-300/30 text-sm sm:text-base"
                      >
                        {usedQuestions.length === 0 ? 'Start Quiz! 🚀' : 'New Quiz! 🚀'}
                      </button>
                      <button
                        onClick={() => setShowTimerSettings(true)}
                        className="bg-purple-600/40 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-600/60 transition-all duration-200 backdrop-blur-sm border border-purple-300/30 text-xs sm:text-sm"
                      >
                        Change Timer ⚙️
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-white/70 drop-shadow">
            #<TypewriterEffect 
              strings={['JanielSenador', 'SenadorJaniel', 'JanielVSenador']} 
              typeSpeed={120} 
              backSpeed={140} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
