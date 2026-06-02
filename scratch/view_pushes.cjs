const axios = require('axios');

async function run() {
  const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_JONAS_001.js`;
  const res = await axios.get(url);
  const data = res.data;
  
  const lines = data.split('mGirsa0001_0002.push');
  console.log("Lines length:", lines.length);
  
  console.log("=== Push 2 ===");
  console.log(lines[2].substring(0, 500));
  
  console.log("=== Push 18 ===");
  console.log(lines[18].substring(0, 500));
}

run();
