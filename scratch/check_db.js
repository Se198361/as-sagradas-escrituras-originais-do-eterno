const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

let totalVerses = 0;
let emptyPtVerses = 0;
let emptyPtWords = 0;
let totalWords = 0;

for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  for (const v of verses) {
    totalVerses++;
    let hasEmptyPtWord = false;
    for (const w of v.words) {
      totalWords++;
      if (!w.portuguese) {
        emptyPtWords++;
        hasEmptyPtWord = true;
      }
    }
    if (hasEmptyPtWord || v.words.length === 0) {
      emptyPtVerses++;
    }
  }
}

console.log({
  totalVerses,
  emptyPtVerses,
  totalWords,
  emptyPtWords
});
