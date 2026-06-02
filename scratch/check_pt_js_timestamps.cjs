const axios = require('axios');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/peraqim/pt-BR/girsa_0002_NUMEROS_001.js';
    const res = await axios.get(url);
    console.log("Fetched pt-BR NUMEROS JS length:", res.data.length);
    console.log("=== FIRST 1000 CHARS ===");
    console.log(res.data.substring(0, 1000));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
