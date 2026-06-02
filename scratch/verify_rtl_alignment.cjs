const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '..', 'public', 'db');

const testCases = [
  { name: 'Gênesis (gn)', file: 'gn.json', chap: 1, vers: 1 },
  { name: 'Salmos (sl)', file: 'sl.json', chap: 23, vers: 1 },
  { name: 'Provérbios (pv)', file: 'pv.json', chap: 1, vers: 1 },
  { name: 'Isaías (is)', file: 'is.json', chap: 1, vers: 1 },
  { name: 'Mateus (mt)', file: 'mt.json', chap: 1, vers: 1 },
  { name: 'João (jo)', file: 'jo.json', chap: 1, vers: 1 },
  { name: 'Romanos (rm)', file: 'rm.json', chap: 1, vers: 1 },
  { name: 'Apocalipse (ap)', file: 'ap.json', chap: 1, vers: 1 }
];

console.log('=== AUDITORIA DE ALINHAMENTO RTL DA BÍBLIA ===\n');

testCases.forEach(tc => {
  const file = path.join(dbDir, tc.file);
  if (!fs.existsSync(file)) return;
  
  const verses = JSON.parse(fs.readFileSync(file, 'utf8'));
  const v = verses.find(x => x.chapter === tc.chap && x.verse === tc.vers);
  if (!v) return;

  console.log(`Livro: ${tc.name} ${tc.chap}:${tc.vers}`);
  console.log(`Texto PT Completo (LTR): "${v.text_pt}"`);
  console.log(`Ordem de Leitura no Aplicativo (Da Direita para a Esquerda / RTL):`);
  
  v.words.forEach((w, idx) => {
    console.log(`  ➔ Palavra [${idx + 1}] (Lida da Direita para Esquerda):`);
    console.log(`     Hebraico: ${w.hebrew}`);
    console.log(`     Transliteração (LTR): ${w.transliteration}`);
    console.log(`     Tradução PT (LTR):    "${w.portuguese}"`);
  });
  console.log('-'.repeat(60) + '\n');
});
