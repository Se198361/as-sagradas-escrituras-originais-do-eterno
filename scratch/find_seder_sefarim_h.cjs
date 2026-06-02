const axios = require('axios');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/js/pages/biblia/mishtanimglobalim.js';
    const res = await axios.get(url);
    const t = res.data;
    
    console.log("=== SEARCHING FOR sederSefarimH ===");
    const lines = t.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('sederSefarimH') || lines[i].includes('SederSefarimH')) {
        console.log(`Line ${i + 1}: ${lines[i].substring(0, 1000)}`);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
