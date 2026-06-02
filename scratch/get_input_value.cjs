const axios = require('axios');
const cheerio = require('cheerio');

async function testPage(book) {
  try {
    const url = `https://hebraico.pro.br/biblia/pt-BR+he_pt-BR/${book}/1/1/pt-BR`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    console.log(`\n=== INPUTS FOR ${book} ===`);
    $('input[type="hidden"]').each((i, el) => {
      console.log(`  Input ID: ${$(el).attr('id')}, Value: ${$(el).attr('value')}`);
    });
  } catch (err) {
    console.error(`Error for ${book}:`, err.message);
  }
}

async function run() {
  await testPage('GENESIS');
  await testPage('LEVITICO');
  await testPage('NUMEROS');
  await testPage('DEUTERONOMIO');
  await testPage('JONAS');
}

run();
