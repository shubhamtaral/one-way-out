/**
 * Procedural Sentence Variations
 * Generates variations of base sentences to increase variety without AI
 */

// Pronoun substitution maps
const PRONOUNS = {
  first: ['I', 'we', 'me', 'us', 'my', 'our', 'mine', 'ours'],
  second: ['you', 'your', 'yours'],
  third: ['he', 'she', 'it', 'they', 'him', 'her', 'them', 'his', 'her', 'its', 'their'],
};

// Possessive to regular mappings
const POSSESSIVE_MAP = {
  'my': 'the',
  'our': 'the',
  'your': 'the',
  'his': 'the',
  'her': 'the',
  'its': 'the',
  'their': 'the',
};

// Tense transformations
const TENSE_TRANSFORMS = {
  presentToPast: (words) => {
    // Simple past tense conversion for common verbs
    const pastMap = {
      'is': 'was',
      'are': 'were',
      'was': 'had been',
      'were': 'had been',
      'has': 'had',
      'have': 'had',
      'does': 'did',
      'do': 'did',
      'says': 'said',
      'said': 'had said',
      'goes': 'went',
      'went': 'had gone',
      'comes': 'came',
      'came': 'had come',
      'gets': 'got',
      'got': 'had gotten',
      'sees': 'saw',
      'saw': 'had seen',
      'knows': 'knew',
      'knew': 'had known',
      'thinks': 'thought',
      'thought': 'had thought',
      'makes': 'made',
      'made': 'had made',
      'takes': 'took',
      'took': 'had taken',
      'gives': 'gave',
      'gave': 'had given',
    };

    return words.map(word => pastMap[word.toLowerCase()] || word);
  },
};

// Modifiers to add/remove
const MODIFIERS = {
  add: ['just', 'suddenly', 'quietly', 'slowly', 'quickly', 'already', 'still', 'again'],
  remove: ['very', 'really', 'extremely', 'quite', 'rather'],
};

/**
 * Generate variations of a sentence by applying transformations
 * @param {string} baseSentence - The original sentence
 * @param {number} count - Number of variations to generate
 * @returns {Array<{text: string, transformation: string}>}
 */
export function generateVariations(baseSentence, count = 3) {
  const variations = [];
  const words = baseSentence.trim().split(/\s+/);
  const transformations = new Set();

  // 1. Pronoun substitution (I → you, my → your, etc.)
  if (count >= 1 && !transformations.has('pronoun')) {
    const newWords = words.map(word => {
      const lower = word.toLowerCase();
      if (PRONOUNS.first.includes(lower)) {
        const idx = PRONOUNS.first.indexOf(lower);
        return PRONOUNS.second[idx % PRONOUNS.second.length] || word;
      }
      if (PRONOUNS.third.includes(lower)) {
        const idx = PRONOUNS.third.indexOf(lower);
        return PRONOUNS.first[idx % PRONOUNS.first.length] || word;
      }
      return word;
    });
    const newSentence = newWords.join(' ');
    if (newSentence !== baseSentence) {
      variations.push({ text: newSentence, transformation: 'pronoun' });
      transformations.add('pronoun');
    }
  }

  // 2. Definite article substitution (my/our/your → the)
  if (count >= 2 && !transformations.has('article')) {
    const newWords = words.map(word => {
      const lower = word.toLowerCase();
      return POSSESSIVE_MAP[lower] || word;
    });
    const newSentence = newWords.join(' ');
    if (newSentence !== baseSentence && !variations.some(v => v.text === newSentence)) {
      variations.push({ text: newSentence, transformation: 'article' });
      transformations.add('article');
    }
  }

  // 3. Tense shift (present → past)
  if (count >= 3 && !transformations.has('tense')) {
    const newWords = TENSE_TRANSFORMS.presentToPast(words);
    const newSentence = newWords.join(' ');
    if (newSentence !== baseSentence && !variations.some(v => v.text === newSentence)) {
      variations.push({ text: newSentence, transformation: 'tense' });
      transformations.add('tense');
    }
  }

  // 4. Add/remove modifiers
  if (count >= 4 && !transformations.has('modifier')) {
    // Try adding a modifier to first adjective/adverb
    const modifier = MODIFIERS.add[Math.floor(Math.random() * MODIFIERS.add.length)];
    const newSentence = `${modifier} ${baseSentence.toLowerCase()}`;
    if (!variations.some(v => v.text === newSentence)) {
      variations.push({ text: newSentence, transformation: 'add-modifier' });
      transformations.add('modifier');
    }
  }

  // 5. Question form (if statement starts with "It" or "There")
  if (count >= 5 && !transformations.has('question') && 
      (words[0] === 'It' || words[0] === 'There' || words[0] === 'Something')) {
    const newSentence = `What ${words.slice(1).join(' ')}?`;
    if (!variations.some(v => v.text === newSentence)) {
      variations.push({ text: newSentence, transformation: 'question' });
      transformations.add('question');
    }
  }

  // 6. Second person imperative
  if (count >= 6 && !transformations.has('imperative') && words[0] === 'I') {
    const newWords = words.slice(1);
    const newSentence = `Don't ${newWords.join(' ')}`;
    if (!variations.some(v => v.text === newSentence)) {
      variations.push({ text: newSentence, transformation: 'imperative' });
      transformations.add('imperative');
    }
  }

  return variations;
}

/**
 * Generate multiple variations for a sentence pool
 * @param {Array<{level: number, text: string}>} baseSentences 
 * @param {number} targetCount - Desired total count for a level range
 *returns {Array<{level: number, text: string, isVariation: boolean, baseText?: string}>}
 */
export function expandSentencePool(baseSentences, targetCount) {
  const expanded = [];
  
  // First, add all base sentences
  for (const sentence of baseSentences) {
    expanded.push({
      level: sentence.level,
      text: sentence.text,
      isVariation: false,
    });
  }

  // If we need more sentences, generate variations
  let attempts = 0;
  const maxAttempts = targetCount * 10; // Prevent infinite loop
  
  while (expanded.length < targetCount && attempts < maxAttempts) {
    attempts++;
    
    // Pick a random base sentence
    const base = baseSentences[Math.floor(Math.random() * baseSentences.length)];
    const variations = generateVariations(base.text, 3);
    
    for (const variation of variations) {
      if (expanded.length >= targetCount) break;
      
      // Check if this variation (or similar) already exists
      const exists = expanded.some(s => 
        s.text.toLowerCase() === variation.text.toLowerCase() || 
        (s.baseText && s.baseText.toLowerCase() === base.text.toLowerCase())
      );
      
      if (!exists) {
        expanded.push({
          level: base.level,
          text: variation.text,
          isVariation: true,
          baseText: base.text,
        });
      }
    }
  }

  return expanded;
}

/**
 * Calculate word count of a sentence
 */
export function getWordCount(sentence) {
  return sentence.trim().split(/\s+/).length;
}

/**
 * Extract first word (for variety scoring)
 */
export function getFirstWord(sentence) {
  return sentence.trim().split(/\s+/)[0]?.toLowerCase() || '';
}

/**
 * Infer theme tags from sentence content (basic keyword matching)
 */
export function inferTheme(sentence) {
  const lower = sentence.toLowerCase();
  const themes = [];
  
  const themeKeywords = {
    paranormal: ['ghost', 'spirit', 'haunt', 'shadow', 'whisper', 'creak', 'eerie', 'supernatural'],
    technology: ['phone', 'computer', 'screen', 'wifi', 'notification', 'password', 'device', 'digital'],
    psychological: ['mind', 'thought', 'memory', 'dream', 'reality', 'know', 'feel', 'sense'],
    body_horror: ['skin', 'bone', 'blood', 'flesh', 'eye', 'hand', 'body', 'pulse'],
    suspense: ['wait', 'listen', 'watch', 'quiet', 'silence', 'still', 'hidden', 'lurking'],
    existential: ['die', 'death', 'alone', 'nothing', 'empty', 'void', 'end', 'forever'],
  };

  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => lower.includes(keyword))) {
      themes.push(theme);
    }
  }

  return themes.length > 0 ? themes : ['general'];
}

/**
 * Generate metadata for a sentence
 */
export function generateMetadata(sentence) {
  return {
    wordCount: getWordCount(sentence),
    firstWord: getFirstWord(sentence),
    themes: inferTheme(sentence),
    lengthCategory: getWordCount(sentence) <= 4 ? 'short' : 
                    getWordCount(sentence) <= 6 ? 'medium' : 'long',
  };
}
