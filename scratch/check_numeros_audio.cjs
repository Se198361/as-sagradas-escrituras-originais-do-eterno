const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'db', 'nm.json');
const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log("=== CHECKING NUMEROS AUDIO === ");
const withAudio = verses.filter(v => v.audio_start !== undefined);
console.log("Total verses in Numbers:", verses.length);
console.log("Verses with audio:", withAudio.length);

if (withAudio.length > 0) {
  console.log("First 5 verses with audio:");
  for (let i = 0; i < Math.min(5, withAudio.length); i++) {
    const v = withAudio[i];
    console.log(`Verse ${v.chapter}:${v.verse} -> Start: ${v.audio_start}, End: ${v.audio_end}`);
  }
}
