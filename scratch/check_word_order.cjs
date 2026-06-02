const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

console.log('Checking Hebrew word direction in all books...');

for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (verses.length === 0) continue;
  
  // Find a verse with words
  const v = verses.find(x => x.words && x.words.length > 2);
  if (!v) continue;
  
  // Check the first and last word in the array
  const firstWord = v.words[0].hebrew;
  const lastWord = v.words[v.words.length - 1].hebrew;
  
  console.log(`${file}: 1st in array: "${firstWord}" | Last in array: "${lastWord}"`);
}
