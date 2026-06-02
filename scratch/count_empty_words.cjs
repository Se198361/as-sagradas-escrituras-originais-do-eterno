const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

const emptyHebrewWords = new Set();
const emptyTrans = new Set();
let totalWords = 0;
let emptyWords = 0;

for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const v of verses) {
    for (const w of v.words) {
      totalWords++;
      if (!w.portuguese) {
        emptyWords++;
        emptyHebrewWords.add(w.hebrew.trim());
        emptyTrans.add(w.transliteration.trim());
      }
    }
  }
}

console.log({
  totalWords,
  emptyWords,
  percentageEmpty: (emptyWords / totalWords * 100).toFixed(2) + '%',
  uniqueEmptyHebrew: emptyHebrewWords.size,
  uniqueEmptyTrans: emptyTrans.size
});
