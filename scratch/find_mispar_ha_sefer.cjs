const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  const lines = t.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('misparHaSefer')) {
      console.log(`Line ${i + 1}: ${lines[i].substring(0, 300)}`);
    }
  }
}

run().catch(console.error);
