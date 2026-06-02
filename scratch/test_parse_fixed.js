const line = `mGirsa0001_0002.push(new PasuqBeinliniari(
['<h s=H06965>קוּם</h>', '<h s=H01980>לֵךְ</h>', '<h s=H0413>אֶל</h>- <h s=H05210>נִינְוֵה</h> <h s=H05892>הָעִיר</h> <h s=H01419>הַגְּדוֹלָה</h>', '<h s=H07121>וּקְרָא</h>', '<h s=H05921>עָלֶיהָ</h>', '<h s=H03588>כִּי</h>- <h s=H05927>עָלְתָה</h>', '<h s=H07451>רָעָתָם</h>', '<h s=H06440>לְפָנָי:</h>'], 
['QUM', 'LEKH', 'EL-NYNËVEH HÅYR HAGËDOLÅH', 'UQËRÅ', 'ÅLEYHÅ', 'KY-ÅLËTÅH', 'RÅÅTÅM', 'LËFÅNÅY:'], 
['Levanta-te,', 'vai', 'à grande cidade de Nínive,', 'e clama', 'contra ela,', 'porque subiu', 'sua malícia', 'até mim. {lit.: diante de minha face}'], 
'1', 
'2', 
11.413, 
19.432, 
'<a class="obs">Obs:</a> '
)
);`;

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
  // Try to parse using regex with [\s\S] instead of .
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
  return { chapter, verse, words };
}

console.log("MATCH:", JSON.stringify(parsePasuqBeinliniari(line), null, 2));
