const axios = require('axios');
const fs = require('fs');

async function run() {
  const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_JONAS_001.js`;
  const res = await axios.get(url);
  const data = res.data;
  
  // Let's print out lines containing "PasuqBeinliniari" with their line numbers
  const lines = data.split('\n');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('PasuqBeinliniari')) {
      console.log(`Line ${i}: ${lines[i].substring(0, 120)}...`);
      count++;
      if (count > 25) break;
    }
  }
}

run();
