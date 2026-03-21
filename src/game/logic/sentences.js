import sentences from '../../data/sentences.json';
import { getMinSentenceLevel } from '../../config/difficulty';

/**
 * Apply personalization to a sentence (inserting user name)
 * @param {string} text - The original sentence text
 * @param {string} userName - The name to insert
 * @param {number} level - Current level (to control intensity)
 * @returns {string} - The personalized sentence
 */
export function personalizeSentence(text, userName, level = 1) {
  if (!userName || !text) return text;

  // Keywords that can be replaced with the user's name
  const patterns = [
    { regex: /my name/gi, replacement: userName },
    { regex: /your name/gi, replacement: userName },
    { regex: /the name/gi, replacement: `the name ${userName}` },
    { regex: /is yours/gi, replacement: `is ${userName}'s` },
    { regex: /calls me/gi, replacement: `calls ${userName}` },
    { regex: /prints your/gi, replacement: `prints ${userName}'s` },
    { regex: /shows only my/gi, replacement: `shows only ${userName}'s` },
    { regex: /I see you/gi, replacement: `I see you, ${userName}` },
    { regex: /know my name/gi, replacement: `know your name, ${userName}` },
    { regex: /you/gi, replacement: userName, chance: 0.1 }, // Low chance for general pronoun replacement
  ];

  let result = text;
  let personalized = false;

  for (const pattern of patterns) {
    if (pattern.regex.test(result)) {
      // If it has a chance, roll for it
      if (pattern.chance !== undefined && Math.random() > pattern.chance) {
        continue;
      }
      
      result = result.replace(pattern.regex, pattern.replacement);
      personalized = true;
    }
  }

  // If we haven't personalized yet, occasionally prepend/append the name
  // Frequency increases with level (max 70% at lvl 50)
  const frequency = Math.min(0.2, (level / 50) * 0.7);
  if (!personalized && Math.random() < frequency) {
    const templates = [
      `${userName}...`,
      `${userName}, look behind you.`,
      `Where are you, ${userName}?`,
      `I'm coming for you, ${userName}.`,
      `Is that you, ${userName}?`,
      `${userName}, don't stop typing.`,
    ];
    result = templates[Math.floor(Math.random() * templates.length)];
  }

  return result;
}

export function getSentenceForLevel(
  level,
  difficulty,
  sentencePool = null,
  lastSentenceText = null,
  wpm = 0,
  rng = Math.random,
  poolOverride = null,
  recentlyUsedSentences = [],
  userName = null
) {
  const pool = poolOverride || sentencePool || sentences;

  if (sentencePool) {
    // Daily challenge: use sentences in order
    const index = Math.min(level - 1, pool.length - 1);
    const selected = pool[index];
    return { ...selected, text: personalizeSentence(selected.text, userName, level) };
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
  // We keep at least 1 option if filtering would empty the list
  if (recentlyUsedSentences.length > 0 && available.length > 1) {
    const filtered = available.filter((s) => !recentlyUsedSentences.includes(s.text));
    if (filtered.length > 0) {
      available = filtered;
    }
  }

  // If filtering left us with too few options, we still want variety
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
      return { ...s, text: personalizeSentence(s.text, userName, level) };
    }
  }

  // Fallback: return first from top half
  return { ...topHalf[0], text: personalizeSentence(topHalf[0].text, userName, level) };
}

