const axios = require('axios');
const cheerio = require('cheerio');

async function testFetch() {
  try {
    const url = 'https://hebraico.pro.br/biblia/pt-BR+he_pt-BR/GENESIS/1/1/pt-BR';
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
      }
    });
    const $ = cheerio.load(res.data);
    
    // As in the provided image from hebraico.pro.br, interlinear words are often in a table or divs
    // Let's print out table rows
    console.log("== TABELAS ==");
    $('table tr').each((i, row) => {
      console.log(`Linha ${i}:`, $(row).text().replace(/\s+/g, ' ').trim());
    });
    
    // Also check for specific classes often used
    console.log("\n== OUTRAS ESTRUTURAS COM HEBRAICO ==");
    $('td, div, span').each((i, el) => {
      const text = $(el).text();
      // Match Hebrew characters
      if (text.match(/[\u0590-\u05FF]/)) {
        console.log(`Elemento ${el.name} (class=${$(el).attr('class')}):`, text.replace(/\s+/g, ' ').trim());
      }
    });

  } catch (e) {
    console.error("Erro:", e.message);
  }
}

testFetch();
