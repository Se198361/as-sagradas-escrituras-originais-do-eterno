const axios = require('axios');

async function test() {
  try {
    const url = 'https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_MATEUS_001.js';
    console.log(`Fetching ${url}...`);
    const res = await axios.get(url, { headers: { 'Connection': 'close' } });
    const jsCode = res.data;
    console.log("Length of jsCode:", jsCode.length);
    // Print first 1000 characters
    console.log("=== First 1000 chars ===");
    console.log(jsCode.substring(0, 1000));
    console.log("========================");
    
    // Let's find the first occurrence of "new PasuqBeinliniari"
    const idx = jsCode.indexOf('new PasuqBeinliniari');
    if (idx !== -1) {
      console.log("=== First PasuqBeinliniari call ===");
      console.log(jsCode.substring(idx, idx + 1000));
      console.log("===================================");
    } else {
      console.log("Could not find new PasuqBeinliniari!");
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
