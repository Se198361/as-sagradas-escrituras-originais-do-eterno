const axios = require('axios');

async function run() {
  const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_JONAS_001.js`;
  const res = await axios.get(url);
  const data = res.data;
  
  const lines = data.split('mGirsa0001_0002.push');
  console.log("=== Push 16 ===");
  console.log(lines[16]);
  
  console.log("=== Push 17 ===");
  console.log(lines[17]);
}

run();
