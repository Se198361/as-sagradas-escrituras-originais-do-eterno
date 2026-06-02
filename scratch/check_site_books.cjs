const axios = require('axios');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/biblia/livros/pt-BR';
    const res = await axios.get(url);
    const data = res.data;
    console.log("Fetched book list length:", data.length);
    console.log("=== FIRST 2000 CHARS OF BOOK LIST ===");
    console.log(JSON.stringify(data, null, 2).substring(0, 2000));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
