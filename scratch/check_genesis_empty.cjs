const axios = require('axios');

async function check() {
  let emptyCaps = [];
  let populatedCaps = [];
  for (let cap = 1; cap <= 50; cap++) {
    const capStr = String(cap).padStart(3, '0');
    const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_GENESIS_${capStr}.js`;
    try {
      const res = await axios.get(url);
      const data = res.data;
      // Find all matches of PasuqBeinliniari and check if third array has non-empty elements
      const matches = [...data.matchAll(/PasuqBeinliniari\(\s*\[[\s\S]*?\]\s*,\s*\[[\s\S]*?\]\s*,\s*\[([\s\S]*?)\]/g)];
      let allEmpty = true;
      for (const match of matches) {
        const ptContent = match[1].trim();
        if (ptContent && ptContent !== "''" && ptContent !== '""' && ptContent !== '``') {
          allEmpty = false;
          break;
        }
      }
      if (allEmpty) {
        emptyCaps.push(cap);
      } else {
        populatedCaps.push(cap);
      }
    } catch(e) {
      console.error(`Error on cap ${cap}:`, e.message);
    }
  }
  console.log('Empty chapters in Genesis:', emptyCaps.length, emptyCaps);
  console.log('Populated chapters in Genesis:', populatedCaps.length, populatedCaps);
}

check();
