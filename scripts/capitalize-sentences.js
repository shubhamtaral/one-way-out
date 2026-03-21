/**
 * Capitalize first letter of all sentences in sentences.json
 * Run with: node scripts/capitalize-sentences.js
 */

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SENTENCES_JSON_PATH = join(process.cwd(), 'src', 'data', 'sentences.json');

function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function main() {
  console.log('📖 Reading sentences.json...');
  const raw = await readFile(SENTENCES_JSON_PATH, 'utf-8');
  const sentences = JSON.parse(raw);

  console.log('📊 Total sentences:', sentences.length);
  
  let changed = 0;
  for (const sentence of sentences) {
    const original = sentence.text;
    const capitalized = capitalizeFirstLetter(original);
    
    if (original !== capitalized) {
      sentence.text = capitalized;
      changed++;
    }
  }

  console.log(`✏️  Capitalized ${changed} sentences`);

  console.log('💾 Writing updated sentences.json...');
  await writeFile(
    SENTENCES_JSON_PATH,
    JSON.stringify(sentences, null, 2)
  );

  console.log('✅ Done!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
