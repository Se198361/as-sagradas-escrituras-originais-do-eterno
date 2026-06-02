const axios = require('axios');

function cleanHebrewText(htmlStr) {
  return htmlStr.replace(/<[^>]+>/g, '').trim();
}

function parseArray(str) {
  const results = [];
  let current = '';
  let inString = false;
  let quoteChar = null;
  for (let i = 0; i < str.length; i++) {
    if ((str[i] === "'" || str[i] === '"' || str[i] === '`') && (i === 0 || str[i-1] !== '\\')) {
      if (!inString) {
        inString = true;
        quoteChar = str[i];
      } else if (quoteChar === str[i]) {
        inString = false;
        results.push(current);
        current = '';
      } else {
        current += str[i];
      }
    } else if (inString) {
      current += str[i];
    }
  }
  return results;
}

function parsePasuqBeinliniari(line) {
  const match = line.match(/PasuqBeinliniari\(\s*\[([\s\S]*?)\]\s*,\s*\[([\s\S]*?)\]\s*,\s*\[([\s\S]*?)\]\s*,\s*['"`](\d+)['"`]\s*,\s*['"`](\d+)['"`]/);
  if (!match) return null;
  
  const hebrewArr = parseArray(match[1]);
  const transArr = parseArray(match[2]);
  const ptArr = parseArray(match[3]);
  const chapter = parseInt(match[4], 10);
  const verse = parseInt(match[5], 10);
  
  const words = [];
  for (let i = 0; i < hebrewArr.length; i++) {
    words.push({
      hebrew: cleanHebrewText(hebrewArr[i] || ''),
      transliteration: cleanHebrewText(transArr[i] || ''),
      portuguese: cleanHebrewText(ptArr[i] || ''),
      number: `${chapter}.${verse}`
    });
  }
  return { chapter, verse, words, lineLength: line.length };
}

async function test() {
  const url = `https://hebraico.pro.br/peraqim/he_pt-BR/girsa_0001_0002_JONAS_001.js`;
  const res = await axios.get(url);
  const heData = res.data;
  
  const lines = heData.split(/mGirsa0001_0002\.push/);
  console.log("Found pushes:", lines.length);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const p = parsePasuqBeinliniari(line);
    if (p) {
      console.log(`Push ${i}: cap=${p.chapter} ver=${p.verse} words=${p.words.length} has_pt=${p.words.some(w => w.portuguese)}`);
    } else {
      console.log(`Push ${i}: failed to parse. Snippet: ${line.substring(0, 100).replace(/\s+/g, ' ')}`);
    }
  }
}

test();
