import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('scratch/genesis1.html', 'utf8');
const $ = cheerio.load(html);

console.log("=== Buscando tags h ou span com hebraico ===");
let hebrewElement = null;

// The page content is likely loaded via AJAX (since we didn't find much in the raw HTML).
// Let's check for scripts containing JSON data.
$('script').each((i, el) => {
  const content = $(el).html();
  if (content && content.includes('GENESIS') || content && content.match(/[\u0590-\u05FF]/)) {
    console.log(`Script ${i} contem possivel JSON.`);
    if (content.length < 1000) {
      console.log(content);
    } else {
       console.log(content.substring(0, 500) + '...');
    }
  }
});
