/**
 * Add missing sentences for levels 1-3 to reach target distribution
 * Run after regenerate-sentences.js
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SENTENCES_JSON_PATH = join(process.cwd(), 'src', 'data', 'sentences.json');

// Additional sentences for levels 1-3 (manually crafted horror)
const ADDITIONAL_SENTENCES = [
  // Level 1 (need 7 more to reach 15)
  { level: 1, text: "It's watching." },
  { level: 1, text: "Too quiet." },
  { level: 1, text: "Not alone." },
  { level: 1, text: "Behind you." },
  { level: 1, text: "Don't look." },
  { level: 1, text: "Something moved." },
  { level: 1, text: "Heart stopped." },

  // Level 2 (need 6 more to reach 15)
  { level: 2, text: "I saw it." },
  { level: 2, text: "It knows." },
  { level: 2, text: "No escape." },
  { level: 2, text: "Footsteps behind." },
  { level: 2, text: "Breathing stopped." },
  { level: 2, text: "Shadow moved." },

  // Level 3 (need 6 more to reach 15)
  { level: 3, text: "The reflection isn't mine." },
  { level: 3, text: "Someone whispered my name." },
  { level: 3, text: "The door closed by itself." },
  { level: 3, text: "I can feel it breathing." },
  { level: 3, text: "My name on the wall." },
  { level: 3, text: "It's under the bed." },
];

async function main() {
  console.log('📖 Reading sentences.json...');
  const raw = await readFile(SENTENCES_JSON_PATH, 'utf-8');
  const sentences = JSON.parse(raw);

  console.log('📊 Current count:', sentences.length);

  // Count by level
  const counts = {};
  for (const s of sentences) {
    counts[s.level] = (counts[s.level] || 0) + 1;
  }

  console.log('📈 Current distribution:');
  for (let level = 1; level <= 3; level++) {
    console.log(`  Level ${level}: ${counts[level] || 0} sentences`);
  }

  // Add additional sentences
  console.log('\n➕ Adding additional sentences...');
  for (const add of ADDITIONAL_SENTENCES) {
    // Check if exact sentence already exists
    const exists = sentences.some(s => 
      s.level === add.level && s.text.toLowerCase() === add.text.toLowerCase()
    );
    
    if (!exists) {
      sentences.push({
        level: add.level,
        text: add.text,
        wordCount: add.text.split(/\s+/).length,
        firstWord: add.text.split(/\s+/)[0].toLowerCase(),
        themes: ['general'], // Will be inferred later if needed
        lengthCategory: add.text.split(/\s+/).length <= 4 ? 'short' : 'medium',
      });
    }
  }

  // Count again
  const newCounts = {};
  for (const s of sentences) {
    newCounts[s.level] = (newCounts[s.level] || 0) + 1;
  }

  console.log('\n📊 New distribution:');
  for (let level = 1; level <= 3; level++) {
    console.log(`  Level ${level}: ${newCounts[level] || 0} sentences`);
  }

  // Shuffle within levels
  console.log('\n🔀 Shuffling sentences within levels...');
  const byLevel = {};
  for (const s of sentences) {
    if (!byLevel[s.level]) byLevel[s.level] = [];
    byLevel[s.level].push(s);
  }

  const finalSentences = [];
  for (let level = 1; level <= 50; level++) {
    const levelSentences = byLevel[level] || [];
    // Fisher-Yates shuffle
    for (let i = levelSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levelSentences[i], levelSentences[j]] = [levelSentences[j], levelSentences[i]];
    }
    finalSentences.push(...levelSentences);
  }

  console.log('\n💾 Writing updated sentences.json...');
  await writeFile(
    SENTENCES_JSON_PATH,
    JSON.stringify(finalSentences, null, 2)
  );

  console.log('✅ Done! Total sentences:', finalSentences.length);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
