const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  // Find lines that contain Module or AcharonModule
  const lines = t.split('\n');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Module') || lines[i].includes('AcharonModule')) {
      console.log(`Line ${i + 1}: ${lines[i].substring(0, 300)}`);
      count++;
      if (count > 20) break;
    }
  }
}

run().catch(console.error);
