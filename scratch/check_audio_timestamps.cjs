const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

console.log('=== AUDITING AUDIO TIMESTAMPS IN JSON FILES ===');
let totalOTVerses = 0;
let otVersesWithAudio = 0;
let totalNTVerses = 0;
let ntVersesWithAudio = 0;

const otBooks = [
  'gn', 'ex', 'lv', 'nm', 'dt', 'js', 'jz', 'rt', '1sm', '2sm', '1rs', '2rs', '1cr', '2cr',
  'ed', 'ne', 'et', 'jó', 'sl', 'pv', 'ec', 'ct', 'is', 'jr', 'lm', 'ez', 'dn', 'os', 'jl',
  'am', 'ob', 'jn', 'mq', 'na', 'hc', 'sf', 'ag', 'zc', 'ml'
];

for (const file of files) {
  const abbrev = path.basename(file, '.json');
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const isOT = otBooks.includes(abbrev);
  let hasAudioCount = 0;
  
  for (const v of verses) {
    if (isOT) totalOTVerses++;
    else totalNTVerses++;
    
    if (v.audio_start !== undefined) {
      hasAudioCount++;
      if (isOT) otVersesWithAudio++;
      else ntVersesWithAudio++;
    }
  }
  
  if (isOT) {
    console.log(`OT Book: ${abbrev.toUpperCase()} -> Verses: ${verses.length}, With Audio: ${hasAudioCount} (${Math.round(hasAudioCount / verses.length * 100)}%)`);
  } else if (hasAudioCount > 0) {
    console.log(`NT Book: ${abbrev.toUpperCase()} -> Verses: ${verses.length}, With Audio: ${hasAudioCount} (${Math.round(hasAudioCount / verses.length * 100)}%)`);
  }
}

console.log('\n=== FINAL SUMMARY ===');
console.log(`Old Testament Verses: ${totalOTVerses}, With Audio: ${otVersesWithAudio} (${Math.round(otVersesWithAudio / totalOTVerses * 100)}%)`);
console.log(`New Testament Verses: ${totalNTVerses}, With Audio: ${ntVersesWithAudio} (${Math.round(ntVersesWithAudio / totalNTVerses * 100)}%)`);
