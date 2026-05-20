const axios = require('axios');

async function test() {
  try {
    const url = 'https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_MATEUS_001.js';
    console.log(`Fetching ${url}...`);
    const res = await axios.get(url, { headers: { 'Connection': 'close' } });
    const jsCode = res.data;
    console.log("Length of jsCode:", jsCode.length);
    
    // Find all matches for "shemSefer" or search for Portuguese text in the jsCode
    // In mt.json, the first verse is "Livro da geração de Jesus Cristo,[Heb. I\'hésu Messias] filho de Davi,[David] filho de Abraão.[Abraham]"
    // Let's see if "Livro da geração" is inside the jsCode
    const ptTerm = "Livro da";
    const idxPt = jsCode.indexOf(ptTerm);
    if (idxPt !== -1) {
      console.log(`Found "${ptTerm}" at index ${idxPt}:`);
      console.log(jsCode.substring(idxPt - 100, idxPt + 500));
    } else {
      console.log(`Could not find "${ptTerm}" in jsCode!`);
    }

    // Let's print the end of the file
    console.log("=== End of file (last 1000 chars) ===");
    console.log(jsCode.substring(jsCode.length - 1000));
    console.log("======================================");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
