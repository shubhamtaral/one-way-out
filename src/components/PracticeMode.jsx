import { useState, useEffect } from 'react';
import sentences from '../data/sentences.json';

export function PracticeMode({ onClose, onRecordPractice }) {
  const [level, setLevel] = useState(1);
  const [typed, setTyped] = useState('');
  const [currentSentence, setCurrentSentence] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [stats, setStats] = useState({
    totalTyped: 0,
    correct: 0,
    mistakes: 0,
    avgAccuracy: 0,
  });
  const [lastSentenceIndex, setLastSentenceIndex] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState('all'); // 'all' or specific level

  // Get random sentence without repeating last one
  const getRandomSentence = () => {
    const filtered = selectedLevel === 'all' 
      ? sentences 
      : sentences.filter(s => s.level === parseInt(selectedLevel));
    
    if (filtered.length === 0) return null;
    
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * filtered.length);
    } while (randomIndex === lastSentenceIndex && filtered.length > 1);
    
    setLastSentenceIndex(randomIndex);
    return filtered[randomIndex];
  };

  // Load first sentence
  useEffect(() => {
    setCurrentSentence(getRandomSentence());
  }, [selectedLevel]);

  // Calculate accuracy
  const calculateAccuracy = (typed, original) => {
    let correct = 0;
    const minLength = Math.min(typed.length, original.length);
    
    for (let i = 0; i < minLength; i++) {
      if (typed[i] === original[i]) correct++;
    }
    
    return Math.round((correct / original.length) * 100);
  };

  // Handle typing
  const handleType = (e) => {
    const input = e.target.value;
    setTyped(input);

    if (currentSentence) {
      const acc = calculateAccuracy(input, currentSentence.text);
      setAccuracy(acc);
    }
  };

  // Handle next sentence
  const handleNext = () => {
    if (!currentSentence) return;

    const acc = calculateAccuracy(typed, currentSentence.text);
    
    setStats(prev => ({
      totalTyped: prev.totalTyped + 1,
      correct: prev.correct + (acc === 100 ? 1 : 0),
      mistakes: prev.mistakes + (acc === 100 ? 0 : 1),
      avgAccuracy: Math.round((prev.avgAccuracy * prev.totalTyped + acc) / (prev.totalTyped + 1)),
    }));

    setTyped('');
    setAccuracy(null);
    setCurrentSentence(getRandomSentence());
  };

  // Handle key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typed, currentSentence]);

  // Record practice stats before closing
  const handleClose = () => {
    if (onRecordPractice && stats.totalTyped > 0) {
      onRecordPractice(stats);
    }
    onClose();
  };

  if (!currentSentence) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-[var(--color-bone)] mb-4">Practice Mode</h2>
          <p className="text-[var(--color-bone)]/60 mb-6">No levels available for selected filter</p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-[var(--color-bone)]/10 hover:bg-[var(--color-bone)]/20 text-[var(--color-bone)] rounded"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] border border-[var(--color-bone)]/20 rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-bone)]">📚 Practice Mode</h2>
          <button
            onClick={handleClose}
            className="text-[var(--color-bone)]/40 hover:text-[var(--color-bone)] text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Level selector */}
        <div className="mb-6 p-4 bg-[var(--color-bone)]/5 rounded">
          <label className="text-[var(--color-bone)]/60 text-sm mb-3 block">Filter by Level</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedLevel('all')}
              className={`px-4 py-2 rounded text-sm transition-colors ${
                selectedLevel === 'all'
                  ? 'bg-[var(--color-bone)]/20 text-[var(--color-bone)]'
                  : 'bg-[var(--color-bone)]/5 text-[var(--color-bone)]/60 hover:text-[var(--color-bone)]'
              }`}
            >
              All Levels
            </button>
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLevel(String(l))}
                className={`px-4 py-2 rounded text-sm transition-colors ${
                  selectedLevel === String(l)
                    ? 'bg-[var(--color-bone)]/20 text-[var(--color-bone)]'
                    : 'bg-[var(--color-bone)]/5 text-[var(--color-bone)]/60 hover:text-[var(--color-bone)]'
                }`}
              >
                Lvl {l}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center text-sm">
          <div className="bg-[var(--color-bone)]/5 p-3 rounded">
            <div className="text-[var(--color-bone)] font-bold">{stats.totalTyped}</div>
            <div className="text-[var(--color-bone)]/60 text-xs">Practiced</div>
          </div>
          <div className="bg-[var(--color-bone)]/5 p-3 rounded">
            <div className="text-green-400 font-bold">{stats.correct}</div>
            <div className="text-[var(--color-bone)]/60 text-xs">Perfect</div>
          </div>
          <div className="bg-[var(--color-bone)]/5 p-3 rounded">
            <div className="text-red-400 font-bold">{stats.mistakes}</div>
            <div className="text-[var(--color-bone)]/60 text-xs">Mistakes</div>
          </div>
          <div className="bg-[var(--color-bone)]/5 p-3 rounded">
            <div className="text-yellow-400 font-bold">{stats.avgAccuracy}%</div>
            <div className="text-[var(--color-bone)]/60 text-xs">Avg Accuracy</div>
          </div>
        </div>

        {/* Current Sentence */}
        <div className="mb-6">
          <div className="text-[var(--color-bone)]/60 text-xs mb-2">TYPE THIS:</div>
          <div className="bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/20 rounded p-4 mb-4">
            <p className="text-[var(--color-bone)] text-lg leading-relaxed">
              {currentSentence.text}
            </p>
          </div>

          {/* Input */}
          <input
            type="text"
            value={typed}
            onChange={handleType}
            autoFocus
            placeholder="Start typing..."
            className="w-full bg-[var(--color-bone)]/5 border border-[var(--color-bone)]/20 rounded px-4 py-3 text-[var(--color-bone)] placeholder-[var(--color-bone)]/30 focus:outline-none focus:border-[var(--color-bone)]/40"
          />

          {/* Accuracy display */}
          {accuracy !== null && (
            <div className="mt-3 text-center">
              <div className={`inline-block px-4 py-2 rounded text-sm font-bold ${
                accuracy === 100 ? 'bg-green-900/30 text-green-400' :
                accuracy >= 80 ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {accuracy}% Accuracy
              </div>
            </div>
          )}
        </div>

        {/* Next button */}
        <div className="flex gap-3">
          <button
            onClick={handleNext}
            className="flex-1 bg-[var(--color-bone)]/20 hover:bg-[var(--color-bone)]/30 text-[var(--color-bone)] py-3 rounded font-semibold transition-colors"
          >
            Next Sentence (Enter)
          </button>
          <button
            onClick={handleClose}
            className="flex-1 bg-[var(--color-bone)]/5 hover:bg-[var(--color-bone)]/10 text-[var(--color-bone)] py-3 rounded font-semibold transition-colors"
          >
            Done
          </button>
        </div>

        {/* Help text */}
        <p className="text-[var(--color-bone)]/40 text-xs text-center mt-4">
          Press Enter to skip to next sentence
        </p>
      </div>
    </div>
  );
}
