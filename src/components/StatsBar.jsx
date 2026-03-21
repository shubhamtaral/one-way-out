export function StatsBar({ level, mistakes, maxMistakes, bestScore, timeLeft, maxTime, combo, wpm, streakMultiplier, gameMode, endlessLives }) {
  const timePercent = (timeLeft / maxTime) * 100;
  const isLowTime = timeLeft <= 3;
  const isEndless = gameMode === 'endless';
  
  // Calculate multiplier color
  const getMultiplierColor = () => {
    if (streakMultiplier >= 2) return 'text-red-400';
    if (streakMultiplier >= 1.5) return 'text-orange-400';
    if (streakMultiplier > 1) return 'text-yellow-400';
    return 'text-[var(--color-bone)]/40';
  };
  
  return (
    <div className="space-y-4">
      {/* Timer bar - hide for endless mode */}
      {!isEndless && (
        <div className="w-full h-2 bg-[var(--color-bone)]/10 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-100 ${
              isLowTime 
                ? 'bg-[var(--color-blood-bright)] animate-pulse' 
                : 'bg-[var(--color-bone)]/40'
            }`}
            style={{ width: `${timePercent}%` }}
          />
        </div>
      )}

      {/* Stats row */}
      <div className="flex flex-wrap justify-between items-center text-xs md:text-base opacity-70 gap-2">
        {/* Left side - Level, Best, Combo */}
        <div className="flex gap-3 md:gap-6">
          <span>
            {isEndless ? 'SENTENCES' : 'LVL'} 
            <span className="text-[var(--color-bone)] font-bold ms-1">
              {level}
            </span>
          </span>
          {!isEndless && <span>BEST <span className="text-green-400 font-bold">{bestScore}</span></span>}
          {combo > 1 && (
            <span className="text-yellow-400 animate-pulse">
              🔥 x{combo}
            </span>
          )}
          {streakMultiplier > 1 && (
            <span className={`${getMultiplierColor()} animate-pulse`}>
              ⚡ {streakMultiplier.toFixed(1)}x
            </span>
          )}
        </div>

        {/* Center - Timer and WPM */}
        {!isEndless && (
          <div className="flex gap-3 md:gap-6 items-center">
            <span className={`font-mono text-base md:text-lg ${isLowTime ? 'text-[var(--color-blood-bright)] animate-pulse font-bold' : ''}`}>
              {timeLeft.toFixed(1)}s
            </span>
            {wpm > 0 && (
              <span className="text-[var(--color-bone)]/60">
                {wpm} <span className="text-xs">WPM</span>
              </span>
            )}
          </div>
        )}
        
        {/* Right side - WPM and Lives */}
        <div className="flex items-center gap-4">
          {isEndless && wpm > 0 && (
            <span className="text-[var(--color-bone)]/60">
              {wpm} <span className="text-xs">WPM</span>
            </span>
          )}
          <div className="flex gap-1">
            {Array.from({ length: isEndless ? 5 : maxMistakes }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full transition-colors duration-200 ${
                  isEndless 
                    ? (i < endlessLives ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-[var(--color-bone)]/20')
                    : (i < (maxMistakes - mistakes) ? 'bg-[var(--color-blood-bright)] shadow-[0_0_8px_var(--color-blood-bright)]' : 'bg-[var(--color-bone)]/20')
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
