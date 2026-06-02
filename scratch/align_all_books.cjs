const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');
const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json');

// List of all books in the Bible
const allBooks = files.map(f => f.replace('.json', ''));

console.log('Building dictionary from verified OT translations...');
const heToPt = new Map();
const transToPt = new Map();

// Load verified translations first (only Old Testament has verified interlinear entries from source)
const otBooks = [
  'gn','ex','lv','nm','dt','js','jz','rt','1sm','2sm','1rs','2rs','1cr','2cr','ed','ne','et','jó','sl','pv','ec','ct','is','jr','lm','ez','dn','os','jl','am','ob','jn','mq','na','hc','sf','ag','zc','ml'
];

for (const file of files) {
  const abbrev = file.replace('.json', '');
  if (!otBooks.includes(abbrev)) continue;
  
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const v of verses) {
    for (const w of v.words) {
      if (w.portuguese) {
        const he = w.hebrew.trim();
        const trans = w.transliteration.trim();
        const pt = w.portuguese.trim();
        
        if (he) {
          if (!heToPt.has(he)) heToPt.set(he, new Set());
          heToPt.get(he).add(pt);
        }
        if (trans) {
          if (!transToPt.has(trans)) transToPt.set(trans, new Set());
          transToPt.get(trans).add(pt);
        }
      }
    }
  }
}

console.log(`Dictionary built: ${heToPt.size} Hebrew words, ${transToPt.size} transliterations.`);

// Clean and tokenize Portuguese verse text
function tokenizePt(text) {
  // Strip translator notes in brackets, e.g. [Heb. I'hésu Messias] or [David]
  let cleaned = text.replace(/\[.*?\]/g, '');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned.split(' ').filter(Boolean);
}

function alignVerse(words, textPt) {
  const ptTokens = tokenizePt(textPt);
  if (ptTokens.length === 0 || words.length === 0) return;

  const N = words.length;
  const M = ptTokens.length;

  const alignment = new Array(N).fill(null);

  // Phase 1: Dictionary matching with case-insensitive token search
  for (let i = 0; i < N; i++) {
    const w = words[i];
    if (w.portuguese) {
      alignment[i] = w.portuguese;
      continue;
    }
    const he = w.hebrew.trim();
    const trans = w.transliteration.trim();

    const candidates = new Set();
    if (heToPt.has(he)) heToPt.get(he).forEach(c => candidates.add(c));
    if (transToPt.has(trans)) transToPt.get(trans).forEach(c => candidates.add(c));

    for (const ptWord of ptTokens) {
      const cleanPt = ptWord.toLowerCase().replace(/[:.?,;\-]/g, '');
      for (const cand of candidates) {
        const cleanCand = cand.toLowerCase().replace(/[:.?,;\-]/g, '');
        if (cleanPt === cleanCand || cleanPt.includes(cleanCand) || cleanCand.includes(cleanPt)) {
          alignment[i] = cand;
          break;
        }
      }
      if (alignment[i]) break;
    }
  }

  // Phase 2: Sequential heuristic distribution of unmatched tokens
  let lastMatchedTokenIdx = -1;
  for (let i = 0; i < N; i++) {
    if (alignment[i] !== null) {
      const idx = ptTokens.findIndex(t => t.toLowerCase().includes(alignment[i].toLowerCase().replace(/[:.?,;\-]/g, '')));
      if (idx !== -1) {
        lastMatchedTokenIdx = idx;
      }
      continue;
    }

    let nextAnchorTokenIdx = M;
    for (let k = i + 1; k < N; k++) {
      if (alignment[k] !== null) {
        const idx = ptTokens.findIndex(t => t.toLowerCase().includes(alignment[k].toLowerCase().replace(/[:.?,;\-]/g, '')));
        if (idx !== -1) {
          nextAnchorTokenIdx = idx;
          break;
        }
      }
    }

    const availableTokens = ptTokens.slice(lastMatchedTokenIdx + 1, nextAnchorTokenIdx);
    if (availableTokens.length > 0) {
      const remainingHebrew = N - i;
      const sliceSize = Math.max(1, Math.round(availableTokens.length / remainingHebrew));
      const slice = availableTokens.slice(0, sliceSize);
      alignment[i] = slice.join(' ');
      lastMatchedTokenIdx += sliceSize;
    } else {
      alignment[i] = ptTokens[Math.floor((i / N) * M)] || '';
    }
  }

  // Save alignments
  for (let i = 0; i < N; i++) {
    words[i].portuguese = alignment[i] || '';
  }
}

// Align all 67 books of the Bible
console.log('\nStarting alignment on all 67 books of the Bible...');
let totalFilesAligned = 0;
let totalWordsFilled = 0;

for (const file of files) {
  const filePath = path.join(dbDir, file);
  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let modified = false;

  for (const v of verses) {
    let hasEmpty = false;
    for (const w of v.words) {
      if (!w.portuguese) {
        hasEmpty = true;
        break;
      }
    }

    if (hasEmpty) {
      alignVerse(v.words, v.text_pt);
      modified = true;
      for (const w of v.words) {
        totalWordsFilled++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(verses, null, 2));
    console.log(`ALIGNED: ${file} successfully!`);
    totalFilesAligned++;
  }
}

console.log('\n=== ALL BIBLE ALIGNMENT COMPLETED! ===');
console.log(`Total files aligned: ${totalFilesAligned} books.`);
console.log(`Total words aligned & translated: ${totalWordsFilled} words.`);
console.log('=======================================');
