import { useState, useEffect } from 'react';
import { getLeaderboard, getDailyLeaderboard } from '../services/leaderboard';
import { getDailyChallengeId } from '../config/dailyChallenge';

export function Leaderboard({ onClose, currentUserId }) {
  const [tab, setTab] = useState('normal'); // normal, nightmare, daily
  const [timeFilter, setTimeFilter] = useState('global'); // global, daily, weekly, monthly
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      setError(null);
      let results;

      try {
        if (tab === 'daily') {
          const dailyId = getDailyChallengeId();
          results = await getDailyLeaderboard(dailyId);
        } else {
          results = await getLeaderboard(tab, 50, timeFilter);
        }
        setScores(results);
      } catch (e) {
        setScores([]);
        setError('Unable to load leaderboard right now. Your scores are still saved locally and will sync when the connection recovers.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchScores();
  }, [tab, timeFilter]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[#111] border border-[var(--color-bone)]/20 w-full max-w-md max-h-[80vh] rounded-lg overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[var(--color-bone)]/10 bg-gradient-to-r from-transparent via-[var(--color-bone)]/5 to-transparent">
          <h2 className="text-2xl font-bold text-[var(--color-bone)] text-center tracking-widest uppercase italic">
            🏆 Global Hall of Fame
          </h2>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex bg-[#0a0a0a]/50 p-1 mx-4 mt-4 rounded-lg border border-[var(--color-bone)]/10">
          {['normal', 'nightmare', 'daily'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t !== 'daily') setTimeFilter('global');
              }}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-tighter transition-all rounded-md ${
                tab === t
                  ? 'bg-[var(--color-bone)]/10 text-[var(--color-bone)] shadow-[0_0_15px_rgba(245,245,220,0.1)]'
                  : 'text-[var(--color-bone)]/30 hover:text-[var(--color-bone)]/50'
              }`}
            >
              {t === 'daily' ? '📅 Daily' : t}
            </button>
          ))}
        </div>

        {/* Time Filter Tabs */}
        {tab !== 'daily' && (
          <div className="flex px-4 mt-2 gap-2">
            {['global', 'monthly', 'weekly', 'daily'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 text-[9px] uppercase font-bold tracking-widest border transition-all ${
                  timeFilter === tf
                    ? 'border-yellow-500/50 text-yellow-500 bg-yellow-500/5'
                    : 'border-transparent text-[var(--color-bone)]/30 hover:text-[var(--color-bone)]/50'
                }`}
              >
                {tf === 'global' ? 'All Time' : tf}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 text-[10px] text-red-500 bg-red-900/10 border border-red-500/20 rounded uppercase tracking-widest">
            ⚠️ {error}
          </div>
        )}

        {/* Scores */}
        <div className="overflow-y-auto max-h-[45vh] p-4 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-8 h-8 border-2 border-[var(--color-bone)]/20 border-t-[var(--color-bone)] rounded-full animate-spin"></div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-bone)]/40">Synchronizing...</div>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-3xl mb-2 opacity-20">💀</div>
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-bone)]/30 italic">
                No survivors yet. Be the first to transcend.
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.map((score, index) => {
                const isTop3 = index < 3;
                const isUser = score.userId === currentUserId;
                
                return (
                  <div
                    key={score.id}
                    className={`group relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                      isUser 
                        ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
                        : isTop3 
                          ? 'bg-gradient-to-r from-[var(--color-bone)]/5 to-transparent border-[var(--color-bone)]/10 hover:border-[var(--color-bone)]/30'
                          : 'bg-transparent border-transparent hover:bg-[var(--color-bone)]/5'
                    }`}
                  >
                    {/* Rank Indicator */}
                    <div className={`w-8 text-center text-lg font-black italic tracking-tighter ${
                      index === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' :
                      index === 1 ? 'text-slate-300' :
                      index === 2 ? 'text-amber-700' :
                      'text-[var(--color-bone)]/20 group-hover:text-[var(--color-bone)]/40'
                    }`}>
                      {index === 0 ? '01' : index === 1 ? '02' : index === 2 ? '03' : `#${index + 1}`}
                    </div>
  
                    {/* Avatar with status ring */}
                    <div className="relative">
                      {score.photoURL ? (
                        <img 
                          src={score.photoURL} 
                          alt="" 
                          className={`w-10 h-10 rounded-full border-2 transition-transform group-hover:scale-110 ${
                            isTop3 ? 'border-yellow-500/50' : 'border-transparent'
                          }`}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-bone)]/10 flex items-center justify-center text-lg border border-[var(--color-bone)]/20">
                          {index === 0 ? '👑' : '👤'}
                        </div>
                      )}
                      {isUser && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#111] flex items-center justify-center text-[8px]">✓</div>}
                    </div>
  
                    {/* Name & Title */}
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate tracking-wide ${isUser ? 'text-yellow-400' : 'text-[var(--color-bone)]'}`}>
                        {score.displayName}
                        {isTop3 && index === 0 && <span className="ml-2 text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded uppercase font-black">Undefeated</span>}
                      </div>
                      <div className="text-[10px] text-[var(--color-bone)]/30 uppercase tracking-tighter">
                        {score.wpm} WPM • {score.maxCombo || 0} Combo
                      </div>
                    </div>
  
                    {/* Level Visual */}
                    <div className="text-right">
                      <div className={`text-xl font-black ${isTop3 ? 'text-white' : 'text-[var(--color-bone)]/60'}`}>
                        <span className="text-[10px] font-normal opacity-50 mr-1 uppercase">Lvl</span>
                        {score.level}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
  
        {/* Footer */}
        <div className="p-6 bg-gradient-to-t from-[var(--color-bone)]/5 to-transparent border-t border-[var(--color-bone)]/10">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[var(--color-bone)] text-[var(--color-void)] font-black uppercase text-xs tracking-[0.4em] hover:bg-white transition-all active:scale-95"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
