const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  // Find lines or blocks that contain "strongqatan" or "milonqatan"
  const lines = t.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('strongqatan') || lines[i].includes('milonqatan')) {
      console.log(`Line ${i + 1}: ${lines[i].substring(0, 300)}`);
    }
  }
}

run().catch(console.error);
