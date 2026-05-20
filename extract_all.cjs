const axios = require('axios');
const fs = require('fs');

const booksMap = [
  { id: 1, name: 'GENESIS', chapters: 50, abbrev: 'gn', cat: 'A Lei (Torá)', test: 'Antigo Testamento' },
  { id: 2, name: 'EXODO', chapters: 40, abbrev: 'ex', cat: 'A Lei (Torá)', test: 'Antigo Testamento' },
  { id: 3, name: 'LEVITICO', chapters: 27, abbrev: 'lv', cat: 'A Lei (Torá)', test: 'Antigo Testamento' },
  { id: 4, name: 'NUMEROS', chapters: 36, abbrev: 'nm', cat: 'A Lei (Torá)', test: 'Antigo Testamento' },
  { id: 5, name: 'DEUTERONOMIO', chapters: 34, abbrev: 'dt', cat: 'A Lei (Torá)', test: 'Antigo Testamento' },
  { id: 6, name: 'JOSUE', chapters: 24, abbrev: 'js', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 7, name: 'JUIZES', chapters: 21, abbrev: 'jz', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 8, name: '1SAMUEL', chapters: 31, abbrev: '1sm', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 9, name: '2SAMUEL', chapters: 24, abbrev: '2sm', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 10, name: '1REIS', chapters: 22, abbrev: '1rs', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 11, name: '2REIS', chapters: 25, abbrev: '2rs', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 12, name: 'ISAIAS', chapters: 66, abbrev: 'is', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 13, name: 'JEREMIAS', chapters: 52, abbrev: 'jr', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 14, name: 'EZEQUIEL', chapters: 48, abbrev: 'ez', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 15, name: 'OSEIAS', chapters: 14, abbrev: 'os', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 16, name: 'JOEL', chapters: 3, abbrev: 'jl', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 17, name: 'AMOS', chapters: 9, abbrev: 'am', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 18, name: 'OBADIAS', chapters: 1, abbrev: 'ob', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 19, name: 'JONAS', chapters: 4, abbrev: 'jn', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 20, name: 'MIQUEIAS', chapters: 7, abbrev: 'mq', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 21, name: 'NAUM', chapters: 3, abbrev: 'na', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 22, name: 'HABACUQUE', chapters: 3, abbrev: 'hc', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 23, name: 'SOFONIAS', chapters: 3, abbrev: 'sf', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 24, name: 'AGEU', chapters: 2, abbrev: 'ag', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 25, name: 'ZACARIAS', chapters: 14, abbrev: 'zc', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 26, name: 'MALAQUIAS', chapters: 4, abbrev: 'ml', cat: 'Profetas (Nevi\'im)', test: 'Antigo Testamento' },
  { id: 27, name: 'SALMOS', chapters: 150, abbrev: 'sl', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 28, name: 'PROVERBIOS', chapters: 31, abbrev: 'pv', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 29, name: 'JO', chapters: 42, abbrev: 'jo', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 30, name: 'CANTARES', chapters: 8, abbrev: 'ct', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 31, name: 'RUTE', chapters: 4, abbrev: 'rt', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 32, name: 'LAMENTACOES', chapters: 5, abbrev: 'lm', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 33, name: 'ECLESIASTES', chapters: 12, abbrev: 'ec', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 34, name: 'ESTER', chapters: 10, abbrev: 'et', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 35, name: 'DANIEL', chapters: 12, abbrev: 'dn', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 36, name: 'ESDRAS', chapters: 10, abbrev: 'ed', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 37, name: 'NEEMIAS', chapters: 13, abbrev: 'ne', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 38, name: '1CRONICAS', chapters: 29, abbrev: '1cr', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 39, name: '2CRONICAS', chapters: 36, abbrev: '2cr', cat: 'Escrituras (Ketuvim)', test: 'Antigo Testamento' },
  { id: 40, name: 'MATEUS', chapters: 28, abbrev: 'mt', cat: 'Evangelhos', test: 'Novo Testamento' },
  { id: 41, name: 'MARCOS', chapters: 16, abbrev: 'mc', cat: 'Evangelhos', test: 'Novo Testamento' },
  { id: 42, name: 'LUCAS', chapters: 24, abbrev: 'lc', cat: 'Evangelhos', test: 'Novo Testamento' },
  { id: 43, name: 'JOAO', chapters: 21, abbrev: 'jo', cat: 'Evangelhos', test: 'Novo Testamento' },
  { id: 44, name: 'ATOS', chapters: 28, abbrev: 'at', cat: 'Livro Histórico', test: 'Novo Testamento' },
  { id: 45, name: 'ROMANOS', chapters: 16, abbrev: 'rm', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 46, name: '1CORINTIOS', chapters: 16, abbrev: '1co', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 47, name: '2CORINTIOS', chapters: 13, abbrev: '2co', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 48, name: 'GALATAS', chapters: 6, abbrev: 'gl', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 49, name: 'EFESIOS', chapters: 6, abbrev: 'ef', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 50, name: 'FILIPENSES', chapters: 4, abbrev: 'fp', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 51, name: 'COLOSSENSES', chapters: 4, abbrev: 'cl', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 52, name: '1TESSALONICENSES', chapters: 5, abbrev: '1ts', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 53, name: '2TESSALONICENSES', chapters: 3, abbrev: '2ts', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 54, name: '1TIMOTEO', chapters: 6, abbrev: '1tm', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 55, name: '2TIMOTEO', chapters: 4, abbrev: '2tm', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 56, name: 'TITO', chapters: 3, abbrev: 'tt', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 57, name: 'FILEMOM', chapters: 1, abbrev: 'fm', cat: 'Epístolas Paulinas', test: 'Novo Testamento' },
  { id: 58, name: 'HEBREUS', chapters: 13, abbrev: 'hb', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 59, name: 'TIAGO', chapters: 5, abbrev: 'tg', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 60, name: '1PEDRO', chapters: 5, abbrev: '1pe', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 61, name: '2PEDRO', chapters: 3, abbrev: '2pe', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 62, name: '1JOAO', chapters: 5, abbrev: '1jo', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 63, name: '2JOAO', chapters: 1, abbrev: '2jo', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 64, name: '3JOAO', chapters: 1, abbrev: '3jo', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 65, name: 'JUDAS', chapters: 1, abbrev: 'jd', cat: 'Epístolas Universais', test: 'Novo Testamento' },
  { id: 66, name: 'APOCALIPSE', chapters: 22, abbrev: 'ap', cat: 'Revelação', test: 'Novo Testamento' }
];

const delay = ms => new Promise(res => setTimeout(res, ms));

const cleanHtml = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').trim();
};

async function extract() {
  console.log("Iniciando extração ultrarrápida da Bíblia Interlinear...");
  const database = [];

  for (const book of booksMap) {
    console.log(`Baixando: ${book.name}`);
    for (let chapter = 1; chapter <= book.chapters; chapter++) {
      const chapterStr = String(chapter).padStart(3, '0');
      // A URL identificada que carrega os dados brutos de forma rápida:
      const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_${book.name}_${chapterStr}.js`;
      
      let success = false;
      let retries = 3;
      while(!success && retries > 0) {
        try {
           const res = await axios.get(url, { 
             responseType: 'text', 
             timeout: 5000,
             headers: { 'Connection': 'close' }
           });
           const jsCode = res.data;
           
           // Regex para pegar os parâmetros de "new PasuqBeinliniari(...)"
           // Pega os 3 primeiros arrays: hebraico, transliteração, português
           // Pega o capítulo e o versículo
           const regex = /new PasuqBeinliniari\(\s*\[(.*?)\]\s*,\s*\[(.*?)\]\s*,\s*\[(.*?)\]\s*,\s*`(.*?)`\s*,\s*`(.*?)`/g;
           
           let match;
           while ((match = regex.exec(jsCode)) !== null) {
              const hebrewArr = match[1].split(',').map(s => s.replace(/`/g, '').trim());
              const translitArr = match[2].split(',').map(s => s.replace(/`/g, '').trim());
              const ptArr = match[3].split(',').map(s => s.replace(/`/g, '').trim());
              const chap = parseInt(match[4]);
              const verseNumber = parseInt(match[5]);

              const words = [];
              let fullTextPt = '';

              for (let i = 0; i < hebrewArr.length; i++) {
                 const rawHebrew = hebrewArr[i];
                 const strongMatch = rawHebrew.match(/s=([A-Z0-9_]+)/i);
                 const strongNumber = strongMatch ? strongMatch[1] : '';
                 const ptClean = cleanHtml(ptArr[i]);
                 
                 words.push({
                   hebrew: cleanHtml(rawHebrew),
                   transliteration: cleanHtml(translitArr[i]),
                   portuguese: ptClean,
                   number: strongNumber
                 });
                 if(ptClean && ptClean !== '-') fullTextPt += ptClean + ' ';
              }

              database.push({
                book_abbrev: book.abbrev,
                chapter: chap,
                verse: verseNumber,
                text_pt: fullTextPt.trim(),
                words: words
              });
           }
           success = true;
           
        } catch (err) {
           if(err.response && err.response.status === 404) {
              console.log(`Capítulo ${chapter} não encontrado para ${book.name}`);
              success = true; // no need to retry 404
           } else {
              retries--;
              if (retries === 0) {
                 console.error(`Erro fatal em ${book.name} cap ${chapter}: ${err.message}`);
              } else {
                 console.log(`Tentando novamente ${book.name} cap ${chapter} (${retries} tentativas restantes)...`);
                 await delay(1000);
              }
           }
        }
      }
      
      // Delay minúsculo apenas para não sobrecarregar
      await delay(100);
    }
  }

  // Save to assets directory
  fs.writeFileSync('./src/assets/biblia_interlinear.json', JSON.stringify(database, null, 2));
  console.log('Extração concluída com sucesso! Banco salvo em src/assets/biblia_interlinear.json');
}

extract();
