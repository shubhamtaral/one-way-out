import { useEffect, useState } from 'react';
import { DIFFICULTIES } from '../config/difficulty';
import { hasDailyBeenPlayed, getDailyBest, getTimeUntilNextDaily } from '../config/dailyChallenge';
import { AuthButton } from './AuthButton';
import { Leaderboard } from './Leaderboard';
import { PracticeMode } from './PracticeMode';
import { StatsDialog } from './StatsDialog';
import { CreditsDialog } from './CreditsDialog';
import { ACHIEVEMENTS } from '../config/achievements';

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const SECRET_CREATORS = ['tusharx1143', 'shubhamtaral'];
const SECRET_JUMPSCARE = 'jumpscare';

export function StartScreen({ onStart, onStartDaily, onStartEndless, stats, user, onSignIn, onSignOut, authLoading, selectedTheme, onThemeChange, onRecordPractice, onRecordKonami, onRecordEasterEgg }) {
  const [selectedDifficulty, setSelectedDifficulty] = useState('normal');
  const [flicker, setFlicker] = useState(false);
  const [ready, setReady] = useState(false);
  const [showMode, setShowMode] = useState('main');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showCredits, setShowCredits] = useState(false);

  const dailyPlayed = hasDailyBeenPlayed();
  const dailyBest = getDailyBest();
  const [konamiIndex, setKonamiIndex] = useState(0);
  const [typedBuffer, setTypedBuffer] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!ready) return;
    
    const handleKey = (e) => {
      if (showLeaderboard) return;
      
      if (showMode === 'difficulty') {
        if (e.key === 'Enter' || e.key === ' ') {
          onStart(selectedDifficulty);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          const keys = Object.keys(DIFFICULTIES);
          const idx = keys.indexOf(selectedDifficulty);
          setSelectedDifficulty(keys[Math.max(0, idx - 1)]);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          const keys = Object.keys(DIFFICULTIES);
          const idx = keys.indexOf(selectedDifficulty);
          setSelectedDifficulty(keys[Math.min(keys.length - 1, idx + 1)]);
        } else if (e.key === 'Escape') {
          setShowMode('main');
        }
      }

      // Konami Code logic
      if (showMode === 'main' && !showLeaderboard && !showPractice && !showStats && !showCredits) {
        if (e.key === KONAMI_CODE[konamiIndex]) {
          const newIndex = konamiIndex + 1;
          if (newIndex === KONAMI_CODE.length) {
            // Unlocked Konami!
            if (onRecordKonami) {
              onRecordKonami();
            }
            // Add a visual flash effect for finding the easter egg
            setFlicker(true);
            setTimeout(() => setFlicker(false), 500);
            setKonamiIndex(0); // Reset
          } else {
            setKonamiIndex(newIndex);
          }
        } else {
          setKonamiIndex(0); // Failed sequence, reset
        }
      }

      // Word tracking for other easter eggs
      if (showMode === 'main' && !showLeaderboard && !showPractice && !showStats && e.key.length === 1) {
        setTypedBuffer(prev => {
          const newBuffer = (prev + e.key.toLowerCase()).slice(-20); // Keep last 20 chars
          
          if (SECRET_CREATORS.some(creator => newBuffer.includes(creator))) {
            if (onRecordEasterEgg) onRecordEasterEgg('creator');
            setFlicker(true);
            setTimeout(() => setFlicker(false), 800);
            return ''; // Reset buffer
          }
          
          if (newBuffer.includes(SECRET_JUMPSCARE)) {
            if (onRecordEasterEgg) onRecordEasterEgg('jumpscare');
            setFlicker(true);
            setTimeout(() => setFlicker(false), 200);
            return ''; // Reset buffer
          }
          
          return newBuffer;
        });
      }
    };
    
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onStart, selectedDifficulty, ready, showMode, showLeaderboard, showPractice, showStats, showCredits, konamiIndex, onRecordKonami, onRecordEasterEgg]);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 100);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-8 transition-opacity duration-100 ${flicker ? 'opacity-70' : 'opacity-100'}`}>
      {/* Auth button in top right */}
      <div className="absolute top-4 right-4">
        <AuthButton 
          user={user} 
          onSignIn={onSignIn} 
          onSignOut={onSignOut}
          loading={authLoading}
        />
      </div>

      <h1 className="text-4xl md:text-8xl font-bold tracking-[0.2em] md:tracking-[0.3em] mb-4 text-[var(--color-bone)]">
        ONE WAY OUT
      </h1>
      
      <p className="text-[var(--color-bone)]/40 text-lg md:text-xl mb-12 tracking-widest">
        TYPE OR DIE
      </p>

      {showMode === 'main' && (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={() => setShowMode('difficulty')}
            className="py-4 px-8 border-2 border-[var(--color-bone)] text-[var(--color-bone)] hover:bg-[var(--color-bone)] hover:text-[var(--color-void)] transition-all font-bold tracking-wider text-lg"
          >
            PLAY
          </button>

          <button
            onClick={() => setShowMode('endless')}
            className="py-4 px-8 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-[var(--color-void)] transition-all font-bold tracking-wider text-lg"
          >
            ♾️ ENDLESS MODE
          </button>

          <button
            onClick={() => !dailyPlayed && onStartDaily()}
            disabled={dailyPlayed}
            className={`py-4 px-8 border-2 transition-all font-bold tracking-wider ${
              dailyPlayed
                ? 'border-[var(--color-bone)]/20 text-[var(--color-bone)]/30 cursor-not-allowed'
                : 'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-[var(--color-void)]'
            }`}
          >
            <div>📅 DAILY CHALLENGE</div>
            {dailyPlayed ? (
              <div className="text-xs mt-1 font-normal">
                Completed! Best: Level {dailyBest} • Next in {getTimeUntilNextDaily()}
              </div>
            ) : (
              <div className="text-xs mt-1 font-normal opacity-70">
                Same sentences for everyone today
              </div>
            )}
          </button>

          {/* Practice Mode button */}
          <button
            onClick={() => setShowPractice(true)}
            className="py-3 px-8 border border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 transition-all text-sm tracking-wider"
          >
            📚 PRACTICE MODE
          </button>

          {/* Leaderboard button */}
          <button
            onClick={() => setShowLeaderboard(true)}
            className="py-3 px-8 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 transition-all text-sm tracking-wider"
          >
            🏆 LEADERBOARD
          </button>

          {stats && stats.totalGames > 0 && (
            <button
              onClick={() => setShowStats(true)}
              className="py-3 px-8 border border-[var(--color-bone)]/30 text-[var(--color-bone)]/60 hover:border-[var(--color-bone)]/60 hover:text-[var(--color-bone)] transition-all text-sm tracking-wider"
            >
              📊 YOUR STATS
            </button>
          )}

          <button
            onClick={() => setShowCredits(true)}
            className="py-2 text-[var(--color-bone)]/30 hover:text-[var(--color-bone)]/60 transition-all text-[10px] tracking-[0.3em] uppercase mt-2"
          >
            📜 Credits
          </button>
        </div>
      )}

      {showMode === 'difficulty' && (
        <>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {Object.values(DIFFICULTIES).map((diff) => (
              <button
                key={diff.id}
                onClick={() => {
                  setSelectedDifficulty(diff.id);
                  if (ready) onStart(diff.id);
                }}
                className={`px-6 py-4 border-2 transition-all duration-200 min-w-[140px] ${
                  selectedDifficulty === diff.id
                    ? `border-[var(--color-bone)] ${diff.color} scale-105`
                    : 'border-[var(--color-bone)]/20 text-[var(--color-bone)]/40 hover:border-[var(--color-bone)]/40'
                }`}
              >
                <div className="font-bold tracking-wider">{diff.name}</div>
                <div className="text-xs mt-1 opacity-60">{diff.maxMistakes} lives</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMode('main')}
            className="text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60 text-sm"
          >
            ← Back
          </button>
        </>
      )}

      {showMode === 'endless' && (
        <>
          <div className="mb-6 text-center">
            <h2 className="text-2xl text-purple-500 font-bold mb-2">ENDLESS MODE</h2>
            <p className="text-[var(--color-bone)]/50 text-sm">
              No timer. 10 lives. Type forever.
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8 w-full max-w-xs">
            <button
              onClick={() => {
                if (ready) onStartEndless('normal');
              }}
              className="px-8 py-4 border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-[var(--color-void)] transition-all font-bold tracking-wider text-lg"
            >
              START
            </button>
          </div>

          <button
            onClick={() => setShowMode('main')}
            className="text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60 text-sm"
          >
            ← Back
          </button>
        </>
      )}

      {showMode === 'stats' && stats && (
        <div className="w-full max-w-md">
          <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg p-6 mb-4">
            <h2 className="text-[var(--color-bone)] font-bold text-lg mb-4">Your Stats</h2>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[var(--color-bone)]">{stats.totalGames}</div>
                <div className="text-xs text-[var(--color-bone)]/50">Games Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{stats.bestLevel}</div>
                <div className="text-xs text-[var(--color-bone)]/50">Best Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">{stats.bestWpm}</div>
                <div className="text-xs text-[var(--color-bone)]/50">Best WPM</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-400">{stats.bestCombo}x</div>
                <div className="text-xs text-[var(--color-bone)]/50">Best Combo</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg p-6 mb-4">
            <h2 className="text-[var(--color-bone)] font-bold text-lg mb-4">
              Achievements ({stats.unlockedAchievements?.length || 0})
            </h2>
            
            {stats.unlockedAchievements?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {stats.unlockedAchievements.map(id => {
                  const achievement = ACHIEVEMENTS[id];
                  return achievement ? (
                    <div 
                      key={id} 
                      className="bg-[var(--color-bone)]/10 px-3 py-2 rounded text-sm"
                      title={achievement.description}
                    >
                      {achievement.icon} {achievement.name}
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="text-[var(--color-bone)]/40 text-sm">
                No achievements yet. Keep playing!
              </div>
            )}
          </div>

          <button
            onClick={() => setShowMode('main')}
            className="w-full py-3 text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60 text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {showMode === 'main' && (
        <div className="absolute bottom-8 text-[var(--color-bone)]/20 text-xs text-center">
          <div>type fast • survive long • don't die</div>
          {!user && <div className="mt-2">Sign in to save progress & compete on leaderboard</div>}
        </div>
      )}

      {/* Leaderboard modal */}
      {showLeaderboard && (
        <Leaderboard 
          onClose={() => setShowLeaderboard(false)}
          currentUserId={user?.uid}
        />
      )}

      {/* Practice Mode modal */}
      {showPractice && (
        <PracticeMode
          onClose={() => setShowPractice(false)}
          onRecordPractice={onRecordPractice}
        />
      )}

      {/* Stats Dialog modal */}
      {showStats && (
        <StatsDialog
          stats={stats}
          user={user}
          onClose={() => setShowStats(false)}
          selectedTheme={selectedTheme}
          onThemeChange={onThemeChange}
        />
      )}

      {showCredits && (
        <CreditsDialog 
          onClose={() => setShowCredits(false)} 
        />
      )}
    </div>
  );
}
