const axios = require('axios');

async function run() {
  const url = 'https://hebraico.pro.br/js/pages/biblia/biblia.js';
  const res = await axios.get(url);
  const t = res.data;
  
  // Find all .php or API paths or fetch/ajax requests
  const phpUrls = t.match(/[\w-/]+\.php/g) || [];
  const fetchUrls = t.match(/['"`]\/[\w-/]+['"`]/g) || [];
  
  console.log('PHP Urls:', [...new Set(phpUrls)]);
  console.log('Fetch Urls:', [...new Set(fetchUrls)].slice(0, 30));
}

run().catch(console.error);
