import { useState } from 'react';
import { THEMES, applyTheme } from '../config/themes';
import { ACHIEVEMENTS } from '../config/achievements';
import { setGlobalVolume } from '../hooks/useSound';

export function SettingsDialog({ 
  onClose, 
  stats, 
  user, 
  onSignOut,
  selectedTheme, 
  onThemeChange, 
  updatePreference, 
  updatePersonalization, 
  toggleFavoriteTheme,
  onOpenPractice,
  onOpenCredits
}) {
  const [activeTab, setActiveTab] = useState('themes'); // themes, personalization, audio
  const [guestName, setGuestName] = useState('');
  const [showGuestNamePrompt, setShowGuestNamePrompt] = useState(false);

  const currentVolume = stats.preferences?.volume ?? 0.5;

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    updatePreference('volume', newVolume);
    setGlobalVolume(newVolume);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg max-w-md w-full p-8 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-bone)] uppercase tracking-widest">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-bone)]/40 hover:text-[var(--color-bone)] text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--color-bone)]/10 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap px-4 ${
              activeTab === 'themes' 
                ? 'text-[var(--color-bone)] border-b-2 border-[var(--color-bone)]' 
                : 'text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60'
            }`}
          >
            Themes
          </button>
          <button
            onClick={() => setActiveTab('personalization')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap px-4 ${
              activeTab === 'personalization' 
                ? 'text-[var(--color-bone)] border-b-2 border-[var(--color-bone)]' 
                : 'text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60'
            }`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap px-4 ${
              activeTab === 'audio' 
                ? 'text-[var(--color-bone)] border-b-2 border-[var(--color-bone)]' 
                : 'text-[var(--color-bone)]/40 hover:text-[var(--color-bone)]/60'
            }`}
          >
            Audio
          </button>
        </div>

        {/* Content Area */}
        <div className="mb-8 min-h-[200px]">
          {activeTab === 'themes' && (
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
          )}

          {activeTab === 'personalization' && (
            <div className="space-y-6">
              {/* Name Personalization */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[var(--color-bone)]/60 text-xs uppercase tracking-widest">Use My Name</div>
                  <div className="text-[10px] text-[var(--color-bone)]/40 mt-1">
                    {!user ? 'Play as guest with a name' : 'Include your name in sentences'}
                  </div>
                </div>
                <label className="relative inline-block w-10 h-5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={stats.preferences?.personalization?.useName || false}
                    onChange={(e) => {
                      if (!user && e.target.checked) {
                        setShowGuestNamePrompt(true);
                      } else {
                        updatePersonalization('useName', e.target.checked);
                      }
                    }}
                  />
                  <div className="w-full h-full bg-[var(--color-bone)]/20 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 bg-white border border-[var(--color-bone)]/20 rounded-full h-4 w-4 transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Guest Name Prompt Modal (inline-ish or as a separate layer) */}
              {showGuestNamePrompt && (
                <div className="p-4 bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/20 rounded mt-2">
                  <h4 className="text-[var(--color-bone)] text-xs font-bold mb-2 uppercase tracking-widest">Enter Your Name</h4>
                  <input
                    type="text"
                    className="w-full bg-black/50 border border-[var(--color-bone)]/30 rounded px-3 py-2 text-[var(--color-bone)] mb-3 text-sm focus:outline-none focus:border-[var(--color-bone)]"
                    placeholder="Your name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      className="flex-1 bg-[var(--color-bone)]/20 hover:bg-[var(--color-bone)]/30 text-[var(--color-bone)] py-1.5 rounded text-xs font-bold uppercase"
                      onClick={() => {
                        if (guestName.trim()) {
                          updatePreference('guestName', guestName.trim());
                          updatePersonalization('useName', true);
                          setShowGuestNamePrompt(false);
                          setGuestName('');
                        }
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="flex-1 bg-[var(--color-bone)]/10 hover:bg-[var(--color-bone)]/20 text-[var(--color-bone)]/60 py-1.5 rounded text-xs font-bold uppercase"
                      onClick={() => {
                        setShowGuestNamePrompt(false);
                        setGuestName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Location Personalization */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[var(--color-bone)]/60 text-xs uppercase tracking-widest">Use Location</div>
                  <div className="text-[10px] text-[var(--color-bone)]/40 mt-1">Add location context (if available)</div>
                </div>
                <label className="relative inline-block w-10 h-5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={stats.preferences?.personalization?.useLocation || false}
                    onChange={(e) => {
                      updatePersonalization('useLocation', e.target.checked);
                    }}
                  />
                  <div className="w-full h-full bg-[var(--color-bone)]/20 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 bg-white border border-[var(--color-bone)]/20 rounded-full h-4 w-4 transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Adaptive Difficulty */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[var(--color-bone)]/60 text-xs uppercase tracking-widest">Adaptive Difficulty</div>
                  <div className="text-[10px] text-[var(--color-bone)]/40 mt-1">Adjust sentence difficulty based on your performance</div>
                </div>
                <label className="relative inline-block w-10 h-5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={stats.preferences?.personalization?.adaptiveDifficulty ?? true}
                    onChange={(e) => {
                      updatePersonalization('adaptiveDifficulty', e.target.checked);
                    }}
                  />
                  <div className="w-full h-full bg-[var(--color-bone)]/20 rounded-full peer peer-checked:bg-green-500 transition-colors"></div>
                  <div className="absolute top-0.5 left-0.5 bg-white border border-[var(--color-bone)]/20 rounded-full h-4 w-4 transition-transform peer-checked:translate-x-5"></div>
                </label>
              </div>

              {/* Favorite Themes */}
              <div>
                <div className="text-[var(--color-bone)]/60 text-xs uppercase tracking-widest mb-3">Favorite Themes</div>
                <div className="flex flex-wrap gap-2">
                  {['paranormal', 'technology', 'psychological', 'body_horror', 'suspense', 'existential'].map(theme => (
                    <button
                      key={theme}
                      className={`px-3 py-1.5 text-[10px] rounded border transition-all uppercase tracking-widest font-bold ${
                        stats.preferences?.favoriteThemes?.includes(theme)
                          ? 'border-green-500 bg-green-500/20 text-green-400'
                          : 'border-[var(--color-bone)]/30 hover:border-[var(--color-bone)]/60 text-[var(--color-bone)]/60'
                      }`}
                      onClick={() => {
                        toggleFavoriteTheme(theme);
                      }}
                    >
                      {theme.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[var(--color-bone)]/60 text-xs uppercase tracking-widest">Master Volume</div>
                  <div className="text-[var(--color-bone)] font-bold text-sm">{Math.round(currentVolume * 100)}%</div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={currentVolume}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-[var(--color-bone)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--color-bone)]"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-[var(--color-bone)]/20 text-[10px]">SILENT</span>
                  <span className="text-[var(--color-bone)]/20 text-[10px]">MAX</span>
                </div>
              </div>
              
              <div className="p-4 bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/10 rounded">
                <p className="text-[10px] text-[var(--color-bone)]/40 italic leading-relaxed">
                  Audio settings are applied globally to all procedural horror soundscapes and feedback effects.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Home Page Features Moved Here */}
        <div className="space-y-3 pt-6 border-t border-[var(--color-bone)]/10">
          <button
            onClick={() => {
              onClose();
              onOpenPractice();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-8 border border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10 transition-all text-xs font-bold tracking-widest uppercase"
          >
            📚 Launch Practice Mode
          </button>
          
          <button
            onClick={() => {
              onClose();
              onOpenCredits();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-8 border border-[var(--color-bone)]/30 text-[var(--color-bone)]/60 hover:border-[var(--color-bone)]/60 hover:text-[var(--color-bone)] transition-all text-xs font-bold tracking-widest uppercase"
          >
            📜 View Credits
          </button>

          {/* Sign Out Button in Settings */}
          {user && (
            <button
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-8 border border-red-500/30 text-red-500/60 hover:border-red-500/60 hover:text-red-500 transition-all text-xs font-bold tracking-widest uppercase mt-4"
            >
              🚪 Sign Out
            </button>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-[var(--color-bone)]/10 hover:bg-[var(--color-bone)]/20 text-[var(--color-bone)]/60 py-3 rounded font-bold uppercase tracking-[0.2em] text-[10px] mt-6 transition-colors"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
}
