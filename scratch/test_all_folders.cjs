const axios = require('axios');

const books = [
  { abbrev: 'gn', qod: 'GENESIS', seder: 1 },
  { abbrev: 'ex', qod: 'EXODO', seder: 2 },
  { abbrev: 'lv', qod: 'LEVITICO', seder: 3 },
  { abbrev: 'nm', qod: 'NUMEROS', seder: 4 },
  { abbrev: 'dt', qod: 'DEUTERONOMIO', seder: 5 },
  { abbrev: 'js', qod: 'JOSUE', seder: 6 },
  { abbrev: 'jz', qod: 'JUIZES', seder: 7 },
  { abbrev: '1sm', qod: '1SAMUEL', seder: 8, altQods: ['I_SAMUEL', '1_SAMUEL', '1SAMUEL'] },
  { abbrev: '2sm', qod: '2SAMUEL', seder: 9, altQods: ['II_SAMUEL', '2_SAMUEL', '2SAMUEL'] },
  { abbrev: '1rs', qod: '1REIS', seder: 10, altQods: ['I_REIS', '1_REIS', '1REIS'] },
  { abbrev: '2rs', qod: '2REIS', seder: 11, altQods: ['II_REIS', '2_REIS', '2REIS'] },
  { abbrev: 'is', qod: 'ISAIAS', seder: 12 },
  { abbrev: 'jr', qod: 'JEREMIAS', seder: 13 },
  { abbrev: 'ez', qod: 'EZEQUIEL', seder: 14 },
  { abbrev: 'os', qod: 'OSEIAS', seder: 15 },
  { abbrev: 'jl', qod: 'JOEL', seder: 16 },
  { abbrev: 'am', qod: 'AMOS', seder: 17 },
  { abbrev: 'ob', qod: 'OBADIAS', seder: 18 },
  { abbrev: 'jn', qod: 'JONAS', seder: 19 },
  { abbrev: 'mq', qod: 'MIQUEIAS', seder: 20 },
  { abbrev: 'na', qod: 'NAUM', seder: 21 },
  { abbrev: 'hc', qod: 'HABACUQUE', seder: 22 },
  { abbrev: 'sf', qod: 'SOFONIAS', seder: 23 },
  { abbrev: 'ag', qod: 'AGEU', seder: 24 },
  { abbrev: 'zc', qod: 'ZACARIAS', seder: 25 },
  { abbrev: 'ml', qod: 'MALAQUIAS', seder: 26 },
  { abbrev: 'sl', qod: 'SALMOS', seder: 27 },
  { abbrev: 'jó', qod: 'JO', seder: 28 },
  { abbrev: 'pv', qod: 'PROVERBIOS', seder: 29 },
  { abbrev: 'rt', qod: 'RUTE', seder: 30 },
  { abbrev: 'ct', qod: 'CANTARES', seder: 31 },
  { abbrev: 'ec', qod: 'ECLESIASTES', seder: 32 },
  { abbrev: 'lm', qod: 'LAMENTACOES', seder: 33 },
  { abbrev: 'et', qod: 'ESTER', seder: 34 },
  { abbrev: 'dn', qod: 'DANIEL', seder: 35 },
  { abbrev: 'ed', qod: 'ESDRAS', seder: 36 },
  { abbrev: 'ne', qod: 'NEEMIAS', seder: 37 },
  { abbrev: '1cr', qod: '1CRONICAS', seder: 38, altQods: ['I_CRONICAS', '1_CRONICAS', '1CRONICAS'] },
  { abbrev: '2cr', qod: '2CRONICAS', seder: 39, altQods: ['II_CRONICAS', '2_CRONICAS', '2CRONICAS'] }
];

async function checkUrl(url) {
  try {
    const res = await axios.head(url, { timeout: 5000 });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function run() {
  console.log("=== AUDITING ALL OLD TESTAMENT MP3 PATHS ===");
  for (const b of books) {
    const sederPadded = String(b.seder).padStart(3, '0');
    
    // We will test both the primary QOD and any altQods
    const qodsToTest = [b.qod, ...(b.altQods || [])];
    let found = false;
    
    for (const q of qodsToTest) {
      const url = `https://hebraico.pro.br/girsaot/he/biblia/mp3/${sederPadded}_${q}/${q}_001.mp3`;
      const ok = await checkUrl(url);
      if (ok) {
        console.log(`SUCCESS: ${b.abbrev.toUpperCase()} -> Folder: ${sederPadded}_${q}, File: ${q}_001.mp3`);
        b.workingFolder = `${sederPadded}_${q}`;
        b.workingFile = q;
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Let's try alternative seder indices or structures
      // E.g. what if the file is just named differently?
      console.log(`FAILED: ${b.abbrev.toUpperCase()} -> Seder ${sederPadded}, tested: ${qodsToTest.join(', ')}`);
    }
    
    // Small polite delay between requests
    await new Promise(r => setTimeout(r, 100));
  }
}

run();
