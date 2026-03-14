import { useState, useEffect } from 'react';
import { THEMES, getUnlockedThemes, applyTheme } from '../config/themes';
import { ACHIEVEMENTS } from '../config/achievements';

export function StatsDialog({ stats, onClose, user, selectedTheme, onThemeChange }) {
  const [timeframe, setTimeframe] = useState('all'); // all, week, month
  const [showChart, setShowChart] = useState(true);

  // Calculate derived stats
  const totalGames = stats.totalGames || 0;
  const bestLevel = stats.bestLevel || 0;
  const bestWpm = stats.bestWpm || 0;
  const bestCombo = stats.bestCombo || 0;
  const avgLevel = totalGames > 0 ? Math.round(stats.totalLevels / totalGames) : 0;

  // Create simple chart
  const renderChart = () => {
    if (bestLevel === 0) return null;

    const height = (bestLevel / 40) * 100; // Normalize to max level 40
    return (
      <div className="flex items-end justify-center gap-1 h-32 bg-[var(--color-bone)]/5 p-4 rounded">
        <div
          style={{ height: `${height}%` }}
          className="w-2 bg-gradient-to-t from-[var(--color-blood-bright)] to-[var(--color-bone)] rounded-t opacity-70"
        />
        <div className="text-[var(--color-bone)]/40 text-xs text-center absolute bottom-2">
          Best: Lvl {bestLevel}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg max-w-md w-full p-8 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-bone)]">📊 Your Stats</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-bone)]/40 hover:text-[var(--color-bone)] text-2xl"
          >
            ✕
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3 mb-6 p-3 bg-[var(--color-bone)]/5 rounded">
            {user.photoURL && (
              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" />
            )}
            <div>
              <p className="font-semibold text-[var(--color-bone)]">{user.displayName}</p>
              <p className="text-xs text-[var(--color-bone)]/60">{user.email}</p>
            </div>
          </div>
        )}

        {/* Main stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Best Level */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Best Level</div>
            <div className="text-2xl font-bold text-[var(--color-blood-bright)]">{bestLevel}</div>
          </div>

          {/* Total Games */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Games Played</div>
            <div className="text-2xl font-bold text-[var(--color-bone)]">{totalGames}</div>
          </div>

          {/* Best WPM */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Best WPM</div>
            <div className="text-2xl font-bold text-yellow-400">{bestWpm}</div>
          </div>

          {/* Best Combo */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Best Combo</div>
            <div className="text-2xl font-bold text-green-400">{bestCombo}</div>
          </div>

          {/* Average Level */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Avg Level</div>
            <div className="text-2xl font-bold text-[var(--color-bone)]">{avgLevel}</div>
          </div>

          {/* Total Levels */}
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded p-4">
            <div className="text-[var(--color-bone)]/60 text-xs mb-1">Total Levels</div>
            <div className="text-2xl font-bold text-[var(--color-bone)]">{stats.totalLevels || 0}</div>
          </div>
        </div>

        {/* Chart */}
        {showChart && (
          <div className="mb-6">
            <h3 className="text-[var(--color-bone)]/60 text-sm mb-3">Performance</h3>
            {renderChart()}
          </div>
        )}

        {/* Achievements section */}
        {stats.unlockedAchievements && stats.unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-[var(--color-bone)]/60 text-sm mb-3">
              Unlocked ({stats.unlockedAchievements.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.unlockedAchievements.slice(0, 8).map((achievementId, idx) => {
                const achievement = ACHIEVEMENTS[achievementId];
                if (!achievement) return null;
                
                return (
                  <div
                    key={idx}
                    className="w-10 h-10 bg-yellow-900/30 rounded flex items-center justify-center text-lg border border-yellow-600/50 cursor-help"
                    title={`${achievement.name}: ${achievement.description}`}
                  >
                    {achievement.icon}
                  </div>
                );
              })}
              {stats.unlockedAchievements.length > 8 && (
                <div className="w-10 h-10 bg-[var(--color-bone)]/5 rounded flex items-center justify-center text-xs text-[var(--color-bone)]/60">
                  +{stats.unlockedAchievements.length - 8}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theme Selector */}
        <div className="mb-6 pb-6 border-b border-[var(--color-bone)]/20">
          <h3 className="text-[var(--color-bone)] font-bold text-sm mb-3">⚙️ Themes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {Object.entries(THEMES).map(([id, theme]) => {
              const isUnlocked = !theme.unlockedBy || (stats.unlockedAchievements?.includes(theme.unlockedBy));
              const isSelected = selectedTheme === id;
              
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (isUnlocked) {
                      applyTheme(id);
                      onThemeChange(id);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`p-2 rounded flex flex-col items-center justify-center text-center transition-all text-sm ${
                    isSelected
                      ? 'border-2 border-[var(--color-bone)] bg-[var(--color-bone)]/10'
                      : isUnlocked
                      ? 'border border-[var(--color-bone)]/30 hover:border-[var(--color-bone)]/60'
                      : 'border border-[var(--color-bone)]/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-lg mb-1">{theme.icon}</div>
                  <div className="text-xs font-bold">{theme.name}</div>
                  {!isUnlocked ? (
                    <div className="text-[10px] text-[var(--color-bone)]/60 mt-1 leading-tight">
                      🔒 {theme.unlockedBy ? ACHIEVEMENTS[theme.unlockedBy]?.description : 'Locked'}
                    </div>
                  ) : isSelected && (
                    <div className="text-[10px] text-green-400 mt-1">✓ Active</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[var(--color-bone)]/20 hover:bg-[var(--color-bone)]/30 text-[var(--color-bone)] py-3 rounded font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
