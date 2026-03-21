import { useState, useCallback, useEffect } from 'react';
import { getNewAchievements } from '../config/achievements';
import { saveUserProfile, getUserProfile, submitScore, submitDailyScore, saveAchievements } from '../services/leaderboard';
import { getDailyChallengeId } from '../config/dailyChallenge';

const STORAGE_KEY = 'oneWayOut_stats';

function loadLocalStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  
  return {
    totalGames: 0,
    bestLevel: 0,
    bestWpm: 0,
    bestCombo: 0,
    bestAccuracy: 0,
    totalLevels: 0,
    unlockedAchievements: [],
    lastPlayed: null,
    totalPractice: 0,
    practicePerfect: 0,
    konamiCodeUnlocked: false,
    history: [], // For tracking performance trends
    recentlyUsedSentences: [], // Track last 15 sentences to avoid repetition
    preferences: {      guestName: '',      favoriteThemes: [],
      personalization: {
        useName: true,
        useLocation: true,
        adaptiveDifficulty: true,
      },
    },
  };
}

function saveLocalStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {}
}

export function useStats(user) {
  const [stats, setStats] = useState(loadLocalStats);
  const [newAchievements, setNewAchievements] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(null);

  // Load stats from Firebase when user logs in
  useEffect(() => {
    async function syncFromCloud() {
      if (!user) return;
      
      setSyncing(true);
      const cloudStats = await getUserProfile(user.uid);
      
      if (cloudStats) {
        // Merge local and cloud stats (take the best)
        setStats(prev => {
          const merged = {
            totalGames: Math.max(prev.totalGames, cloudStats.totalGames || 0),
            bestLevel: Math.max(prev.bestLevel, cloudStats.bestLevel || 0),
            bestWpm: Math.max(prev.bestWpm, cloudStats.bestWpm || 0),
            bestCombo: Math.max(prev.bestCombo, cloudStats.bestCombo || 0),
            bestAccuracy: Math.max(prev.bestAccuracy || 0, cloudStats.bestAccuracy || 0),
            totalLevels: Math.max(prev.totalLevels, cloudStats.totalLevels || 0),
            unlockedAchievements: [...new Set([
              ...(prev.unlockedAchievements || []),
              ...(cloudStats.achievements || [])
            ])],
            history: cloudStats.history || prev.history || [],
            recentlyUsedSentences: cloudStats.recentlyUsedSentences || prev.recentlyUsedSentences || [],
            preferences: cloudStats.preferences || prev.preferences || {
              guestName: '',
              favoriteThemes: [],
              personalization: {
                useName: false,
                useLocation: false,
                adaptiveDifficulty: true,
              },
            },
            lastPlayed: Date.now(),
          };
          saveLocalStats(merged);
          return merged;
        });
      }
      
      setSyncing(false);
    }
    
    syncFromCloud();
  }, [user]);

  // Save to local storage whenever stats change
  useEffect(() => {
    saveLocalStats(stats);
  }, [stats]);

  // Sync pending game to Firebase
  useEffect(() => {
    if (!pendingSync || !user) return;

    const { gameStats, updatedStats } = pendingSync;
    const { level, wpm, accuracy, maxCombo, difficulty, perfectStreak, gameMode } = gameStats;

    async function syncToFirebase() {
      try {
        console.log('💾 Syncing to Firebase for user:', user.uid);
        
        // Save user profile
        await saveUserProfile(user.uid, {
          displayName: user.displayName,
          photoURL: user.photoURL,
          ...updatedStats,
          achievements: updatedStats.unlockedAchievements,
        });

        // Submit to leaderboard
        if (gameMode === 'daily') {
          console.log('📅 Submitting daily score');
          await submitDailyScore(user.uid, {
            displayName: user.displayName,
            photoURL: user.photoURL,
            level,
            wpm,
            maxCombo,
          }, getDailyChallengeId());
        } else {
          console.log('🏆 Submitting regular score to leaderboard');
          await submitScore(user.uid, {
            displayName: user.displayName,
            photoURL: user.photoURL,
            level,
            wpm,
            maxCombo,
            difficulty,
          });
        }

        console.log('✅ Firebase sync complete!');
        setPendingSync(null); // Clear pending
      } catch (err) {
        console.error('❌ Firebase sync failed:', err);
      }
    }

    syncToFirebase();
  }, [pendingSync, user]);

  const recordGame = useCallback((gameStats) => {
    console.log('🎮 recordGame called with:', gameStats);
    console.log('👤 Current user:', user ? user.uid : 'NOT LOGGED IN');
    
    const { level, wpm, accuracy, maxCombo, difficulty, perfectStreak, gameMode, storyId, isStoryComplete, sentencesUsed } = gameStats;
    
    setStats(prev => {
      const updated = {
        ...prev,
        totalGames: prev.totalGames + 1,
        bestLevel: Math.max(prev.bestLevel, level),
        bestWpm: Math.max(prev.bestWpm, wpm),
        bestCombo: Math.max(prev.bestCombo, maxCombo),
        bestAccuracy: Math.max(prev.bestAccuracy || 0, accuracy || 0),
        totalLevels: prev.totalLevels + level,
        lastPlayed: Date.now(),
      };
      
      // Handle story completion
      if (isStoryComplete && storyId) {
        updated[`story_${storyId}Unlocked`] = true;
      }

      // Add to history (keep last 20 games)
      const newHistory = [...(prev.history || []), level].slice(-20);
      updated.history = newHistory;

      // Add to recently used sentences (keep last 15)
      if (sentencesUsed && sentencesUsed.length > 0) {
        const newRecent = [...(prev.recentlyUsedSentences || []), ...sentencesUsed]
          .slice(-15);
        updated.recentlyUsedSentences = newRecent;
      }

      // Check for new achievements
      const checkStats = {
        level,
        wpm,
        maxCombo,
        difficulty,
        perfectStreak,
        gameMode,
        totalGames: updated.totalGames,
        // Pass the story completion flags to the achievement checker
        ...updated, 
      };

      const newlyUnlocked = getNewAchievements(checkStats, prev.unlockedAchievements);
      
      if (newlyUnlocked.length > 0) {
        updated.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newlyUnlocked.map(a => a.id),
        ];
        setNewAchievements(newlyUnlocked);
      }

      // Store pending sync data for Firebase
      setPendingSync({
        gameStats: {
          level,
          wpm,
          maxCombo,
          difficulty,
          perfectStreak,
          gameMode,
          storyId,
          isStoryComplete,
        },
        updatedStats: updated,
      });

      return updated;
    });
  }, [user]);

  const recordPractice = useCallback((practiceStats) => {
    setStats(prev => {
      const updated = {
        ...prev,
        totalPractice: (prev.totalPractice || 0) + practiceStats.totalTyped,
        practicePerfect: (prev.practicePerfect || 0) + practiceStats.correct,
      };

      const checkStats = {
        totalPractice: updated.totalPractice,
        practicePerfect: updated.practicePerfect,
        gameMode: 'practice',
        totalGames: updated.totalGames
      };

      const newlyUnlocked = getNewAchievements(checkStats, prev.unlockedAchievements);
      
      if (newlyUnlocked.length > 0) {
        updated.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newlyUnlocked.map(a => a.id),
        ];
        // Combine new achievements with existing ones pending display
        setNewAchievements(prevNew => [...prevNew, ...newlyUnlocked]);
      }

      return updated;
    });
  }, []);

  const recordKonami = useCallback(() => {
    setStats(prev => {
      if (prev.konamiCodeUnlocked) return prev; // Already unlocked
      
      const updated = {
        ...prev,
        konamiCodeUnlocked: true,
      };

      const checkStats = {
        konamiCodeUnlocked: true,
      };

      const newlyUnlocked = getNewAchievements(checkStats, prev.unlockedAchievements);
      
      if (newlyUnlocked.length > 0) {
        updated.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newlyUnlocked.map(a => a.id),
        ];
        setNewAchievements(prevNew => [...prevNew, ...newlyUnlocked]);
      }

      // We should probably save the user profile as well if logged in, just stringifying here for now
      return updated;
    });
  }, []);

  const recordEasterEgg = useCallback((eggId) => {
    setStats(prev => {
      const stateKey = `${eggId}Unlocked`;
      if (prev[stateKey]) return prev;
      
      const updated = {
        ...prev,
        [stateKey]: true,
      };

      const checkStats = {
        [stateKey]: true,
      };

      const newlyUnlocked = getNewAchievements(checkStats, prev.unlockedAchievements);
      
      if (newlyUnlocked.length > 0) {
        updated.unlockedAchievements = [
          ...prev.unlockedAchievements,
          ...newlyUnlocked.map(a => a.id),
        ];
        setNewAchievements(prevNew => [...prevNew, ...newlyUnlocked]);
      }

      return updated;
    });
  }, []);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  const updatePreference = useCallback((key, value) => {
    setStats(prev => {
      const updated = {
        ...prev,
        preferences: {
          ...(prev.preferences || {
            favoriteThemes: [],
            personalization: {
              useName: false,
              useLocation: false,
              adaptiveDifficulty: true,
            },
          }),
          [key]: value,
        },
      };
      saveLocalStats(updated);
      return updated;
    });
  }, []);

  const updatePersonalization = useCallback((personalizationKey, value) => {
    setStats(prev => {
      const updated = {
        ...prev,
        preferences: {
          ...prev.preferences,
          personalization: {
            ...(prev.preferences?.personalization || {
              useName: false,
              useLocation: false,
              adaptiveDifficulty: true,
            }),
            [personalizationKey]: value,
          },
        },
      };
      saveLocalStats(updated);
      return updated;
    });
  }, []);

  const toggleFavoriteTheme = useCallback((theme) => {
    setStats(prev => {
      const current = prev.preferences?.favoriteThemes || [];
      const updated = {
        ...prev,
        preferences: {
          ...prev.preferences,
          favoriteThemes: current.includes(theme)
            ? current.filter(t => t !== theme)
            : [...current, theme],
        },
      };
      saveLocalStats(updated);
      return updated;
    });
  }, []);

  return {
    stats,
    newAchievements,
    syncing,
    recordGame,
    recordPractice,
    recordKonami,
    recordEasterEgg,
    clearNewAchievements,
    updatePreference,
    updatePersonalization,
    toggleFavoriteTheme,
  };
}
