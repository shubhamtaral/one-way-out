import sentences from '../../data/sentences.json';
import { getMinSentenceLevel } from '../../config/difficulty';

export function getSentenceForLevel(
  level,
  difficulty,
  sentencePool = null,
  lastSentenceText = null,
  wpm = 0,
  rng = Math.random,
  poolOverride = null
) {
  const pool = poolOverride || sentencePool || sentences;

  if (sentencePool) {
    // Daily challenge: use sentences in order
    const index = Math.min(level - 1, pool.length - 1);
    return pool[index];
  }

  const minLevel = getMinSentenceLevel(difficulty);
  let effectiveLevel = Math.max(level, minLevel);

  // Adaptive difficulty: adjust based on WPM
  if (wpm > 100) {
    effectiveLevel = Math.min(effectiveLevel + Math.floor((wpm - 100) / 50), 50);
  } else if (wpm > 0 && wpm < 50) {
    effectiveLevel = Math.max(effectiveLevel - Math.floor((50 - wpm) / 25), minLevel);
  }

  let available = pool.filter((s) => s.level <= effectiveLevel && s.level >= minLevel);
  if (available.length === 0) return pool[0];

  // Avoid repeating the same sentence
  if (lastSentenceText && available.length > 1) {
    available = available.filter((s) => s.text !== lastSentenceText);
  }

  const weighted = available.filter((s) => s.level >= effectiveLevel - 5);
  const finalPool = weighted.length > 0 ? weighted : available;

  return finalPool[Math.floor(rng() * finalPool.length)];
}

