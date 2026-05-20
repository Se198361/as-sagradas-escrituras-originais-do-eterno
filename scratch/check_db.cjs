const fs = require('fs');
const path = require('path');

const booksJsonPath = path.join(__dirname, '../public/db/books.json');
const dbDir = path.join(__dirname, '../public/db');

try {
  const books = JSON.parse(fs.readFileSync(booksJsonPath, 'utf8'));
  console.log(`Total de livros cadastrados em books.json: ${books.length}`);
  
  let missing = [];
  let empty = [];
  let stats = [];

  books.forEach(book => {
    const filePath = path.join(dbDir, `${book.abbrev}.json`);
    if (!fs.existsSync(filePath)) {
      missing.push(book.name + ` (${book.abbrev})`);
      return;
    }

    const statsObj = fs.statSync(filePath);
    if (statsObj.size <= 3) {
      empty.push(book.name + ` (${book.abbrev})`);
      return;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Calculate chapters and verses
      const chapters = new Set(data.map(v => v.chapter));
      stats.push({
        name: book.name,
        abbrev: book.abbrev,
        chapters: chapters.size,
        verses: data.length,
        sizeKb: Math.round(statsObj.size / 1024)
      });
    } catch (e) {
      empty.push(book.name + ` (${book.abbrev}) - JSON INVÁLIDO: ${e.message}`);
    }
  });

  console.log('\n=== LIVROS AUSENTES ===');
  if (missing.length === 0) console.log('Nenhum!');
  else console.log(missing.join(', '));

  console.log('\n=== LIVROS VAZIOS OU INVÁLIDOS ===');
  if (empty.length === 0) console.log('Nenhum!');
  else console.log(empty.join('\n'));

  console.log('\n=== LIVROS EXTRAÍDOS (AMOSTRA) ===');
  console.log(stats.slice(0, 10).map(s => `${s.name} (${s.abbrev}): ${s.chapters} caps, ${s.verses} vers. (${s.sizeKb} KB)`).join('\n'));
  if (stats.length > 10) console.log(`... e mais ${stats.length - 10} livros.`);

  const totalVerses = stats.reduce((acc, curr) => acc + curr.verses, 0);
  console.log(`\nTotal de versículos extraídos no banco de dados local: ${totalVerses}`);

} catch (error) {
  console.error('Erro ao processar verificação:', error.message);
}
