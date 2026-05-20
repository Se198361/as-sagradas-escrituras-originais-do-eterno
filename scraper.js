/**
 * Este é um script de exemplo para extrair os dados interlineares do site.
 * Como são 31.000 versículos, o processo é longo e deve ser feito com cuidado (delay)
 * para não sobrecarregar os servidores do site original.
 * 
 * Antes de rodar, instale as dependências:
 * npm install axios cheerio
 * 
 * Para rodar:
 * node scraper.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://hebraico.pro.br/biblia';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeVerse(bookId, chapter, verse) {
  try {
    // Exemplo de URL - A estrutura real depende da rota interna do site
    const url = `${BASE_URL}/capitulo/pt-BR/${bookId}/${chapter}/${verse}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Aqui você insere os seletores CSS corretos da página para extrair os blocos
    // Exemplo genérico:
    const words = [];
    $('.word-block-class').each((i, el) => {
      words.push({
        hebrew: $(el).find('.hebrew-text').text().trim(),
        transliteration: $(el).find('.translit-text').text().trim(),
        portuguese: $(el).find('.pt-text').text().trim(),
        number: `${chapter}.${verse}`
      });
    });

    const fullPt = $('.full-pt-verse-class').text().trim();

    return { chapter, verse, text_pt: fullPt, words };
  } catch (error) {
    console.error(`Erro ao buscar ${bookId} ${chapter}:${verse}`, error.message);
    return null;
  }
}

async function startScraping() {
  console.log('Iniciando extração...');
  const database = [];

  // Exemplo para Gênesis (id 1), Capítulo 1, Versículos 1 a 3
  for (let v = 1; v <= 3; v++) {
    console.log(`Baixando Gênesis 1:${v}...`);
    const data = await scrapeVerse(1, 1, v);
    if (data) database.push(data);
    
    // DELAY CRUCIAL: Espera 2 segundos entre cada requisição para evitar bloqueio (Rate Limit)
    await delay(2000); 
  }

  fs.writeFileSync('biblia_interlinear.json', JSON.stringify(database, null, 2));
  console.log('Extração concluída e salva em biblia_interlinear.json!');
}

// Descomente a linha abaixo para iniciar a extração quando estiver pronto
// startScraping();
