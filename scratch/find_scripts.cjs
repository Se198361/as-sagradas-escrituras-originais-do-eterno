const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/biblia/pt-BR+he_pt-BR/GENESIS/1/1/pt-BR#';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log("=== SCRIPTS LOADED ===");
    $('script').each((i, el) => {
      const src = $(el).attr('src') || '';
      if (src) {
        console.log(`Script ${i}: ${src}`);
      } else {
        const text = $(el).text().trim();
        if (text.includes('sederSefarim') || text.includes('SederSefarim') || text.includes('sederSefarimH')) {
          console.log(`Inline Script ${i} (contains search term): ${text.substring(0, 1000)}`);
        }
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
