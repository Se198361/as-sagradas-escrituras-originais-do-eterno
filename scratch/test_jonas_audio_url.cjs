const axios = require('axios');

async function test(url) {
  try {
    const res = await axios.head(url);
    console.log(`URL: ${url} -> SUCCESS (${res.status})`);
  } catch (err) {
    console.log(`URL: ${url} -> FAILED (${err.message})`);
  }
}

async function run() {
  console.log("=== TESTING AUDIO MP3 URLS ===");
  // Test Gênesis (seder 1)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/001_GENESIS/GENESIS_001.mp3');
  // Test Juízes (seder 7)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/007_JUIZES/JUIZES_001.mp3');
  // Test Rute (seder 30 in Hebrew order)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/030_RUTE/RUTE_001.mp3');
  // Test Jonas (seder 19 in Hebrew order)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/019_JONAS/JONAS_001.mp3');
  // Test Salmos (seder 27 in Hebrew order)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/027_SALMOS/SALMOS_001.mp3');
  // Test Daniel (seder 35 in Hebrew order)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/035_DANIEL/DANIEL_001.mp3');
  // Test 1º Samuel (seder 8 in Hebrew order)
  await test('https://hebraico.pro.br/girsaot/he/biblia/mp3/008_1SAMUEL/1SAMUEL_001.mp3');
}

run();
