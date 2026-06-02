const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  // Find lines that contain ".mp3" or "audio" or "play"
  const lines = t.split('\n');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('.mp3') || line.includes('audio') || line.includes('plyr')) {
      console.log(`Line ${i + 1}: ${lines[i].substring(0, 300)}`);
      count++;
      if (count > 30) break;
    }
  }
}

run().catch(console.error);
