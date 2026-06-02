const axios = require('axios');

function parsePasuqTimestamps(line) {
  // Extract up to 7 parameters: arrays, chapter, verse, start_time, end_time
  // new PasuqBeinliniari( [...], [...], [...], 'cap', 'verse', start_time, end_time, ... )
  const regex = /PasuqBeinliniari\(\s*\[[\s\S]*?\]\s*,\s*\[[\s\S]*?\]\s*,\s*\[[\s\S]*?\]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)/;
  const match = line.match(regex);
  if (!match) return null;
  return {
    chapter: parseInt(match[1], 10),
    verse: parseInt(match[2], 10),
    start: parseFloat(match[3]),
    end: parseFloat(match[4])
  };
}

async function run() {
  const url = 'https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_JONAS_001.js';
  const res = await axios.get(url);
  const data = res.data;
  
  const lines = data.split(/mGirsa0001_0002\.push/);
  console.log('Found lines:', lines.length);
  for (const line of lines) {
    const parsed = parsePasuqTimestamps(line);
    if (parsed) {
      console.log(`Verse ${parsed.chapter}:${parsed.verse} -> Start: ${parsed.start}s, End: ${parsed.end}s`);
    }
  }
}

run().catch(console.error);
