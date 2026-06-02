const axios = require('axios');
const cheerio = require('cheerio');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/biblia/livros/pt-BR';
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log("=== PARSING BOOKS FROM HEBRAICO.PRO.BR ===");
    
    // Find all links that look like a book link
    const links = [];
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href.includes('/biblia/') || href.includes('/peraqim/')) {
        links.push({ href, text });
      }
    });
    
    console.log("Found links:", links.length);
    console.log(links.slice(0, 50));
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
