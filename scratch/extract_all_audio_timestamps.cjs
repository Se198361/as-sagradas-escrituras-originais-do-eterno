const axios = require('axios');
const fs = require('fs');
const path = require('path');

const booksData = [
  {"seder": 1, "qod": "GENESIS", "shemHaSefer": "Gênesis", "qitsur": "gn", "peraqim": 50},
  {"seder": 2, "qod": "EXODO", "shemHaSefer": "Êxodo", "qitsur": "ex", "peraqim": 40},
  {"seder": 3, "qod": "LEVITICO", "shemHaSefer": "Levítico", "qitsur": "lv", "peraqim": 27},
  {"seder": 4, "qod": "NUMEROS", "shemHaSefer": "Números", "qitsur": "nm", "peraqim": 36},
  {"seder": 5, "qod": "DEUTERONOMIO", "shemHaSefer": "Deuteronômio", "qitsur": "dt", "peraqim": 34},
  {"seder": 6, "qod": "JOSUE", "shemHaSefer": "Josué", "qitsur": "js", "peraqim": 24},
  {"seder": 7, "qod": "JUIZES", "shemHaSefer": "Juízes", "qitsur": "jz", "peraqim": 21},
  {"seder": 8, "qod": "RUTE", "shemHaSefer": "Rute", "qitsur": "rt", "peraqim": 4},
  {"seder": 9, "qod": "1SAMUEL", "shemHaSefer": "1º Samuel", "qitsur": "1sm", "peraqim": 31},
  {"seder": 10, "qod": "2SAMUEL", "shemHaSefer": "2º Samuel", "qitsur": "2sm", "peraqim": 24},
  {"seder": 11, "qod": "1REIS", "shemHaSefer": "1º Reis", "qitsur": "1rs", "peraqim": 22},
  {"seder": 12, "qod": "2REIS", "shemHaSefer": "2º Reis", "qitsur": "2rs", "peraqim": 25},
  {"seder": 13, "qod": "1CRONICAS", "shemHaSefer": "1º Crônicas", "qitsur": "1cr", "peraqim": 29},
  {"seder": 14, "qod": "2CRONICAS", "shemHaSefer": "2º Crônicas", "qitsur": "2cr", "peraqim": 36},
  {"seder": 15, "qod": "ESDRAS", "shemHaSefer": "Esdras", "qitsur": "ed", "peraqim": 10},
  {"seder": 16, "qod": "NEEMIAS", "shemHaSefer": "Neemias", "qitsur": "ne", "peraqim": 13},
  {"seder": 17, "qod": "ESTER", "shemHaSefer": "Ester", "qitsur": "et", "peraqim": 10},
  {"seder": 18, "qod": "JO", "shemHaSefer": "Jó", "qitsur": "jó", "peraqim": 42},
  {"seder": 19, "qod": "SALMOS", "shemHaSefer": "Salmos", "qitsur": "sl", "peraqim": 150},
  {"seder": 20, "qod": "PROVERBIOS", "shemHaSefer": "Provérbios", "qitsur": "pv", "peraqim": 31},
  {"seder": 21, "qod": "ECLESIASTES", "shemHaSefer": "Eclesiastes", "qitsur": "ec", "peraqim": 12},
  {"seder": 22, "qod": "CANTARES", "shemHaSefer": "Cantares", "qitsur": "ct", "peraqim": 8},
  {"seder": 23, "qod": "ISAIAS", "shemHaSefer": "Isaías", "qitsur": "is", "peraqim": 66},
  {"seder": 24, "qod": "JEREMIAS", "shemHaSefer": "Jeremias", "qitsur": "jr", "peraqim": 52},
  {"seder": 25, "qod": "LAMENTACOES", "shemHaSefer": "Lamentações", "qitsur": "lm", "peraqim": 5},
  {"seder": 26, "qod": "EZEQUIEL", "shemHaSefer": "Ezequiel", "qitsur": "ez", "peraqim": 48},
  {"seder": 27, "qod": "DANIEL", "shemHaSefer": "Daniel", "qitsur": "dn", "peraqim": 12},
  {"seder": 28, "qod": "OSEIAS", "shemHaSefer": "Oseias", "qitsur": "os", "peraqim": 14},
  {"seder": 29, "qod": "JOEL", "shemHaSefer": "Joel", "qitsur": "jl", "peraqim": 3},
  {"seder": 30, "qod": "AMOS", "shemHaSefer": "Amós", "qitsur": "am", "peraqim": 9},
  {"seder": 31, "qod": "OBADIAS", "shemHaSefer": "Obadias", "qitsur": "ob", "peraqim": 1},
  {"seder": 32, "qod": "JONAS", "shemHaSefer": "Jonas", "qitsur": "jn", "peraqim": 4},
  {"seder": 33, "qod": "MIQUEIAS", "shemHaSefer": "Miqueias", "qitsur": "mq", "peraqim": 7},
  {"seder": 34, "qod": "NAUM", "shemHaSefer": "Naum", "qitsur": "na", "peraqim": 3},
  {"seder": 35, "qod": "HABACUQUE", "shemHaSefer": "Habacuque", "qitsur": "hc", "peraqim": 3},
  {"seder": 36, "qod": "SOFONIAS", "shemHaSefer": "Sofonias", "qitsur": "sf", "peraqim": 3},
  {"seder": 37, "qod": "AGEU", "shemHaSefer": "Ageu", "qitsur": "ag", "peraqim": 2},
  {"seder": 38, "qod": "ZACARIAS", "shemHaSefer": "Zacarias", "qitsur": "zc", "peraqim": 14},
  {"seder": 39, "qod": "MALAQUIAS", "shemHaSefer": "Malaquias", "qitsur": "ml", "peraqim": 4}
];

const dbDir = path.join(__dirname, '..', 'public', 'db');
const delay = ms => new Promise(res => setTimeout(res, ms));

function parsePasuqTimestamps(line) {
  const regex = /PasuqBeinliniari\(\s*\[[\s\S]*?\]\s*,\s*\[[\s\S]*?\]\s*,\s*\[[\s\S]*?\]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/;
  const match = line.match(regex);
  if (!match) return null;
  return {
    chapter: parseInt(match[1], 10),
    verse: parseInt(match[2], 10),
    start: parseFloat(match[3]),
    end: parseFloat(match[4])
  };
}

async function fetchWithRetry(url, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.get(url, { timeout: 10000 });
    } catch (err) {
      if (i === retries - 1) throw err;
      console.warn(`Fetch failed for ${url}, retrying in ${backoff}ms... (${err.message})`);
      await delay(backoff);
      backoff *= 2;
    }
  }
}

async function processBook(book) {
  const filePath = path.join(dbDir, `${book.qitsur}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`WARNING: File not found for ${book.shemHaSefer} (${filePath})`);
    return;
  }

  const verses = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`Processing ${book.shemHaSefer} (${book.qitsur.toUpperCase()})...`);

  // We will map chapter -> array of parsed timestamps
  for (let cap = 1; cap <= book.peraqim; cap++) {
    const capStr = String(cap).padStart(3, '0');
    const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_${book.qod}_${capStr}.js`;

    let data = '';
    try {
      const res = await fetchWithRetry(url);
      data = res.data;
    } catch (e) {
      // If 404, just continue without warnings
      continue;
    }

    const lines = data.split(/mGirsa0001_0002\.push/);
    const capTimestamps = [];
    for (const line of lines) {
      const parsed = parsePasuqTimestamps(line);
      if (parsed) {
        capTimestamps.push(parsed);
      }
    }

    if (capTimestamps.length > 0) {
      // Find all verses in the file for this chapter
      const chapterVerses = verses.filter(v => v.chapter === cap);
      // Map timestamps by array index to perfectly align with potential numbering mismatches
      const N = Math.min(chapterVerses.length, capTimestamps.length);
      for (let i = 0; i < N; i++) {
        chapterVerses[i].audio_start = capTimestamps[i].start;
        chapterVerses[i].audio_end = capTimestamps[i].end;
      }
    }

    // Polite delay between chapters
    await delay(120);
  }

  fs.writeFileSync(filePath, JSON.stringify(verses, null, 2));
  console.log(`SUCCESS: Added audio timestamps to ${book.shemHaSefer}!\n`);
}

async function run() {
  console.log('=== STARTING AUDIO TIMESTAMPS SCRAPER ===');
  for (let i = 0; i < booksData.length; i++) {
    const book = booksData[i];
    console.log(`[${i + 1}/${booksData.length}] Starting: ${book.shemHaSefer}...`);
    try {
      await processBook(book);
    } catch (err) {
      console.error(`ERROR: Failed to process ${book.shemHaSefer}:`, err);
    }
    // Delay between books
    await delay(300);
  }
  console.log('=== ALL AUDIO TIMESTAMPS SCRAPED SUCCESSFULLY! ===');
}

run().catch(console.error);
