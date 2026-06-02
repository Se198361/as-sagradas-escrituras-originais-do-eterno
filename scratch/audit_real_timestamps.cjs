const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

const otBooks = [
  'gn', 'ex', 'lv', 'nm', 'dt', 'js', 'jz', 'rt', '1sm', '2sm', '1rs', '2rs', '1cr', '2cr',
  'ed', 'ne', 'et', 'jó', 'sl', 'pv', 'ec', 'ct', 'is', 'jr', 'lm', 'ez', 'dn', 'os', 'jl',
  'am', 'ob', 'jn', 'mq', 'na', 'hc', 'sf', 'ag', 'zc', 'ml'
];

console.log('=== AUDITING REAL NON-ZERO TIMESTAMPS ===');
let totalOTVerses = 0;
let realAudioCount = 0;

for (const file of files) {
  const abbrev = path.basename(file, '.json');
  if (!otBooks.includes(abbrev)) continue;
  
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let nonZeroCount = 0;
  for (const v of verses) {
    totalOTVerses++;
    if (v.audio_start !== undefined && (v.audio_start > 0 || v.audio_end > 0)) {
      nonZeroCount++;
      realAudioCount++;
    }
  }
  
  console.log(`OT Book: ${abbrev.toUpperCase()} -> Total Verses: ${verses.length}, With Real Audio: ${nonZeroCount} (${Math.round(nonZeroCount / verses.length * 100)}%)`);
}

console.log('\n=== REAL AUDIO SUMMARY ===');
console.log(`Total Old Testament Verses: ${totalOTVerses}`);
console.log(`Verses with Real Non-Zero Audio: ${realAudioCount} (${Math.round(realAudioCount / totalOTVerses * 100)}%)`);
