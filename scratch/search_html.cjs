const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/biblia/livros/pt-BR';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log("=== SEARCHING HTML FOR BOOK INFO ===");
    console.log("Has GENESIS:", res.data.includes('GENESIS'));
    console.log("Has Genesis:", res.data.includes('Genesis'));
    console.log("Has Gênesis:", res.data.includes('Gênesis'));
    console.log("Has MATEUS:", res.data.includes('MATEUS'));
    console.log("Has Mateus:", res.data.includes('Mateus'));
    
    // Let's print out all text inside divs that have class or id
    const divs = [];
    $('div').each((i, el) => {
      const cls = $(el).attr('class') || '';
      const id = $(el).attr('id') || '';
      const txt = $(el).text().trim().substring(0, 100);
      if (cls || id) {
        divs.push({ class: cls, id: id, textLength: txt.length, sample: txt });
      }
    });
    console.log("Found divs:", divs.length);
    console.log(divs.slice(0, 30));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
