import { useState } from 'react';
import { THEMES, applyTheme } from '../config/themes';
import { ACHIEVEMENTS } from '../config/achievements';

export function StatsDialog({ stats, onClose, user, selectedTheme, onThemeChange, readOnly = false }) {
  const [showChart] = useState(true);

  // Calculate derived stats
  const totalGames = stats.totalGames || 0;
  const bestLevel = stats.bestLevel || 0;
  const bestWpm = stats.bestWpm || 0;
  const bestCombo = stats.bestCombo || 0;
  const bestAccuracy = stats.bestAccuracy || 0;
  const avgLevel = totalGames > 0 ? Math.round(stats.totalLevels / totalGames) : 0;

  // Create simple chart
  const renderChart = () => {
    const history = stats.history || [];
    if (history.length < 2) {
      if (bestLevel === 0) return null;
      return (
        <div className="flex items-end justify-center gap-1 h-32 bg-[var(--color-bone)]/5 p-4 rounded border border-[var(--color-bone)]/10">
          <div className="text-[var(--color-bone)]/40 text-xs text-center italic">
            {readOnly ? 'No performance trend available yet...' : 'Play more games to see your performance graph...'}
          </div>
        </div>
      );
    }

    const width = 300;
    const height = 120;
    const maxVal = Math.max(...history, 5); // Minimum height of 5
    const padding = 10;
    
    // Points for SVG
    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * (width - 2 * padding) + padding;
      const y = height - ((val / maxVal) * (height - 2 * padding) + padding);
      return { x, y, val };
    });

    // Create polyline string
    const pathData = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded overflow-hidden pt-4 pb-2 px-2">
        <div className="relative h-32 flex items-center justify-center">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-[0_0_8px_rgba(220,20,60,0.3)]">
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p) => (
              <line 
                key={p} 
                x1="0" y1={height * p} 
                x2={width} y2={height * p} 
                stroke="var(--color-bone)" 
                strokeOpacity="0.05" 
                strokeWidth="1"
              />
            ))}
            
            {/* Performance line */}
            <polyline
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={pathData}
            />
            
            {/* Area under line */}
            <polygon
              points={`${points[points.length-1].x},${height} ${points[0].x},${height} ${pathData}`}
              fill="url(#area-gradient)"
              opacity="0.3"
            />

            {/* Points with color indicators */}
            {points.map((p, i) => {
              const prev = points[i-1];
              const isUp = !prev || p.val >= prev.val;
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r="2.5"
                  fill={isUp ? '#4ade80' : '#f87171'} // Green if up, red if down
                  className="transition-all hover:r-4 cursor-help"
                >
                  <title>Lvl {p.val}</title>
                </circle>
              );
            })}

            {/* Definitions for gradients */}
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#f87171" />
                <stop offset="100%" stopColor="#4ade80" />
              </linearGradient>
              <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-bone)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--color-bone)" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
          
          <div className="absolute top-0 right-2 text-[10px] text-[var(--color-bone)]/40 uppercase tracking-widest font-bold">
            Live Trend
          </div>
        </div>
        <div className="flex justify-between px-2 mt-2">
          <div className="text-[10px] text-[var(--color-bone)]/30 uppercase">Previous Sessions</div>
          <div className="text-[10px] text-[var(--color-bone)]/30 uppercase">Current</div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4">
      <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg max-w-md w-full p-8 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-bone)]">
            {readOnly ? `📊 ${user?.displayName || 'Survivor'}'s Stats` : '📊 Your Stats'}
          </h2>
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

        {/* Fancy Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Best Level */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#dc143c]/30 rounded-xl p-4 group hover:border-[#dc143c] transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🏆</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Best Level</div>
            <div className="text-3xl font-bold bg-gradient-to-r from-[#dc143c] to-[#f5f5dc] bg-clip-text text-transparent group-hover:scale-110 origin-left transition-transform duration-300">{bestLevel}</div>
          </div>

          {/* Games Played */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-blue-500/30 rounded-xl p-4 group hover:border-blue-500 transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🎮</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Games Played</div>
            <div className="text-3xl font-bold text-blue-400 group-hover:scale-110 origin-left transition-transform duration-300">{totalGames}</div>
          </div>

          {/* Best WPM */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-yellow-500/30 rounded-xl p-4 group hover:border-yellow-500 transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">⌨️</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Best WPM</div>
            <div className="text-3xl font-bold text-yellow-500 group-hover:scale-110 origin-left transition-transform duration-300">{bestWpm}</div>
          </div>

          {/* Best Combo */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-orange-500/30 rounded-xl p-4 group hover:border-orange-500 transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🔥</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Best Combo</div>
            <div className="text-3xl font-bold text-orange-500 group-hover:scale-110 origin-left transition-transform duration-300">{bestCombo}</div>
          </div>

          {/* Best Accuracy */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-cyan-500/30 rounded-xl p-4 group hover:border-cyan-500 transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">🎯</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Best Accuracy</div>
            <div className="text-3xl font-bold text-cyan-400 group-hover:scale-110 origin-left transition-transform duration-300">{bestAccuracy}%</div>
          </div>

          {/* Average Level */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-purple-500/30 rounded-xl p-4 group hover:border-purple-500 transition-all duration-300">
            <div className="absolute -right-2 -top-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-4xl">📊</span>
            </div>
            <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Avg Level</div>
            <div className="text-3xl font-bold text-purple-400 group-hover:scale-110 origin-left transition-transform duration-300">{avgLevel}</div>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[var(--color-bone)]/10 rounded-xl p-4 group col-span-2">
             <div className="flex justify-between items-center">
              <div>
                <div className="text-[var(--color-bone)]/60 text-[10px] uppercase tracking-widest mb-1 font-bold">Total Power Tapped</div>
                <div className="text-2xl font-bold text-[var(--color-bone)]">{stats.totalLevels || 0} Levels</div>
              </div>
              <div className="text-right">
                <div className="text-[var(--color-bone)]/30 text-[8px] uppercase tracking-[0.2em]">Efficiency</div>
                <div className="text-sm font-bold text-green-500">{(bestAccuracy * 0.8 + (bestWpm/10)).toFixed(1)} Pts</div>
              </div>
             </div>
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
        <div className="mb-6">
          <h3 className="text-[var(--color-bone)]/60 text-sm mb-3 uppercase tracking-wider">
            ACHIEVEMENTS ({stats.unlockedAchievements?.length || 0} / {Object.keys(ACHIEVEMENTS).length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.values(ACHIEVEMENTS).map((achievement) => {
              const isUnlocked = stats.unlockedAchievements?.includes(achievement.id);
              
              return (
                <div
                  key={achievement.id}
                  className={`w-10 h-10 rounded flex items-center justify-center text-lg border transition-all duration-300 cursor-help relative group ${
                    isUnlocked
                      ? 'bg-yellow-900/30 border-yellow-600/50'
                      : 'bg-black/40 border-white/5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'
                  }`}
                  title={`${achievement.name}: ${achievement.description}${isUnlocked ? ' (UNLOCKED)' : ' (LOCKED)'}`}
                >
                  <span className={isUnlocked ? "" : "opacity-30"}>
                    {achievement.icon}
                  </span>
                  {!isUnlocked && (
                    <div className="absolute -top-1 -right-1 text-[8px]">🔒</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Selector */}
        {!readOnly && (
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
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[var(--color-bone)]/20 hover:bg-[var(--color-bone)]/30 text-[var(--color-bone)] py-3 rounded font-semibold transition-colors"
        >
          {readOnly ? 'Back to Leaderboard' : 'Close'}
        </button>
      </div>
    </div>
  );
}
