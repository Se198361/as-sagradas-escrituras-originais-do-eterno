const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

// Build translation dictionary
const heToPt = new Map();
const transToPt = new Map();

// First pass: gather populated translations
for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const v of verses) {
    for (const w of v.words) {
      if (w.portuguese) {
        const he = w.hebrew.trim();
        const trans = w.transliteration.trim();
        const pt = w.portuguese.trim();
        
        if (!heToPt.has(he)) {
          heToPt.set(he, new Map());
        }
        const heMap = heToPt.get(he);
        heMap.set(pt, (heMap.get(pt) || 0) + 1);

        if (!transToPt.has(trans)) {
          transToPt.set(trans, new Map());
        }
        const transMap = transToPt.get(trans);
        transMap.set(pt, (transMap.get(pt) || 0) + 1);
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

console.log('Hebrew dictionary size:', heBestPt.size);
console.log('Transliteration dictionary size:', transBestPt.size);

// Second pass: count how many empty words can be filled
let totalEmpty = 0;
let filledByHebrew = 0;
let filledByTrans = 0;
let remainingEmpty = 0;

for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const v of verses) {
    for (const w of v.words) {
      if (!w.portuguese) {
        totalEmpty++;
        const he = w.hebrew.trim();
        const trans = w.transliteration.trim();
        if (heBestPt.has(he)) {
          filledByHebrew++;
        } else if (transBestPt.has(trans)) {
          filledByTrans++;
        } else {
          remainingEmpty++;
        }
      }
    }
  }
}

console.log({
  totalEmpty,
  filledByHebrew,
  filledByTrans,
  totalFilled: filledByHebrew + filledByTrans,
  remainingEmpty,
  percentageFilled: ((filledByHebrew + filledByTrans) / totalEmpty * 100).toFixed(2) + '%'
});
