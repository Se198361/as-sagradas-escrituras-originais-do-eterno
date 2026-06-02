const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');

function printSample(book, cap, vers) {
  const file = path.join(dbDir, `${book}.json`);
  if (!fs.existsSync(file)) {
    console.log(`File not found for ${book}`);
    return;
  }
  const verses = JSON.parse(fs.readFileSync(file, 'utf8'));
  const v = verses.find(x => x.chapter === cap && x.verse === vers);
  if (!v) {
    console.log(`Verse ${cap}:${vers} not found in ${book}`);
    return;
  }
  console.log(`\n=== SAMPLE: ${book.toUpperCase()} ${cap}:${vers} ===`);
  console.log('Text Pt:', v.text_pt);
  v.words.forEach((w, i) => {
    console.log(`  [${i + 1}] Hebrew: ${w.hebrew} | Trans: ${w.transliteration} | Pt: "${w.portuguese}"`);
  });
}

printSample('gn', 1, 1);
printSample('gn', 8, 1);
printSample('sl', 23, 1);
printSample('ap', 1, 1);
