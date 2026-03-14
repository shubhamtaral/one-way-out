import { useState, useCallback, useEffect, useRef } from 'react';
import allSentences from '../data/sentences.json';
import { DIFFICULTIES, getTimerDuration, getMaxMistakes } from '../config/difficulty';
import { getDailyChallengeSentences, markDailyPlayed, saveDailyBest } from '../config/dailyChallenge';
import { getSentenceForLevel } from '../game/logic/sentences';
import { POWER_UPS, generateRandomPowerUp } from '../game/logic/powerUps';
import { computeWpm } from '../game/logic/wpm';
import { computeStreakMultiplier } from '../game/logic/streakMultiplier';

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
  const isPausedRef = useRef(isPaused);
  const survivalStartTimeRef = useRef(null);

  // Sync state to ref for timer interval to access without recreating
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

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
      if (isPausedRef.current || (gameMode === 'endless')) {
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
  }, [clearTimer, playTick, playWarningTick, gameMode]);

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
    sentencePoolRef.current = getDailyChallengeSentences(allSentences);
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

  const startEndlessMode = useCallback((selectedDifficulty = 'normal') => {
    setGameMode('endless');
    setDifficulty(selectedDifficulty);
    sentencePoolRef.current = null;
    setLevel(1);
    setEndlessLives(10);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(null);
    setStreakMultiplier(1);
    setTotalMistakes(0);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    totalCharsRef.current = 0;
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
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
      
      const newWpm = computeWpm({
        totalChars: totalCharsRef.current,
        startMs: wpmStartRef.current,
        nowMs: Date.now(),
      });
      if (newWpm > 0) setWpm(newWpm);

      playKeystroke?.();
      const newTyped = typed + newChar;
      setTyped(newTyped);

      if (newTyped === currentSentence) {
        playSuccess?.();
        
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        
        setStreakMultiplier(computeStreakMultiplier(newCombo));
        
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
