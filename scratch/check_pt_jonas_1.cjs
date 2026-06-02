const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/peraqim/pt-BR/girsa_0002_JONAS_001.js';
  const res = await axios.get(url);
  const data = res.data;
  
  const lines = data.split('mGirsa0002.push');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/Pasuq2\(\s*['"`](.*?)['"`]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]/);
    if (match) {
      console.log(`Push ${i}: text=${match[1].substring(0, 30)} cap=${match[2]} ver=${match[3]}`);
    }
  }
}

run();
