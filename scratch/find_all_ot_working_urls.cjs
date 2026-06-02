const axios = require('axios');

const books = [
  { abbrev: 'gn', qod: 'GENESIS' },
  { abbrev: 'ex', qod: 'EXODO' },
  { abbrev: 'lv', qod: 'LEVITICO' },
  { abbrev: 'nm', qod: 'NUMEROS' },
  { abbrev: 'dt', qod: 'DEUTERONOMIO' },
  { abbrev: 'js', qod: 'JOSUE' },
  { abbrev: 'jz', qod: 'JUIZES' },
  { abbrev: 'rt', qod: 'RUTE' },
  { abbrev: '1sm', qod: '1SAMUEL' },
  { abbrev: '2sm', qod: '2SAMUEL' },
  { abbrev: '1rs', qod: '1REIS' },
  { abbrev: '2rs', qod: '2REIS' },
  { abbrev: '1cr', qod: '1CRONICAS' },
  { abbrev: '2cr', qod: '2CRONICAS' },
  { abbrev: 'ed', qod: 'ESDRAS' },
  { abbrev: 'ne', qod: 'NEEMIAS' },
  { abbrev: 'et', qod: 'ESTER' },
  { abbrev: 'jó', qod: 'JO' },
  { abbrev: 'sl', qod: 'SALMOS' },
  { abbrev: 'pv', qod: 'PROVERBIOS' },
  { abbrev: 'ec', qod: 'ECLESIASTES' },
  { abbrev: 'ct', qod: 'CANTARES' },
  { abbrev: 'is', qod: 'ISAIAS' },
  { abbrev: 'jr', qod: 'JEREMIAS' },
  { abbrev: 'lm', qod: 'LAMENTACOES' },
  { abbrev: 'ez', qod: 'EZEQUIEL' },
  { abbrev: 'dn', qod: 'DANIEL' },
  { abbrev: 'os', qod: 'OSEIAS' },
  { abbrev: 'jl', qod: 'JOEL' },
  { abbrev: 'am', qod: 'AMOS' },
  { abbrev: 'ob', qod: 'OBADIAS' },
  { abbrev: 'jn', qod: 'JONAS' },
  { abbrev: 'mq', qod: 'MIQUEIAS' },
  { abbrev: 'na', qod: 'NAUM' },
  { abbrev: 'hc', qod: 'HABACUQUE' },
  { abbrev: 'sf', qod: 'SOFONIAS' },
  { abbrev: 'ag', qod: 'AGEU' },
  { abbrev: 'zc', qod: 'ZACARIAS' },
  { abbrev: 'ml', qod: 'MALAQUIAS' }
];

async function checkUrl(url) {
  try {
    const res = await axios.head(url, { timeout: 3000 });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function run() {
  console.log("=== SCANNING FOR ALL WORKING BOOK DIRECTORIES ON SERVER ===");
  const results = {};
  
  for (const b of books) {
    let found = false;
    // Probe all seder prefixes from 1 to 66 to see if this book has ANY folder on the server
    for (let s = 1; s <= 66; s++) {
      const padded = String(s).padStart(3, '0');
      // Test different directory spelling combinations
      const qodsToTest = [b.qod];
      if (b.qod.startsWith('1')) {
        qodsToTest.push(`1_${b.qod.substring(1)}`, `I_${b.qod.substring(1)}`);
      } else if (b.qod.startsWith('2')) {
        qodsToTest.push(`2_${b.qod.substring(1)}`, `II_${b.qod.substring(1)}`);
      }
      
      for (const q of qodsToTest) {
        const url = `https://hebraico.pro.br/girsaot/he/biblia/mp3/${padded}_${q}/${q}_001.mp3`;
        const ok = await checkUrl(url);
        if (ok) {
          console.log(`FOUND!!! ${b.abbrev.toUpperCase()} is at folder: ${padded}_${q}`);
          results[b.abbrev] = { folder: `${padded}_${q}`, file: q, seder: s };
          found = true;
          break;
        }
      }
      if (found) break;
    }
    
    if (!found) {
      console.log(`NOT FOUND: ${b.abbrev.toUpperCase()} has no working audio folder on the server!`);
    }
  }
  
  console.log("\n=== FINAL WORKING PATHS MAP ===");
  console.log(JSON.stringify(results, null, 2));
}

run();
