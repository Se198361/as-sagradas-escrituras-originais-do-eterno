const axios = require('axios');
const fs = require('fs');
const path = require('path');

const booksData = [
  {"seder": 1, "qod": "GENESIS", "shemHaSefer": "Gênesis", "qitsur": "gn", "peraqim": 50, "category": "A Lei (Torá)", "testament": "Antigo Testamento"},
  {"seder": 2, "qod": "EXODO", "shemHaSefer": "Êxodo", "qitsur": "ex", "peraqim": 40, "category": "A Lei (Torá)", "testament": "Antigo Testamento"},
  {"seder": 3, "qod": "LEVITICO", "shemHaSefer": "Levítico", "qitsur": "lv", "peraqim": 27, "category": "A Lei (Torá)", "testament": "Antigo Testamento"},
  {"seder": 4, "qod": "NUMEROS", "shemHaSefer": "Números", "qitsur": "nm", "peraqim": 36, "category": "A Lei (Torá)", "testament": "Antigo Testamento"},
  {"seder": 5, "qod": "DEUTERONOMIO", "shemHaSefer": "Deuteronômio", "qitsur": "dt", "peraqim": 34, "category": "A Lei (Torá)", "testament": "Antigo Testamento"},
  {"seder": 6, "qod": "JOSUE", "shemHaSefer": "Josué", "qitsur": "js", "peraqim": 24, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 7, "qod": "JUIZES", "shemHaSefer": "Juízes", "qitsur": "jz", "peraqim": 21, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 8, "qod": "RUTE", "shemHaSefer": "Rute", "qitsur": "rt", "peraqim": 4, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 9, "qod": "1SAMUEL", "shemHaSefer": "1º Samuel", "qitsur": "1sm", "peraqim": 31, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 10, "qod": "2SAMUEL", "shemHaSefer": "2º Samuel", "qitsur": "2sm", "peraqim": 24, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 11, "qod": "1REIS", "shemHaSefer": "1º Reis", "qitsur": "1rs", "peraqim": 22, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 12, "qod": "2REIS", "shemHaSefer": "2º Reis", "qitsur": "2rs", "peraqim": 25, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 13, "qod": "1CRONICAS", "shemHaSefer": "1º Crônicas", "qitsur": "1cr", "peraqim": 29, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 14, "qod": "2CRONICAS", "shemHaSefer": "2º Crônicas", "qitsur": "2cr", "peraqim": 36, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 15, "qod": "ESDRAS", "shemHaSefer": "Esdras", "qitsur": "ed", "peraqim": 10, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 16, "qod": "NEEMIAS", "shemHaSefer": "Neemias", "qitsur": "ne", "peraqim": 13, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 17, "qod": "ESTER", "shemHaSefer": "Ester", "qitsur": "et", "peraqim": 10, "category": "Históricos", "testament": "Antigo Testamento"},
  {"seder": 18, "qod": "JO", "shemHaSefer": "Jó", "qitsur": "jó", "peraqim": 42, "category": "Poéticos", "testament": "Antigo Testamento"},
  {"seder": 19, "qod": "SALMOS", "shemHaSefer": "Salmos", "qitsur": "sl", "peraqim": 150, "category": "Poéticos", "testament": "Antigo Testamento"},
  {"seder": 20, "qod": "PROVERBIOS", "shemHaSefer": "Provérbios", "qitsur": "pv", "peraqim": 31, "category": "Poéticos", "testament": "Antigo Testamento"},
  {"seder": 21, "qod": "ECLESIASTES", "shemHaSefer": "Eclesiastes", "qitsur": "ec", "peraqim": 12, "category": "Poéticos", "testament": "Antigo Testamento"},
  {"seder": 22, "qod": "CANTARES", "shemHaSefer": "Cantares", "qitsur": "ct", "peraqim": 8, "category": "Poéticos", "testament": "Antigo Testamento"},
  {"seder": 23, "qod": "ISAIAS", "shemHaSefer": "Isaías", "qitsur": "is", "peraqim": 66, "category": "Profetas Maiores", "testament": "Antigo Testamento"},
  {"seder": 24, "qod": "JEREMIAS", "shemHaSefer": "Jeremias", "qitsur": "jr", "peraqim": 52, "category": "Profetas Maiores", "testament": "Antigo Testamento"},
  {"seder": 25, "qod": "LAMENTACOES", "shemHaSefer": "Lamentações", "qitsur": "lm", "peraqim": 5, "category": "Profetas Maiores", "testament": "Antigo Testamento"},
  {"seder": 26, "qod": "EZEQUIEL", "shemHaSefer": "Ezequiel", "qitsur": "ez", "peraqim": 48, "category": "Profetas Maiores", "testament": "Antigo Testamento"},
  {"seder": 27, "qod": "DANIEL", "shemHaSefer": "Daniel", "qitsur": "dn", "peraqim": 12, "category": "Profetas Maiores", "testament": "Antigo Testamento"},
  {"seder": 28, "qod": "OSEIAS", "shemHaSefer": "Oseias", "qitsur": "os", "peraqim": 14, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 29, "qod": "JOEL", "shemHaSefer": "Joel", "qitsur": "jl", "peraqim": 3, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 30, "qod": "AMOS", "shemHaSefer": "Amós", "qitsur": "am", "peraqim": 9, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 31, "qod": "OBADIAS", "shemHaSefer": "Obadias", "qitsur": "ob", "peraqim": 1, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 32, "qod": "JONAS", "shemHaSefer": "Jonas", "qitsur": "jn", "peraqim": 4, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 33, "qod": "MIQUEIAS", "shemHaSefer": "Miqueias", "qitsur": "mq", "peraqim": 7, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 34, "qod": "NAUM", "shemHaSefer": "Naum", "qitsur": "na", "peraqim": 3, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 35, "qod": "HABACUQUE", "shemHaSefer": "Habacuque", "qitsur": "hc", "peraqim": 3, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 36, "qod": "SOFONIAS", "shemHaSefer": "Sofonias", "qitsur": "sf", "peraqim": 3, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 37, "qod": "AGEU", "shemHaSefer": "Ageu", "qitsur": "ag", "peraqim": 2, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 38, "qod": "ZACARIAS", "shemHaSefer": "Zacarias", "qitsur": "zc", "peraqim": 14, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 39, "qod": "MALAQUIAS", "shemHaSefer": "Malaquias", "qitsur": "ml", "peraqim": 4, "category": "Profetas Menores", "testament": "Antigo Testamento"},
  {"seder": 40, "qod": "MATEUS", "shemHaSefer": "Mateus", "qitsur": "mt", "peraqim": 28, "category": "Evangelhos", "testament": "Novo Testamento"},
  {"seder": 41, "qod": "MARCOS", "shemHaSefer": "Marcos", "qitsur": "mc", "peraqim": 16, "category": "Evangelhos", "testament": "Novo Testamento"},
  {"seder": 42, "qod": "LUCAS", "shemHaSefer": "Lucas", "qitsur": "lc", "peraqim": 24, "category": "Evangelhos", "testament": "Novo Testamento"},
  {"seder": 43, "qod": "JOAO", "shemHaSefer": "João", "qitsur": "jo", "peraqim": 21, "category": "Evangelhos", "testament": "Novo Testamento"},
  {"seder": 44, "qod": "ATOS", "shemHaSefer": "Atos dos Apóstolos", "qitsur": "at", "peraqim": 28, "category": "Histórico", "testament": "Novo Testamento"},
  {"seder": 45, "qod": "ROMANOS", "shemHaSefer": "Romanos", "qitsur": "rm", "peraqim": 16, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 46, "qod": "1CORINTIOS", "shemHaSefer": "1ª Coríntios", "qitsur": "1co", "peraqim": 16, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 47, "qod": "2CORINTIOS", "shemHaSefer": "2ª Coríntios", "qitsur": "2co", "peraqim": 13, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 48, "qod": "GALATAS", "shemHaSefer": "Gálatas", "qitsur": "gl", "peraqim": 6, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 49, "qod": "EFESIOS", "shemHaSefer": "Efésios", "qitsur": "ef", "peraqim": 6, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 50, "qod": "FILIPENSES", "shemHaSefer": "Filipenses", "qitsur": "fp", "peraqim": 4, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 51, "qod": "COLOSSENSES", "shemHaSefer": "Colossenses", "qitsur": "cl", "peraqim": 4, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 52, "qod": "1TESSALONICENSES", "shemHaSefer": "1ª Tessalonicenses", "qitsur": "1ts", "peraqim": 5, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 53, "qod": "2TESSALONICENSES", "shemHaSefer": "2ª Tessalonicenses", "qitsur": "2ts", "peraqim": 3, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 54, "qod": "1TIMOTEO", "shemHaSefer": "1ª Timóteo", "qitsur": "1tm", "peraqim": 6, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 55, "qod": "2TIMOTEO", "shemHaSefer": "2ª Timóteo", "qitsur": "2tm", "peraqim": 4, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 56, "qod": "TITO", "shemHaSefer": "Tito", "qitsur": "tt", "peraqim": 3, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 57, "qod": "FILEMOM", "shemHaSefer": "Filemom", "qitsur": "fm", "peraqim": 1, "category": "Epístolas Paulinas", "testament": "Novo Testamento"},
  {"seder": 58, "qod": "HEBREUS", "shemHaSefer": "Hebreus", "qitsur": "hb", "peraqim": 13, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 59, "qod": "TIAGO", "shemHaSefer": "Tiago", "qitsur": "tg", "peraqim": 5, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 60, "qod": "1PEDRO", "shemHaSefer": "1ª Pedro", "qitsur": "1pe", "peraqim": 5, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 61, "qod": "2PEDRO", "shemHaSefer": "2ª Pedro", "qitsur": "2pe", "peraqim": 3, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 62, "qod": "1JOAO", "shemHaSefer": "1ª João", "qitsur": "1jo", "peraqim": 5, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 63, "qod": "2JOAO", "shemHaSefer": "2ª João", "qitsur": "2jo", "peraqim": 1, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 64, "qod": "3JOAO", "shemHaSefer": "3ª João", "qitsur": "3jo", "peraqim": 1, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 65, "qod": "JUDAS", "shemHaSefer": "Judas", "qitsur": "jd", "peraqim": 1, "category": "Epístolas Gerais", "testament": "Novo Testamento"},
  {"seder": 66, "qod": "APOCALIPSE", "shemHaSefer": "Apocalipse", "qitsur": "ap", "peraqim": 22, "category": "Profético", "testament": "Novo Testamento"}
];

const delay = ms => new Promise(res => setTimeout(res, ms));

function cleanHebrewText(htmlStr) {
  return htmlStr.replace(/<[^>]+>/g, '').trim();
}

function parseArray(str) {
  const results = [];
  let current = '';
  let inString = false;
  let quoteChar = null;
  for (let i = 0; i < str.length; i++) {
    if ((str[i] === "'" || str[i] === '"' || str[i] === '`') && (i === 0 || str[i-1] !== '\\')) {
      if (!inString) {
        inString = true;
        quoteChar = str[i];
      } else if (quoteChar === str[i]) {
        inString = false;
        results.push(current);
        current = '';
      } else {
        current += str[i];
      }
    } else if (inString) {
      current += str[i];
    }
  }
  return results;
}

function parsePasuqBeinliniari(line) {
  const match = line.match(/PasuqBeinliniari\(\s*\[([\s\S]*?)\]\s*,\s*\[([\s\S]*?)\]\s*,\s*\[([\s\S]*?)\]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]/);
  if (!match) return null;
  
  const hebrewArr = parseArray(match[1]);
  const transArr = parseArray(match[2]);
  const ptArr = parseArray(match[3]);
  const chapter = parseInt(match[4], 10);
  const verse = parseInt(match[5], 10);
  
  const words = [];
  for (let i = 0; i < hebrewArr.length; i++) {
    words.push({
      hebrew: cleanHebrewText(hebrewArr[i] || ''),
      transliteration: cleanHebrewText(transArr[i] || ''),
      portuguese: cleanHebrewText(ptArr[i] || ''),
      number: `${chapter}.${verse}`
    });
  }
  return { chapter, verse, words };
}

function parsePasuq2(line) {
  const match = line.match(/Pasuq2\(\s*['"`](.*?)['"`]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]/);
  if (!match) return null;
  return {
    text_pt: cleanHebrewText(match[1]),
    chapter: parseInt(match[2], 10),
    verse: parseInt(match[3], 10)
  };
}

async function scrapeBook(book) {
  console.log(`Scraping book ${book.shemHaSefer} (${book.qitsur})...`);
  const bookVerses = [];
  
  for (let cap = 1; cap <= book.peraqim; cap++) {
    const capStr = String(cap).padStart(3, '0');
    
    // 1. Fetch interlinear (he_pt-BR)
    let heData = '';
    try {
      const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_${book.qod}_${capStr}.js`;
      const res = await axios.get(url);
      heData = res.data;
    } catch (e) {
      console.warn(`Could not fetch interlinear for ${book.qod} cap ${cap}`);
    }
    
    // 2. Fetch full PT (pt-BR)
    let ptData = '';
    try {
      const url = `https://hebraico.pro.br/peraqim/pt-BR/girsa_0002_${book.qod}_${capStr}.js`;
      const res = await axios.get(url);
      ptData = res.data;
    } catch (e) {
      console.warn(`Could not fetch full PT for ${book.qod} cap ${cap}`);
    }
    
    // Parse he_pt-BR
    const heVersesList = [];
    if (heData) {
      const lines = heData.split(/mGirsa0001_0002\.push/);
      for (const line of lines) {
        const parsed = parsePasuqBeinliniari(line);
        if (parsed) {
          heVersesList.push(parsed);
        }
      }
    }
    
    // Parse pt-BR
    const ptVersesList = [];
    if (ptData) {
      const lines = ptData.split(/mGirsa0002\.push/);
      for (const line of lines) {
        const parsed = parsePasuq2(line);
        if (parsed) {
          ptVersesList.push(parsed);
        }
      }
    }

    if (ptVersesList.length > 0) {
      // Index-based alignment! The interlinear verses in heVersesList are pushed in the exact same sequence.
      const N = ptVersesList.length;
      for (let i = 0; i < N; i++) {
        const ptV = ptVersesList[i];
        const heV = heVersesList[i];
        
        bookVerses.push({
          book_abbrev: book.qitsur,
          chapter: ptV.chapter,
          verse: ptV.verse,
          text_pt: ptV.text_pt || '',
          words: heV ? heV.words.map(w => ({
            hebrew: w.hebrew,
            transliteration: w.transliteration,
            portuguese: w.portuguese,
            number: `${ptV.chapter}.${ptV.verse}`
          })) : []
        });
      }
      console.log(`Chapter ${cap} scraped: aligned ${N} verses.`);
    } else if (heVersesList.length > 0) {
      // Fallback if there is no ptData, but heData is present
      const seen = new Set();
      const uniqueHeVerses = [];
      for (const v of heVersesList) {
        const key = `${v.chapter}:${v.verse}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueHeVerses.push(v);
        } else {
          const existingIdx = uniqueHeVerses.findIndex(x => x.chapter === v.chapter && x.verse === v.verse);
          if (existingIdx !== -1) {
            const existingPtCount = uniqueHeVerses[existingIdx].words.filter(w => w.portuguese).length;
            const newPtCount = v.words.filter(w => w.portuguese).length;
            if (newPtCount > existingPtCount) {
              uniqueHeVerses[existingIdx] = v;
            }
          }
        }
      }
      for (const v of uniqueHeVerses) {
        bookVerses.push({
          book_abbrev: book.qitsur,
          chapter: v.chapter,
          verse: v.verse,
          text_pt: '',
          words: v.words || []
        });
      }
      console.log(`Chapter ${cap} scraped: parsed ${uniqueHeVerses.length} verses (no PT text).`);
    } else {
      console.log(`Chapter ${cap} scraped: 0 verses found.`);
    }
    
    await delay(100);
  }
  
  return bookVerses;
}

async function run() {
  const targetAbbrev = process.argv[2];
  if (!targetAbbrev) {
    console.error("Please provide book abbreviation.");
    process.exit(1);
  }
  
  const book = booksData.find(b => b.qitsur === targetAbbrev.toLowerCase());
  if (!book) {
    console.error(`Book ${targetAbbrev} not found.`);
    process.exit(1);
  }
  
  const verses = await scrapeBook(book);
  const dbDir = path.join(__dirname, '..', 'public', 'db');
  const bookFile = path.join(dbDir, `${book.qitsur}.json`);
  fs.writeFileSync(bookFile, JSON.stringify(verses, null, 2));
  console.log(`SUCCESS! Saved fixed book ${book.shemHaSefer} to ${bookFile}`);
}

run().catch(console.error);
