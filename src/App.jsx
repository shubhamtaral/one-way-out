import { useEffect, useState } from 'react';
import { useGame } from './hooks/useGame';
import { useSound } from './hooks/useSound';
import { useStats } from './hooks/useStats';
import { useAuth } from './hooks/useAuth';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { AchievementPopup } from './components/AchievementPopup';
import { testFirebaseConnection } from './services/leaderboard';
import { initTheme } from './config/themes';

function App() {
  const sound = useSound();
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const { stats, newAchievements, recordGame, clearNewAchievements } = useStats(user);
  const [showDeathScreen, setShowDeathScreen] = useState(false);
  const [gameRecorded, setGameRecorded] = useState(false);
  
  // Initialize theme and (optionally) test Firebase on app load
  useEffect(() => {
    initTheme();
    const enableTest = import.meta.env.DEV && import.meta.env.VITE_ENABLE_FIREBASE_TEST === 'true';
    if (enableTest) {
      testFirebaseConnection();
    }
  }, []);
  
  const {
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
    activePowerUps,
    currentLevelPowerUp,
    streakMultiplier,
    timeSurvived,
    selectedTheme,
    setSelectedTheme,
    isPaused,
    togglePause,
    endlessLives,
  } = useGame(sound);

  // Record game stats when game ends
  useEffect(() => {
    if (gameState === 'gameover' && !gameRecorded) {
      recordGame({
        level,
        wpm,
        maxCombo,
        difficulty,
        perfectStreak,
        gameMode,
      });
      setGameRecorded(true);
    } else if (gameState === 'playing') {
      setGameRecorded(false);
    }
  }, [gameState, gameRecorded, recordGame, level, wpm, maxCombo, difficulty, perfectStreak, gameMode]);

  // Delay showing game over screen for death animation
  useEffect(() => {
    if (gameState === 'gameover') {
      const timer = setTimeout(() => {
        setShowDeathScreen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowDeathScreen(false);
    }
  }, [gameState]);

  // Handle Enter to restart when game over
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showDeathScreen && gameMode !== 'daily' && e.key === 'Enter') {
        startGame(difficulty);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeathScreen, gameMode, difficulty, startGame]);

  // Handle restart
  const handleRestart = (selectedDifficulty) => {
    if (selectedDifficulty === null) {
      window.location.reload();
    } else if (gameMode === 'endless') {
      startEndlessMode(selectedDifficulty);
    } else {
      startGame(selectedDifficulty);
    }
  };

  // Handle quit from pause
  const handleQuitGame = () => {
    window.location.reload();
  };

  if (gameState === 'idle') {
    return (
      <>
        <StartScreen 
          onStart={startGame} 
          onStartDaily={startDailyChallenge}
          onStartEndless={startEndlessMode}
          stats={stats}
          user={user}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
          authLoading={authLoading}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
        />
        <AchievementPopup 
          achievements={newAchievements} 
          onDone={clearNewAchievements}
        />
      </>
    );
  }

  if (gameState === 'gameover') {
    if (!showDeathScreen) {
      return (
        <GameScreen
          level={level}
          mistakes={totalMistakes}
          maxMistakes={maxMistakes}
          bestScore={bestScore}
          sentence={currentSentence}
          typed={typed}
          isShaking={false}
          isFlashing={false}
          timeLeft={0}
          maxTime={maxTime}
          combo={combo}
          wpm={wpm}
          difficulty={difficulty}
          isGameOver={true}
          onType={() => {}}
          streakMultiplier={streakMultiplier}
          timeSurvived={timeSurvived}
          gameMode={gameMode}
          activePowerUps={activePowerUps}
          currentLevelPowerUp={currentLevelPowerUp}
          isPaused={isPaused}
          onTogglePause={togglePause}
          onQuitGame={handleQuitGame}
          endlessLives={endlessLives}
        />
      );
    }
    
    return (
      <>
        <GameOverScreen 
          level={level} 
          bestScore={bestScore}
          maxCombo={maxCombo}
          wpm={wpm}
          difficulty={difficulty}
          gameMode={gameMode}
          onRestart={handleRestart}
          user={user}
          timeSurvived={timeSurvived}
          perfectStreak={perfectStreak}
        />
        <AchievementPopup 
          achievements={newAchievements} 
          onDone={clearNewAchievements}
        />
      </>
    );
  }

  return (
    <>
      <GameScreen
        level={level}
        mistakes={totalMistakes}
        maxMistakes={maxMistakes}
        bestScore={bestScore}
        sentence={currentSentence}
        typed={typed}
        isShaking={isShaking}
        isFlashing={isFlashing}
        timeLeft={timeLeft}
        maxTime={maxTime}
        combo={combo}
        wpm={wpm}
        difficulty={difficulty}
        isGameOver={false}
        onType={handleType}
        streakMultiplier={streakMultiplier}
        timeSurvived={timeSurvived}
        gameMode={gameMode}
        activePowerUps={activePowerUps}
        currentLevelPowerUp={currentLevelPowerUp}
        isPaused={isPaused}
        onTogglePause={togglePause}
        onQuitGame={handleQuitGame}
        endlessLives={endlessLives}
      />
      <AchievementPopup 
        achievements={newAchievements} 
        onDone={clearNewAchievements}
      />
    </>
  );
}

export default App;
