import { useState, useCallback, useEffect, useRef } from 'react';
import allSentences from '../data/sentences.json';
import allStories from '../data/story.json';
import { DIFFICULTIES, getTimerDuration, getMaxMistakes } from '../config/difficulty';
import { getDailyChallengeSentences, markDailyPlayed, saveDailyBest } from '../config/dailyChallenge';
import { getSentenceForLevel } from '../game/logic/sentences';
import { POWER_UPS, generateRandomPowerUp } from '../game/logic/powerUps';
import { computeWpm } from '../game/logic/wpm';
import { computeStreakMultiplier } from '../game/logic/streakMultiplier';

export function useGame(soundHooks = {}, recentlyUsedSentences = [], userName = null) {
  const { 
    playKeystroke, playError, playSuccess, playGameOver, 
    playTick, playWarningTick, startHeartbeat, updateHeartbeat, 
    stopHeartbeat, playGlitch, playStatic 
  } = soundHooks;

  const [gameState, setGameState] = useState('idle');
  const [gameMode, setGameMode] = useState('normal'); // normal, daily, survival
  const [difficulty, setDifficulty] = useState('normal');
  const [level, setLevel] = useState(1);
  const [totalMistakes, setTotalMistakes] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [typed, setTyped] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isPowerUpShaking, setIsPowerUpShaking] = useState(false);
  const [isPowerUpFlashing, setIsPowerUpFlashing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [maxTime, setMaxTime] = useState(15);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [stageWpms, setStageWpms] = useState([]);
  const [totalErrors, setTotalErrors] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
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
  const [currentStoryId, setCurrentStoryId] = useState(null);
  const [isStoryComplete, setIsStoryComplete] = useState(false);
  
  // New: Track sentences used in current game (for anti-repetition)
  const [sentencesUsed, setSentencesUsed] = useState([]);

  const timerRef = useRef(null);
  const lastTickRef = useRef(0);
  const wpmStartRef = useRef(null);
  const totalCharsRef = useRef(0);
  const sentencePoolRef = useRef(null);
  const mistakesThisLevelRef = useRef(0);
  const levelCharsRef = useRef(0);
  const levelWpmStartRef = useRef(null);
  const lastSentenceTextRef = useRef(null);
  const shieldActiveRef = useRef(false);
  const slowMotionRef = useRef(false);
  const doublePointsRef = useRef(false);
  const isPausedRef = useRef(isPaused);
  const survivalStartTimeRef = useRef(null);
  const gameStateRef = useRef(gameState);
  const sentencesUsedRef = useRef([]); // Track sentences used in current game

  // Sync state to ref for timer interval to access without recreating
  useEffect(() => {
    isPausedRef.current = isPaused;
    gameStateRef.current = gameState;
    sentencesUsedRef.current = sentencesUsed;
  }, [isPaused, gameState, sentencesUsed]);

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
      // Skip timer updates when paused
      if (isPausedRef.current) {
        return;
      }
      
      // Update current level WPM in real-time
      if (gameStateRef.current === 'playing' && levelWpmStartRef.current) {
        const currentLevelWpm = computeWpm({
          totalChars: levelCharsRef.current,
          startMs: levelWpmStartRef.current,
          nowMs: Date.now(),
        });
        
        // Calculate the combined average WPM
        if (stageWpms.length > 0) {
          const avgStages = stageWpms.reduce((a, b) => a + b, 0) / stageWpms.length;
          // Blend current level speed with past stages
          setWpm(Math.round((avgStages + currentLevelWpm) / 2));
        } else {
          setWpm(currentLevelWpm);
        }
      }
      
      // Don't run countdown in endless mode
      if (gameMode === 'endless') {
        return;
      }
      
      setTimeLeft(prev => {
        const decay = slowMotionRef.current ? 0.05 : 0.1;
        const newTime = prev - decay;
        
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
      setTotalErrors(prev => prev + 1);
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
        
        // Calculate this level's WPM before moving on
        if (levelWpmStartRef.current) {
          const finalLevelWpm = computeWpm({
            totalChars: levelCharsRef.current,
            startMs: levelWpmStartRef.current,
            nowMs: Date.now(),
          });
          setStageWpms(prev => [...prev, finalLevelWpm]);
        }

        setLevel(newLevel);
        setTyped('');
        mistakesThisLevelRef.current = 0;
        levelCharsRef.current = 0;
        levelWpmStartRef.current = null;
        
        // Reset level-based power-ups
        slowMotionRef.current = false;
        doublePointsRef.current = false;
        setActivePowerUps(prev => prev.filter(p => p === POWER_UPS.SHIELD));

        const sentence = getSentenceForLevel(newLevel, difficulty, sentencePoolRef.current, lastSentenceTextRef.current, wpm, Math.random, null, recentlyUsedSentences, userName);
        lastSentenceTextRef.current = sentence.text;
        setCurrentSentence(sentence.text);
        // Track sentence for anti-repetition
        sentencesUsedRef.current.push(sentence.text);
        
        const powerUp = generateRandomPowerUp(Math.random, newLevel);
        if (powerUp) {
          playGlitch?.();
        }
        setCurrentLevelPowerUp(powerUp);
        
        const duration = getTimerDuration(newLevel, difficulty, sentence.text.length);
        startTimer(duration);
        playStatic?.();
      }
    }
  }, [timeLeft, gameState, totalMistakes, level, difficulty, gameMode, maxMistakes, wpm, clearTimer, startTimer, playError, playGameOver, updateHeartbeat, stopHeartbeat]);

  // Handle active power-ups
  useEffect(() => {
    if (activePowerUps.length === 0) return;
    
    activePowerUps.forEach(powerUp => {
      // Trigger visual effect for any power-up activation
      setIsPowerUpFlashing(true);
      setIsPowerUpShaking(true);
      setTimeout(() => {
        setIsPowerUpFlashing(false);
        setIsPowerUpShaking(false);
      }, 400);
      
      if (powerUp === POWER_UPS.SHIELD) {
        shieldActiveRef.current = true;
      } else if (powerUp === POWER_UPS.FREEZE_TIME) {
        setTimeLeft(prev => prev + 5);
      } else if (powerUp === POWER_UPS.EXTRA_LIFE) {
        if (totalMistakes > 0) {
          setTotalMistakes(prev => Math.max(0, prev - 1));
        }
      } else if (powerUp === POWER_UPS.SLOW_MOTION) {
        slowMotionRef.current = true;
        // Effect lasts for the current level
      } else if (powerUp === POWER_UPS.DOUBLE_POINTS) {
        doublePointsRef.current = true;
      }
    });
    
    // Remove one-time power-ups
    setActivePowerUps(prev => prev.filter(p => 
      p === POWER_UPS.SHIELD || 
      p === POWER_UPS.SLOW_MOTION || 
      p === POWER_UPS.DOUBLE_POINTS
    ));
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
    levelWpmStartRef.current = null;
    totalCharsRef.current = 0;
    levelCharsRef.current = 0;
    setStageWpms([]);
    setTotalErrors(0);
    setAccuracy(100);
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    slowMotionRef.current = false;
    doublePointsRef.current = false;
    setIsStoryComplete(false);
    setGameState('playing');
    
    const sentence = getSentenceForLevel(1, selectedDifficulty, null, null, 0, Math.random, null, recentlyUsedSentences, userName);
    lastSentenceTextRef.current = sentence.text;
    setCurrentSentence(sentence.text);
    sentencesUsedRef.current = [sentence.text]; // Initialize tracking
    const powerUp = generateRandomPowerUp();
    if (powerUp) playGlitch?.();
    setCurrentLevelPowerUp(powerUp);
    const duration = getTimerDuration(1, selectedDifficulty, sentence.text.length);
    startTimer(duration);
    playStatic?.();
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
    setCurrentLevelPowerUp(generateRandomPowerUp(Math.random, 1));
    setStreakMultiplier(1);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    levelWpmStartRef.current = null;
    totalCharsRef.current = 0;
    levelCharsRef.current = 0;
    setStageWpms([]);
    setTotalErrors(0);
    setAccuracy(100);
    shieldActiveRef.current = false;
    setIsStoryComplete(false);
    setGameState('playing');
    
    const sentence = sentencePoolRef.current[0];
    setCurrentSentence(sentence.text);
    sentencesUsedRef.current = [sentence.text]; // Initialize tracking
    startTimer(getTimerDuration(1, 'normal', sentence.text.length)); // Adaptive timer for daily
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
    levelWpmStartRef.current = null;
    totalCharsRef.current = 0;
    levelCharsRef.current = 0;
    setStageWpms([]);
    setTotalErrors(0);
    setAccuracy(100);
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    setIsPaused(false);
    setIsStoryComplete(false);
    setGameState('playing');
    
    const sentence = getSentenceForLevel(1, selectedDifficulty, null, null, 0, Math.random, null, recentlyUsedSentences, userName);
    lastSentenceTextRef.current = sentence.text;
    setCurrentSentence(sentence.text);
    sentencesUsedRef.current = [sentence.text]; // Initialize tracking
    const powerUp = generateRandomPowerUp(Math.random, 1);
    setCurrentLevelPowerUp(powerUp);
    // No timer for endless mode
    clearTimer();
    startHeartbeat?.(0);
  }, [clearTimer, startHeartbeat]);

  const startStoryMode = useCallback((storyId) => {
    const story = allStories.find(s => s.id === storyId);
    if (!story) return;

    setGameMode('story');
    setDifficulty('normal');
    setCurrentStoryId(storyId);
    // Convert text array to sentence objects
    sentencePoolRef.current = story.sentences.map(text => ({ text, level: 1 }));
    
    setLevel(1);
    setTotalMistakes(0);
    setTyped('');
    setCombo(0);
    setMaxCombo(0);
    setWpm(0);
    setPerfectStreak(0);
    setActivePowerUps([]);
    setCurrentLevelPowerUp(generateRandomPowerUp(Math.random, 1));
    setStreakMultiplier(1);
    mistakesThisLevelRef.current = 0;
    wpmStartRef.current = null;
    levelWpmStartRef.current = null;
    totalCharsRef.current = 0;
    levelCharsRef.current = 0;
    setStageWpms([]);
    setTotalErrors(0);
    setAccuracy(100);
    lastSentenceTextRef.current = null;
    shieldActiveRef.current = false;
    slowMotionRef.current = false;
    doublePointsRef.current = false;
    setIsStoryComplete(false);
    setGameState('playing');
    
    const firstSentence = sentencePoolRef.current[0];
    setCurrentSentence(firstSentence.text);
    sentencesUsedRef.current = [firstSentence.text]; // Initialize tracking
    startTimer(getTimerDuration(1, 'normal', firstSentence.text.length));
    startHeartbeat?.(0);
  }, [startTimer, startHeartbeat]);

  const handleType = useCallback((input) => {
    if (gameState !== 'playing' || isPaused) return;

    const newChar = input.slice(-1);
    const expectedChar = currentSentence[typed.length];

    if (newChar === expectedChar) {
      if (!wpmStartRef.current) wpmStartRef.current = Date.now();
      if (!levelWpmStartRef.current) levelWpmStartRef.current = Date.now();
      
      totalCharsRef.current += 1;
      levelCharsRef.current += 1;
      
      // Real-time WPM update
      const currentLevelWpm = computeWpm({
        totalChars: levelCharsRef.current,
        startMs: levelWpmStartRef.current,
        nowMs: Date.now(),
      });
      
      if (stageWpms.length > 0) {
        const avgStages = stageWpms.reduce((a, b) => a + b, 0) / stageWpms.length;
        setWpm(Math.round((avgStages + currentLevelWpm) / 2));
      } else {
        setWpm(currentLevelWpm);
      }

      // Update global accuracy
      const totalAttempts = totalCharsRef.current + totalErrors;
      if (totalAttempts > 0) {
        setAccuracy(Math.round((totalCharsRef.current / totalAttempts) * 100));
      }

      playKeystroke?.();
      const newTyped = typed + newChar;
      setTyped(newTyped);

      if (newTyped === currentSentence) {
        playSuccess?.();
        
        const newCombo = combo + 1;
        setCombo(newCombo);
        setMaxCombo(prev => Math.max(prev, newCombo));
        
        let multiplier = computeStreakMultiplier(newCombo);
        if (doublePointsRef.current) multiplier *= 2;
        setStreakMultiplier(multiplier);
        
        // Track perfect streak (no mistakes this level)
        if (mistakesThisLevelRef.current === 0) {
          setPerfectStreak(prev => prev + 1);
        } else {
          setPerfectStreak(0);
        }
        
        const newLevel = level + 1;
        
        // Calculate this level's WPM before moving on
        if (levelWpmStartRef.current) {
          const finalLevelWpm = computeWpm({
            totalChars: levelCharsRef.current,
            startMs: levelWpmStartRef.current,
            nowMs: Date.now(),
          });
          setStageWpms(prev => [...prev, finalLevelWpm]);
        }

        setLevel(newLevel);
        setTyped('');
        mistakesThisLevelRef.current = 0;
        levelCharsRef.current = 0;
        levelWpmStartRef.current = null;
        
        // Reset level-based power-ups
        slowMotionRef.current = false;
        doublePointsRef.current = false;
        setActivePowerUps(prev => prev.filter(p => p === POWER_UPS.SHIELD));
        
        // Get current WPM for adaptive difficulty
        const currentWPM = wpm;
        const combinedHistory = [...(recentlyUsedSentences || []), ...(sentencesUsedRef.current || [])];
        const sentence = getSentenceForLevel(newLevel, difficulty, sentencePoolRef.current, lastSentenceTextRef.current, currentWPM, Math.random, null, combinedHistory, userName);
        lastSentenceTextRef.current = sentence.text;
        setCurrentSentence(sentence.text);
        
        // Track sentence for anti-repetition - update both Ref and State
        sentencesUsedRef.current = [...sentencesUsedRef.current, sentence.text];
        setSentencesUsed(sentencesUsedRef.current);
        
        // Trigger power-up if it exists for this level
        if (currentLevelPowerUp) {
          setActivePowerUps([...activePowerUps, currentLevelPowerUp]);
        }
        
        // Generate new power-up for next level
        const newPowerUp = generateRandomPowerUp(Math.random, newLevel);
        setCurrentLevelPowerUp(newPowerUp);
        
        // Handle timer based on mode
        if (gameMode === 'endless') {
          // No timer for endless mode
        } else if (gameMode === 'daily') {
          startTimer(12);
        } else if (gameMode === 'story') {
          // Progress through story or end game if last sentence
          if (newLevel > sentencePoolRef.current.length) {
            clearTimer();
            stopHeartbeat?.();
            setIsStoryComplete(true);
            setGameState('gameover');
            return;
          }
          startTimer(getTimerDuration(newLevel, 'normal', sentence.text.length));
        } else {
          startTimer(getTimerDuration(newLevel, difficulty, sentence.text.length));
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
      setTotalErrors(prev => prev + 1);
      mistakesThisLevelRef.current += 1;
      setCombo(0);
      setStreakMultiplier(1);
      setPerfectStreak(0);

      // Starting the timer even on error if it hasn't started
      if (!wpmStartRef.current) wpmStartRef.current = Date.now();
      if (!levelWpmStartRef.current) levelWpmStartRef.current = Date.now();
      
      // Update global accuracy
      const totalAttempts = totalCharsRef.current + totalErrors + 1;
      setAccuracy(Math.round((totalCharsRef.current / totalAttempts) * 100));
      
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
    isPowerUpShaking,
    isPowerUpFlashing,
    timeLeft,
    maxTime,
    combo,
    maxCombo,
    wpm,
    accuracy,
    totalErrors,
    perfectStreak,
    bestScore,
    handleType,
    startGame,
    startDailyChallenge,
    startEndlessMode,
    startStoryMode,
    allStories,
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
    currentStoryId,
    isStoryComplete,
    // New: Anti-repetition
    sentencesUsed,
  };
}
