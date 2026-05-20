const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  try {
    const res = await axios.get('https://hebraico.pro.br/biblia/livros/pt-BR');
    const $ = cheerio.load(res.data);
    
    console.log("=== LINKS ENCONTRADOS ===");
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('/biblia/')) {
        console.log($(el).text().trim(), '->', href);
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}

test();
