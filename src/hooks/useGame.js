import { useState, useCallback, useEffect, useRef } from 'react';
import sentences from '../data/sentences.json';
import { DIFFICULTIES, getTimerDuration, getMaxMistakes, getMinSentenceLevel } from '../config/difficulty';
import { getDailyChallengeSentences, markDailyPlayed, saveDailyBest } from '../config/dailyChallenge';

// Power-ups Types
export const POWER_UPS = {
  FREEZE_TIME: 'freeze_time',     // +5 seconds
  SHIELD: 'shield',                // Next mistake doesn't count
  EXTRA_LIFE: 'extra_life',        // Regain a life
};

const POWER_UP_SPAWN_CHANCE = 0.20; // 20% chance per sentence

function getSentenceForLevel(level, difficulty, sentencePool = null, lastSentenceText = null, wpm = 0) {
  const pool = sentencePool || sentences;
  
  if (sentencePool) {
    // Daily challenge: use sentences in order
    const index = Math.min(level - 1, pool.length - 1);
    return pool[index];
  }
  
  let minLevel = getMinSentenceLevel(difficulty);
  let effectiveLevel = Math.max(level, minLevel);
  
  // Adaptive difficulty: adjust based on WPM
  if (wpm > 100) {
    effectiveLevel = Math.min(effectiveLevel + Math.floor((wpm - 100) / 50), 10);
  } else if (wpm > 0 && wpm < 50) {
    effectiveLevel = Math.max(effectiveLevel - Math.floor((50 - wpm) / 25), minLevel);
  }
  
  let available = pool.filter(s => s.level <= effectiveLevel && s.level >= minLevel);
  if (available.length === 0) return pool[0];
  
  // Avoid repeating the same sentence
  if (lastSentenceText && available.length > 1) {
    available = available.filter(s => s.text !== lastSentenceText);
  }
  
  const weighted = available.filter(s => s.level >= effectiveLevel - 5);
  const finalPool = weighted.length > 0 ? weighted : available;
  
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function generateRandomPowerUp() {
  if (Math.random() > POWER_UP_SPAWN_CHANCE) return null;
  const types = Object.values(POWER_UPS);
  return types[Math.floor(Math.random() * types.length)];
}

export function useGame(soundHooks = {}) {
  const { playKeystroke, playError, playSuccess, playGameOver, playTick, playWarningTick, startHeartbeat, updateHeartbeat, stopHeartbeat } = soundHooks;

  const [gameState, setGameState] = useState('idle');
  const [gameMode, setGameMode] = useState('normal'); // normal, daily, survival
  const [difficulty, setDifficulty] = useState('normal');
  const [level, setLevel] = useState(1);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [typed, setTyped] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    return parseInt(localStorage.getItem('oneWayOut_bestScore') || '0', 10);
  });
  
  // New: Power-ups System
  const [activePowerUps, setActivePowerUps] = useState([]);
  const [currentLevelPowerUp, setCurrentLevelPowerUp] = useState(null);
  
  // New: Streak Multiplier
  const [streakMultiplier, setStreakMultiplier] = useState(1);
  
  // New: Survival Mode
  const [timeSurvived, setTimeSurvived] = useState(0);
  
  // New: Cosmetics
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('oneWayOut_selectedTheme') || 'normal';
  });

  // New: Pause state
  const [isPaused, setIsPaused] = useState(false);
  
  // New: Endless mode lives (separate from mistakes)
  const [endlessLives, setEndlessLives] = useState(5);

  const timerRef = useRef(null);
  const lastTickRef = useRef(0);
  const wpmStartRef = useRef(null);
  const totalCharsRef = useRef(0);
  const sentencePoolRef = useRef(null);
  const mistakesThisLevelRef = useRef(0);
  const lastSentenceTextRef = useRef(null);
  const shieldActiveRef = useRef(false);
  const survivalStartTimeRef = useRef(null);

  const maxMistakes = gameMode === 'daily' ? 5 : (gameMode === 'endless' ? 5 : getMaxMistakes(difficulty));

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const startTimer = useCallback((duration) => {
    clearTimer();
    setTimeLeft(duration);
    setMaxTime(duration);
    lastTickRef.current = 0;
    
    timerRef.current = setInterval(() => {
      // Skip timer updates when paused or in endless mode without timer
      if (isPaused || (gameMode === 'endless')) {
        return;
      }
      
      setTimeLeft(prev => {
        const newTime = prev - 0.1;
        
        const wholeSecond = Math.ceil(newTime);
        if (wholeSecond !== lastTickRef.current && wholeSecond > 0) {
          lastTickRef.current = wholeSecond;
          if (wholeSecond <= 3) {
            playWarningTick?.();
          } else {
            playTick?.();
          }
        }
        
        if (newTime <= 0) return 0;
        return newTime;
      });
    }, 100);
  }, [clearTimer, playTick, playWarningTick, isPaused, gameMode]);

  // Handle timer expiry
  useEffect(() => {
    if (gameState !== 'playing' || gameMode === 'endless') return;
    
    if (timeLeft <= 0) {
      mistakesThisLevelRef.current += 1;
      const newMistakes = totalMistakes + 1;
      setTotalMistakes(newMistakes);
      setCombo(0);
      setStreakMultiplier(1);
      setPerfectStreak(0);
      
      setIsShaking(true);
      setIsFlashing(true);
      setTimeout(() => setIsShaking(false), 150);
      setTimeout(() => setIsFlashing(false), 200);
      
      playError?.();
      updateHeartbeat?.(newMistakes);
      
      if (newMistakes >= maxMistakes) {
        clearTimer();
        stopHeartbeat?.();
        playGameOver?.();
        
        if (gameMode === 'daily') {
          markDailyPlayed();
          saveDailyBest(level);
        }
        
        setGameState('gameover');
      } else {
        const newLevel = level + 1;
        setLevel(newLevel);
        setTyped('');
        mistakesThisLevelRef.current = 0;
        const sentence = getSentenceForLevel(newLevel, difficulty, sentencePoolRef.current, lastSentenceTextRef.current, wpm);
        lastSentenceTextRef.current = sentence.text;
        setCurrentSentence(sentence.text);
        
        if (gameMode === 'daily') {
          startTimer(12);
        } else if (gameMode === 'survival') {
          startTimer(getTimerDuration(newLevel, difficulty));
        } else {
          startTimer(getTimerDuration(newLevel, difficulty));
        }
      }
    }
  }, [timeLeft, gameState, totalMistakes, level, difficulty, gameMode, maxMistakes, wpm, clearTimer, startTimer, playError, playGameOver, updateHeartbeat, stopHeartbeat]);

  // Track time survived in survival mode
  useEffect(() => {
    if (gameMode !== 'survival' || gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      if (survivalStartTimeRef.current) {
        const elapsed = Math.floor((Date.now() - survivalStartTimeRef.current) / 1000);
        setTimeSurvived(elapsed);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameMode, gameState]);

  // Handle active power-ups
  useEffect(() => {
    if (activePowerUps.length === 0) return;
    
    activePowerUps.forEach(powerUp => {
      if (powerUp === POWER_UPS.SHIELD) {
        shieldActiveRef.current = true;
      } else if (powerUp === POWER_UPS.FREEZE_TIME) {
        // Add 5 seconds to timer
        setTimeLeft(prev => prev + 5);
      } else if (powerUp === POWER_UPS.EXTRA_LIFE) {
        // Restore a life by reducing mistakes
        if (totalMistakes > 0) {
          setTotalMistakes(prev => Math.max(0, prev - 1));
        }
      }
    });
    
    // Remove power-ups after use (except shield which is handled in handleType)
    setActivePowerUps(prev => prev.filter(p => p !== POWER_UPS.FREEZE_TIME && p !== POWER_UPS.EXTRA_LIFE));
  }, [activePowerUps, totalMistakes]);

  const startGame = useCallback((selectedDifficulty = 'normal') => {
    setGameMode('normal');
    setDifficulty(selectedDifficulty);
    sentencePoolRef.current = null;
    setLevel(1);
    setTotalMistakes(0);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(null);
    setStreakMultiplier(1);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    totalCharsRef.current = 0;
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    setGameState('playing');
    
    const sentence = getSentenceForLevel(1, selectedDifficulty, null, null, 0);
    lastSentenceTextRef.current = sentence.text;
    setCurrentSentence(sentence.text);
    const powerUp = generateRandomPowerUp();
    setCurrentLevelPowerUp(powerUp);
    const duration = getTimerDuration(1, selectedDifficulty);
    startTimer(duration);
    startHeartbeat?.(0);
  }, [startTimer, startHeartbeat]);

  const startDailyChallenge = useCallback(() => {
    setGameMode('daily');
    setDifficulty('normal');
    sentencePoolRef.current = getDailyChallengeSentences(sentences);
    setLevel(1);
    setTotalMistakes(0);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(null);
    setStreakMultiplier(1);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    totalCharsRef.current = 0;
    shieldActiveRef.current = false;
    setGameState('playing');
    
    const sentence = sentencePoolRef.current[0];
    setCurrentSentence(sentence.text);
    startTimer(12); // Fixed timer for daily
    startHeartbeat?.(0);
  }, [startTimer, startHeartbeat]);

  const startSurvivalMode = useCallback((selectedDifficulty = 'normal') => {
    setGameMode('survival');
    setDifficulty(selectedDifficulty);
    sentencePoolRef.current = null;
    setLevel(1);
    setTotalMistakes(0);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(null);
    setStreakMultiplier(1);
    setTimeSurvived(0);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    totalCharsRef.current = 0;
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    survivalStartTimeRef.current = Date.now();
    setGameState('playing');
    
    const sentence = getSentenceForLevel(1, selectedDifficulty, null, null, 0);
    lastSentenceTextRef.current = sentence.text;
    setCurrentSentence(sentence.text);
    const powerUp = generateRandomPowerUp();
    setCurrentLevelPowerUp(powerUp);
    const duration = getTimerDuration(1, selectedDifficulty);
    startTimer(duration);
    startHeartbeat?.(0);
  }, [startTimer, startHeartbeat]);

  const startEndlessMode = useCallback((selectedDifficulty = 'normal') => {
    setGameMode('endless');
    setDifficulty(selectedDifficulty);
    sentencePoolRef.current = null;
    setLevel(1);
    setEndlessLives(5);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(null);
    setStreakMultiplier(1);
    setTimeSurvived(0);
    setTotalMistakes(0);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    totalCharsRef.current = 0;
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    survivalStartTimeRef.current = Date.now();
    setIsPaused(false);
    setGameState('playing');
    
    const sentence = getSentenceForLevel(1, selectedDifficulty, null, null, 0);
    lastSentenceTextRef.current = sentence.text;
    setCurrentSentence(sentence.text);
    const powerUp = generateRandomPowerUp();
    setCurrentLevelPowerUp(powerUp);
    // No timer for endless mode
    clearTimer();
    startHeartbeat?.(0);
  }, [clearTimer, startHeartbeat]);

  const handleType = useCallback((input) => {
    if (gameState !== 'playing' || isPaused) return;

    const newChar = input.slice(-1);
    const expectedChar = currentSentence[typed.length];

    if (newChar === expectedChar) {
      if (!wpmStartRef.current) {
        wpmStartRef.current = Date.now();
      }
      totalCharsRef.current += 1;
      
      const elapsedMinutes = (Date.now() - wpmStartRef.current) / 60000;
      if (elapsedMinutes > 0.01) {
        const words = totalCharsRef.current / 5;
        setWpm(Math.min(Math.round(words / elapsedMinutes), 250));
      }

      playKeystroke?.();
      const newTyped = typed + newChar;
      setTyped(newTyped);

      if (newTyped === currentSentence) {
        playSuccess?.();
        
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        
        // Calculate streak multiplier: 5x = 1.5x, 10x = 2x, 15x = 2.5x, etc
        const newMultiplier = 1 + (newCombo >= 5 ? Math.floor((newCombo - 4) / 5) * 0.5 : 0);
        setStreakMultiplier(newMultiplier);
        
        // Track perfect streak (no mistakes this level)
        if (mistakesThisLevelRef.current === 0) {
          setPerfectStreak(prev => prev + 1);
        } else {
          setPerfectStreak(0);
        }
        
        const newLevel = level + 1;
        setLevel(newLevel);
        setTyped('');
        mistakesThisLevelRef.current = 0;
        
        // Get current WPM for adaptive difficulty
        const currentWPM = wpm;
        const sentence = getSentenceForLevel(newLevel, difficulty, sentencePoolRef.current, lastSentenceTextRef.current, currentWPM);
        lastSentenceTextRef.current = sentence.text;
        setCurrentSentence(sentence.text);
        
        // Trigger power-up if it exists for this level
        if (currentLevelPowerUp) {
          setActivePowerUps([...activePowerUps, currentLevelPowerUp]);
        }
        
        // Generate new power-up for next level
        const newPowerUp = generateRandomPowerUp();
        setCurrentLevelPowerUp(newPowerUp);
        
        // Handle timer based on mode
        if (gameMode === 'endless') {
          // No timer for endless mode
        } else if (gameMode === 'survival') {
          // In survival mode, timer decreases continuously
          startTimer(getTimerDuration(newLevel, difficulty));
        } else if (gameMode === 'daily') {
          startTimer(12);
        } else {
          startTimer(getTimerDuration(newLevel, difficulty));
        }
        
        if (newLevel > bestScore) {
          setBestScore(newLevel);
          localStorage.setItem('oneWayOut_bestScore', newLevel.toString());
        }
      }
    } else {
      // Check for shield power-up
      if (shieldActiveRef.current) {
        shieldActiveRef.current = false;
        setActivePowerUps(prev => prev.filter(p => p !== POWER_UPS.SHIELD));
        playKeystroke?.();
        return;
      }
      
      playError?.();
      mistakesThisLevelRef.current += 1;
      setCombo(0);
      setStreakMultiplier(1);
      setPerfectStreak(0);
      
      if (gameMode === 'endless') {
        // In endless mode, decrease lives instead of mistakes
        const newLives = endlessLives - 1;
        setEndlessLives(newLives);
        updateHeartbeat?.(5 - newLives);
        
        setIsShaking(true);
        setIsFlashing(true);
        setTimeout(() => setIsShaking(false), 150);
        setTimeout(() => setIsFlashing(false), 200);

        if (newLives <= 0) {
          clearTimer();
          stopHeartbeat?.();
          playGameOver?.();
          setGameState('gameover');
        }
      } else {
        const newMistakes = totalMistakes + 1;
        setTotalMistakes(newMistakes);
        updateHeartbeat?.(newMistakes);
        
        setIsShaking(true);
        setIsFlashing(true);
        setTimeout(() => setIsShaking(false), 150);
        setTimeout(() => setIsFlashing(false), 200);

        if (newMistakes >= maxMistakes) {
          clearTimer();
          stopHeartbeat?.();
          playGameOver?.();
          
          if (gameMode === 'daily') {
            markDailyPlayed();
            saveDailyBest(level);
          }
          
          setGameState('gameover');
        }
      }
    }
  }, [gameState, currentSentence, typed, level, difficulty, gameMode, totalMistakes, combo, maxMistakes, bestScore, wpm, activePowerUps, currentLevelPowerUp, isPaused, endlessLives, playKeystroke, playError, playSuccess, playGameOver, updateHeartbeat, stopHeartbeat, clearTimer, startTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopHeartbeat?.();
    };
  }, [clearTimer, stopHeartbeat]);

  return {
    gameState,
    gameMode,
    difficulty,
    level,
    totalMistakes,
    maxMistakes,
    currentSentence,
    typed,
    isShaking,
    isFlashing,
    timeLeft,
    maxTime,
    combo,
    maxCombo,
    wpm,
    perfectStreak,
    bestScore,
    handleType,
    startGame,
    startDailyChallenge,
    startSurvivalMode,
    startEndlessMode,
    // New: Power-ups & Multiplier
    activePowerUps,
    currentLevelPowerUp,
    streakMultiplier,
    timeSurvived,
    selectedTheme,
    setSelectedTheme,
    // New: Pause & Endless
    isPaused,
    togglePause,
    endlessLives,
  };
}
