const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  const lines = t.split('\n');
  for (let i = 880; i <= 960; i++) {
    if (lines[i]) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
}

run().catch(console.error);
