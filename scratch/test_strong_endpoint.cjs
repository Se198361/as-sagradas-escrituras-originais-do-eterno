const axios = require('axios');

async function test(url) {
  try {
    const res = await axios.get(url);
    const html = res.data;
    console.log(`URL: ${url}`);
    console.log(`Contains 'lembrar': ${html.toLowerCase().includes('lembrar')}`);
    console.log(`Contains 'recordar': ${html.toLowerCase().includes('recordar')}`);
    console.log(`Contains 'zakar': ${html.toLowerCase().includes('zakar')}`);
    
    // Print all <script> tag contents to see if there is inline data
    const scripts = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/g) || [];
    console.log(`Found ${scripts.length} scripts`);
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].includes('zakar') || scripts[i].includes('H02142') || scripts[i].includes('lembrar')) {
        console.log(`Script ${i + 1} contains target!`);
        console.log(scripts[i].substring(0, 1000));
      }
    }
  } catch (e) {
    console.log(`FAILED: ${url} -> ${e.message}`);
  }
}

async function run() {
  await test('https://hebraico.pro.br/strongqatan/H02142/pt/1/pt');
}

run().catch(console.error);
