const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const mainUrl = 'https://hebraico.pro.br/biblia/pt-BR+he_pt-BR/GENESIS/1/1/pt-BR';
    const res = await axios.get(mainUrl);
    const $ = cheerio.load(res.data);
    
    const scripts = [];
    $('script').each((i, el) => {
      let src = $(el).attr('src') || '';
      if (src) {
        if (src.startsWith('/')) {
          src = 'https://hebraico.pro.br' + src;
        }
        scripts.push(src);
      }
    });
    
    console.log("Found scripts to scan:", scripts.length);
    
    for (const url of scripts) {
      if (url.includes('google') || url.includes('stripe') || url.includes('jquery') || url.includes('bootstrap')) {
        continue;
      }
      try {
        const sRes = await axios.get(url);
        const code = sRes.data;
        if (code.includes('sederSefarimH') || code.includes('SederSefarimH')) {
          console.log(`\n>>> FOUND in script: ${url}`);
          // Let's print out lines containing it
          const lines = code.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('sederSefarimH') || lines[i].includes('SederSefarimH')) {
              console.log(`Line ${i + 1}: ${lines[i].substring(0, 1000)}`);
            }
          }
        }
      } catch (e) {
        console.error(`Failed to fetch script ${url}:`, e.message);
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
