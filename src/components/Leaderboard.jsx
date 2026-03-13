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
        <div className="p-4 border-b border-[var(--color-bone)]/10">
          <h2 className="text-xl font-bold text-[var(--color-bone)] text-center">🏆 Leaderboard</h2>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex border-b border-[var(--color-bone)]/10">
          {['normal', 'nightmare', 'daily'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t !== 'daily') setTimeFilter('global');
              }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? 'text-[var(--color-bone)] border-b-2 border-[var(--color-bone)]'
                  : 'text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60'
              }`}
            >
              {t === 'daily' ? '📅 Daily' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Time Filter Tabs */}
        {tab !== 'daily' && (
          <div className="flex border-b border-[var(--color-bone)]/10 text-xs">
            {['global', 'monthly', 'weekly', 'daily'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`flex-1 py-2 font-medium transition-colors ${
                  timeFilter === tf
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60'
                }`}
              >
                {tf === 'global' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 text-xs text-red-400 bg-red-900/30 border-b border-red-800/40">
            {error}
          </div>
        )}

        {/* Scores */}
        <div className="overflow-y-auto max-h-[50vh] p-2">
          {loading ? (
            <div className="text-center py-8 text-[var(--color-bone)]/40">
              Loading...
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-bone)]/40">
              No scores yet. Be the first!
            </div>
          ) : (
            <div className="space-y-1">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`flex items-center gap-3 p-3 rounded ${
                    score.userId === currentUserId
                      ? 'bg-yellow-500/10 border border-yellow-500/30'
                      : 'bg-[var(--color-bone)]/5'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-8 text-center font-bold ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-300' :
                    index === 2 ? 'text-amber-600' :
                    'text-[var(--color-bone)]/40'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>

                  {/* Avatar */}
                  {score.photoURL ? (
                    <img 
                      src={score.photoURL} 
                      alt="" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[var(--color-bone)]/20 flex items-center justify-center text-xs">
                      👤
                    </div>
                  )}

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--color-bone)] text-sm truncate">
                      {score.displayName}
                      {score.userId === currentUserId && (
                        <span className="text-yellow-500 text-xs ml-2">(you)</span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <div className="text-[var(--color-bone)] font-bold">Lvl {score.level}</div>
                    <div className="text-xs text-[var(--color-bone)]/50">{score.wpm} WPM</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="p-4 border-t border-[var(--color-bone)]/10">
          <button
            onClick={onClose}
            className="w-full py-2 text-[var(--color-bone)]/60 hover:text-[var(--color-bone)] text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
