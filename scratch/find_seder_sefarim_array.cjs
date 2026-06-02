const axios = require('axios');

async function run() {
  try {
    const url = 'https://hebraico.pro.br/min/production.min.js?v=2.1.1';
    const res = await axios.get(url);
    const code = res.data;
    
    console.log("=== SCANNING FOR sederSefarimH ARRAY ===");
    const match = code.match(/sederSefarimH\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
      console.log("Found sederSefarimH array content:");
      console.log(match[0].substring(0, 2000));
    } else {
      console.log("sederSefarimH = [...] not found, scanning for other assignments...");
      const match2 = code.match(/sederSefarimH\b[\s\S]{0,100}/g);
      console.log("Close matches:", match2);
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

run();
