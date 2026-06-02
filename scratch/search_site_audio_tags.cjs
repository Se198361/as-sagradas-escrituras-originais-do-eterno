const axios = require('axios');
const cheerio = require('cheerio');

async function testPage(book, cap) {
  try {
    const url = `https://hebraico.pro.br/biblia/pt-BR+he_pt-BR/${book}/${cap}/1/pt-BR`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log(`\n=== INSPECTING ${book} ${cap} ===`);
    // Find all audio tags
    $('audio').each((i, el) => {
      console.log(`Audio Tag:`, $(el).attr('id'), $(el).attr('src'));
    });
    // Find all source tags
    $('source').each((i, el) => {
      console.log(`Source Tag:`, $(el).attr('src'));
    });
    
    // Find all scripts that might initialize Plyr or construct audio URLs
    $('script').each((i, el) => {
      const text = $(el).text();
      if (text.includes('.mp3') || text.includes('ajaxUrlMp3')) {
        console.log(`Found MP3 in Script:`);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.includes('.mp3') || line.includes('ajaxUrlMp3') || line.includes('girsaot')) {
            console.log(`  Line: ${line.trim()}`);
          }
        }
      }
    });
  } catch (err) {
    console.error(`Error for ${book}:`, err.message);
  }
}

async function run() {
  await testPage('GENESIS', 1);
  await testPage('LEVITICO', 1);
  await testPage('NUMEROS', 1);
  await testPage('DEUTERONOMIO', 1);
  await testPage('JONAS', 1);
}

run();
