/**
 * Script to regenerate sentences.json with new distribution and metadata
 * Run with: node scripts/regenerate-sentences.js
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { generateVariations, generateMetadata } from '../src/utils/variations.js';

const SENTENCES_JSON_PATH = join(process.cwd(), 'src', 'data', 'sentences.json');

// Target distribution per level
const TARGET_DISTRIBUTION = {
  1: 15, 2: 15, 3: 15, 4: 15, 5: 15,
  6: 15, 7: 15, 8: 15, 9: 15, 10: 15,
  11: 10, 12: 10, 13: 10, 14: 10, 15: 10,
  16: 10, 17: 10, 18: 10, 19: 10, 20: 10,
  21: 8, 22: 8, 23: 8, 24: 8, 25: 8,
  26: 8, 27: 8, 28: 8, 29: 8, 30: 8,
  31: 6, 32: 6, 33: 6, 34: 6, 35: 6,
  36: 6, 37: 6, 38: 6, 39: 6, 40: 6,
  41: 4, 42: 4, 43: 4, 44: 4, 45: 4,
  46: 4, 47: 4, 48: 4, 49: 4, 50: 4,
};

async function main() {
  console.log('📖 Reading current sentences.json...');
  const raw = await readFile(SENTENCES_JSON_PATH, 'utf-8');
  const currentSentences = JSON.parse(raw);

  console.log('📊 Current sentence count:', currentSentences.length);

  // Group sentences by level
  const byLevel = {};
  for (const sentence of currentSentences) {
    if (!byLevel[sentence.level]) {
      byLevel[sentence.level] = [];
    }
    byLevel[sentence.level].push(sentence);
  }

  console.log('📈 Current distribution:');
  for (let level = 1; level <= 50; level++) {
    const count = byLevel[level]?.length || 0;
    console.log(`  Level ${level.toString().padStart(2)}: ${count} sentences`);
  }

  const newSentences = [];

  // Process each level according to target distribution
  for (let level = 1; level <= 50; level++) {
    const targetCount = TARGET_DISTRIBUTION[level];
    const currentCount = byLevel[level]?.length || 0;
    const baseSentences = byLevel[level] || [];

    console.log(`\n🔧 Level ${level}: current=${currentCount}, target=${targetCount}`);

    if (currentCount >= targetCount) {
      // Take first targetCount sentences (no need to generate more)
      const selected = baseSentences.slice(0, targetCount);
      for (const s of selected) {
        newSentences.push({
          level: s.level,
          text: s.text,
          ...generateMetadata(s.text),
        });
      }
      console.log(`  ✓ Using ${selected.length} existing sentences`);
    } else {
      // Need to generate variations to reach target
      const needed = targetCount - currentCount;
      console.log(`  ➕ Need ${needed} more sentences`);

      // Add all existing sentences with metadata
      for (const s of baseSentences) {
        newSentences.push({
          level: s.level,
          text: s.text,
          ...generateMetadata(s.text),
        });
      }

      // Generate variations until we reach target
      let generated = 0;
      let attempts = 0;
      const maxAttempts = needed * 10;

      while (generated < needed && attempts < maxAttempts) {
        attempts++;
        const base = baseSentences[Math.floor(Math.random() * baseSentences.length)];
        const variations = generateVariations(base.text, 3);

        for (const variation of variations) {
          if (generated >= needed) break;

          // Check if this variation already exists in newSentences
          const exists = newSentences.some(s => 
            s.text.toLowerCase() === variation.text.toLowerCase()
          );

          if (!exists) {
            newSentences.push({
              level: base.level,
              text: variation.text,
              isVariation: true,
              baseText: variation.baseText || base.text,
              ...generateMetadata(variation.text),
            });
            generated++;
          }
        }
      }

      console.log(`  ✅ Generated ${generated} variations (${attempts} attempts)`);
    }
  }

  // Shuffle sentences within each level to mix base and variations
  console.log('\n🔀 Shuffling sentences within levels...');
  const finalByLevel = {};
  for (const s of newSentences) {
    if (!finalByLevel[s.level]) finalByLevel[s.level] = [];
    finalByLevel[s.level].push(s);
  }

  const finalSentences = [];
  for (let level = 1; level <= 50; level++) {
    const levelSentences = finalByLevel[level] || [];
    // Fisher-Yates shuffle
    for (let i = levelSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [levelSentences[i], levelSentences[j]] = [levelSentences[j], levelSentences[i]];
    }
    finalSentences.push(...levelSentences);
  }

  console.log('\n📦 Final distribution:');
  const finalCounts = {};
  for (const s of finalSentences) {
    finalCounts[s.level] = (finalCounts[s.level] || 0) + 1;
  }
  for (let level = 1; level <= 50; level++) {
    console.log(`  Level ${level.toString().padStart(2)}: ${finalCounts[level] || 0} sentences`);
  }

  console.log('\n💾 Writing new sentences.json...');
  await writeFile(
    SENTENCES_JSON_PATH,
    JSON.stringify(finalSentences, null, 2)
  );

  console.log('✅ Done! Total sentences:', finalSentences.length);
  console.log('📊 Summary:');
  console.log(`   - Total sentences: ${finalSentences.length}`);
  console.log(`   - Levels with variations: ${finalSentences.filter(s => s.isVariation).length}`);
  console.log(`   - Unique base sentences: ${finalSentences.filter(s => !s.isVariation).length}`);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
