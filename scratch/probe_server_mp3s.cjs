const axios = require('axios');

async function test(url) {
  try {
    const res = await axios.head(url, { timeout: 3000 });
    return res.status === 200;
  } catch (err) {
    return false;
  }
}

async function run() {
  console.log("=== PROBING ALL 66 SEDER FOLDERS FOR NUMEROS ===");
  for (let i = 1; i <= 66; i++) {
    const padded = String(i).padStart(3, '0');
    // We will test folders with both NUMEROS and BEMIDBAR or other possible variations
    const names = ['NUMEROS', 'NUMEROS_001', 'BEMIDBAR'];
    for (const name of names) {
      const url = `https://hebraico.pro.br/girsaot/he/biblia/mp3/${padded}_${name}/${name}_001.mp3`;
      const ok = await test(url);
      if (ok) {
        console.log(`FOUND WORKING MP3: ${url}`);
      }
    }
  }
  console.log("=== DONE PROBING ===");
}

run();
