const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

// List of Old Testament book abbreviations
const otBooks = [
  'gn','ex','lv','nm','dt','js','jz','rt','1sm','2sm','1rs','2rs','1cr','2cr','ed','ne','et','jó','sl','pv','ec','ct','is','jr','lm','ez','dn','os','jl','am','ob','jn','mq','na','hc','sf','ag','zc','ml'
];

console.log('Building translation dictionaries...');
const heToPt = new Map();
const transToPt = new Map();

// Pass 1: Gather populated translations from all files
for (const file of files) {
  const abbrev = file.replace('.json', '');
  if (!otBooks.includes(abbrev)) continue; // Only Old Testament has interlinear Hebrew
  
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const v of verses) {
    for (const w of v.words) {
      if (w.portuguese) {
        const he = w.hebrew.trim();
        const trans = w.transliteration.trim();
        const pt = w.portuguese.trim();
        
        if (he) {
          if (!heToPt.has(he)) {
            heToPt.set(he, new Map());
          }
          const heMap = heToPt.get(he);
          heMap.set(pt, (heMap.get(pt) || 0) + 1);
        }

        if (trans) {
          if (!transToPt.has(trans)) {
            transToPt.set(trans, new Map());
          }
          const transMap = transToPt.get(trans);
          transMap.set(pt, (transMap.get(pt) || 0) + 1);
        }
      }
    }
  }
}

// Select the most frequent translation for each Hebrew word and transliteration
const heBestPt = new Map();
for (const [he, ptMap] of heToPt.entries()) {
  let bestPt = '';
  let maxCount = 0;
  for (const [pt, count] of ptMap.entries()) {
    if (count > maxCount) {
      maxCount = count;
      bestPt = pt;
    }
  }
  heBestPt.set(he, bestPt);
}

const transBestPt = new Map();
for (const [trans, ptMap] of transToPt.entries()) {
  let bestPt = '';
  let maxCount = 0;
  for (const [pt, count] of ptMap.entries()) {
    if (count > maxCount) {
      maxCount = count;
      bestPt = pt;
    }
  }
  transBestPt.set(trans, bestPt);
}

console.log(`Hebrew dictionary size: ${heBestPt.size} entries.`);
console.log(`Transliteration dictionary size: ${transBestPt.size} entries.`);

// Pass 2: Propagate translations and overwrite files
let totalModified = 0;
let totalWordsChecked = 0;
let totalWordsFilled = 0;

for (const file of files) {
  const abbrev = file.replace('.json', '');
  if (!otBooks.includes(abbrev)) continue;

  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fileModified = false;

  for (const v of verses) {
    for (const w of v.words) {
      totalWordsChecked++;
      if (!w.portuguese) {
        const he = w.hebrew.trim();
        const trans = w.transliteration.trim();
        
        let filledPt = '';
        if (he && heBestPt.has(he)) {
          filledPt = heBestPt.get(he);
        } else if (trans && transBestPt.has(trans)) {
          filledPt = transBestPt.get(trans);
        }

        if (filledPt) {
          w.portuguese = filledPt;
          fileModified = true;
          totalWordsFilled++;
        }
      }
    }
  }

  if (fileModified) {
    fs.writeFileSync(filePath, JSON.stringify(verses, null, 2));
    console.log(`SUCCESS: Propagated translations to ${file}`);
    totalModified++;
  }
}

console.log('\n=== PROPAGATION SUMMARY ===');
console.log(`Files updated: ${totalModified} files.`);
console.log(`Total words checked: ${totalWordsChecked}.`);
console.log(`Total words filled with Portuguese translation: ${totalWordsFilled}.`);
console.log('=== END OF PROPAGATION ===');
