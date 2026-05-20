import * as fs from 'fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('scratch/genesis1.html', 'utf8');
const $ = cheerio.load(html);

console.log("=== EXTRAINDO DADOS DOS SCRIPTS ===");
// Os dados estão injetados em algum arquivo .js referenciado no script tag ou dentro dele mesmo.
let found = false;
$('script').each((i, el) => {
  const content = $(el).html();
  const src = $(el).attr('src');
  
  if (content && content.includes('בְּרֵאשִׁית')) {
    console.log(`\nEncontramos Hebraico no script interno ${i}:`);
    console.log(content.substring(0, 500) + '...');
    found = true;
  }
  
  if (src && src.includes('girsa') || src && src.includes('peraqim')) {
     console.log(`Script externo potencial: ${src}`);
  }
});

// Outra forma de ver os arquivos .js que ele carrega para Gênesis 1
const scriptTags = html.match(/<script.*?src="(.*?)".*?>/g);
if (scriptTags) {
   scriptTags.forEach(tag => {
      if(tag.includes('GENESIS')) console.log("Arquivo JSON/JS do capítulo:", tag);
   });
}
