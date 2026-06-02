const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');

// Build dictionary from Old Testament files (which have verified translations)
const otBooks = [
  'gn','ex','lv','nm','dt','js','jz','rt','1sm','2sm','1rs','2rs','1cr','2cr','ed','ne','et','jó','sl','pv','ec','ct','is','jr','lm','ez','dn','os','jl','am','ob','jn','mq','na','hc','sf','ag','zc','ml'
];

console.log('Building dictionary from verified OT translations...');
const heToPt = new Map();
const transToPt = new Map();

for (const file of fs.readdirSync(dbDir).filter(f => f.endsWith('.json') && f !== 'books.json')) {
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

console.log(`Dictionary size: ${heToPt.size} Hebrew words, ${transToPt.size} transliterations.`);

// Clean and tokenize Portuguese verse text
function tokenizePt(text) {
  // Strip translator notes in brackets, e.g. [Heb. I'hésu Messias]
  let cleaned = text.replace(/\[.*?\]/g, '');
  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  // Split into words, keeping punctuation attached or removing it?
  // Let's split by spaces
  return cleaned.split(' ').filter(Boolean);
}

function alignVerse(words, textPt) {
  const ptTokens = tokenizePt(textPt);
  if (ptTokens.length === 0 || words.length === 0) return;

  const N = words.length;
  const M = ptTokens.length;

  // Let's create an array to hold the aligned Portuguese words for each Hebrew word
  const alignment = new Array(N).fill(null);

  // Phase 1: Direct dictionary lookup matching tokens in the verse
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

    // Look for a candidate that matches a token in ptTokens (case insensitive)
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

  // Phase 2: Sequential alignment for remaining unmatched words
  // For any index i where alignment[i] is null, we estimate it based on position
  let lastMatchedTokenIdx = -1;
  for (let i = 0; i < N; i++) {
    if (alignment[i] !== null) {
      // Find where this matched word is in the ptTokens array to use as anchor
      const idx = ptTokens.findIndex(t => t.toLowerCase().includes(alignment[i].toLowerCase().replace(/[:.?,;\-]/g, '')));
      if (idx !== -1) {
        lastMatchedTokenIdx = idx;
      }
      continue;
    }

    // We have a null alignment at index i.
    // Let's find the next anchor index
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

    // We want to distribute the tokens from lastMatchedTokenIdx + 1 to nextAnchorTokenIdx - 1
    const availableTokens = ptTokens.slice(lastMatchedTokenIdx + 1, nextAnchorTokenIdx);
    if (availableTokens.length > 0) {
      // If we are at the last words, or have fewer Hebrew words than remaining Portuguese tokens,
      // let's grab a proportional slice
      const remainingHebrew = N - i;
      const sliceSize = Math.max(1, Math.round(availableTokens.length / remainingHebrew));
      const slice = availableTokens.slice(0, sliceSize);
      alignment[i] = slice.join(' ');
      lastMatchedTokenIdx += sliceSize;
    } else {
      // Fallback: use a generic word from the verse or just empty
      alignment[i] = ptTokens[Math.floor((i / N) * M)] || '';
    }
  }

  // Save alignments back
  for (let i = 0; i < N; i++) {
    words[i].portuguese = alignment[i] || '';
  }
}

// Test on Matthew
const mtPath = path.join(dbDir, 'mt.json');
const mtVerses = JSON.parse(fs.readFileSync(mtPath, 'utf8'));
console.log('\nTesting alignment on Matthew 1:1-5...');
for (let i = 0; i < 5; i++) {
  const v = mtVerses[i];
  console.log(`\nVerse ${v.chapter}:${v.verse}`);
  console.log('Original Text:', v.text_pt);
  
  // Clone words to avoid modifying database yet
  const wordsClone = JSON.parse(JSON.stringify(v.words));
  alignVerse(wordsClone, v.text_pt);
  
  wordsClone.forEach((w, idx) => {
    console.log(`  Word ${idx + 1}: ${w.hebrew} (${w.transliteration}) -> "${w.portuguese}"`);
  });
}
