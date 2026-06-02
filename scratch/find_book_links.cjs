const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/biblia/livros/pt-BR';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log("=== PARSING ALL LINKS ===");
    const allLinks = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      allLinks.push({ href, text });
    });
    
    console.log("Total links found:", allLinks.length);
    allLinks.forEach((l, idx) => {
      if (l.href.includes('GENESIS') || l.href.includes('MATEUS') || l.text.includes('Gênesis') || l.text.includes('Mateus')) {
        console.log(`Link ${idx}: [${l.text}](${l.href})`);
      }
    });
    
    console.log("\n=== FIRST 50 LINKS ===");
    console.log(allLinks.slice(0, 50));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
