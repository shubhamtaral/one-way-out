import sentences from '../../data/sentences.json';
import { getMinSentenceLevel } from '../../config/difficulty';

export function getSentenceForLevel(
  level,
  difficulty,
  sentencePool = null,
  lastSentenceText = null,
  wpm = 0,
  rng = Math.random,
  poolOverride = null,
  recentlyUsedSentences = []
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

  // Avoid repeating the same sentence (immediate repeat)
  if (lastSentenceText && available.length > 1) {
    available = available.filter((s) => s.text !== lastSentenceText);
  }

  // Avoid recently used sentences (anti-repetition)
  if (recentlyUsedSentences.length > 0 && available.length > 1) {
    available = available.filter((s) => !recentlyUsedSentences.includes(s.text));
  }

  // If filtering left us with too few options, relax constraints
  if (available.length < 3) {
    // Fall back to pool without recent filtering
    available = pool.filter((s) => s.level <= effectiveLevel && s.level >= minLevel);
    if (lastSentenceText && available.length > 1) {
      available = available.filter((s) => s.text !== lastSentenceText);
    }
  }

  // Apply variety scoring to prioritize diverse sentences
  const scored = available.map(s => {
    let score = 1; // Base score

    // Prefer sentences with metadata (themes, wordCount)
    if (s.themes && s.themes.length > 0) {
      score += 0.5; // Themed sentences are better
    }

    // Prefer sentences that haven't been used recently (already filtered, but boost)
    if (!recentlyUsedSentences.includes(s.text)) {
      score += 1;
    }

    // Prefer sentences with word count variety (not too common)
    if (s.wordCount >= 3 && s.wordCount <= 6) {
      score += 0.3; // Sweet spot for typing
    }

    // Prefer sentences with different first words
    // (This will be boosted if firstWord is unique in recent history)
    const recentFirstWords = recentlyUsedSentences
      .map(txt => txt.split(/\s+/)[0]?.toLowerCase())
      .filter(Boolean);
    if (!recentFirstWords.includes(s.firstWord)) {
      score += 0.5;
    }

    return { ...s, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Take top 50% for final selection (to maintain quality)
  const topHalf = scored.slice(0, Math.max(3, Math.ceil(scored.length / 2)));
  
  // Weighted random selection from top half (higher score = higher weight)
  const totalWeight = topHalf.reduce((sum, s) => sum + s.score, 0);
  let random = rng() * totalWeight;
  
  for (const s of topHalf) {
    random -= s.score;
    if (random <= 0) {
      return s;
    }
  }

  // Fallback: return first from top half
  return topHalf[0];
}

