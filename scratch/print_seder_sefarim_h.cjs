const axios = require('axios');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/min/production.min.js?v=2.1.1';
    const res = await axios.get(url);
    const code = res.data;
    
    console.log("=== EXTRACTING ALL sederSefarimH INDICES ===");
    const regex = /sederSefarimH\[(\d+)\]\s*=\s*['"`]([A-Z0-9]+)['"`]/g;
    let match;
    const mapping = {};
    while ((match = regex.exec(code)) !== null) {
      mapping[parseInt(match[1])] = match[2];
    }
    
    console.log("Total mapped indexes:", Object.keys(mapping).length);
    for (let i = 0; i < 66; i++) {
      console.log(`Index ${i} (Seder ${i + 1}): ${mapping[i]}`);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
