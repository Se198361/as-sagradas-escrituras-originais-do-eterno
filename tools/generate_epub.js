import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

// 1. Gematria converter for Hebrew numerals (1.1 -> א.א)
function toHebrewNumeral(n) {
  if (n <= 0) return '';
  const units = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'];
  const tens = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
  const hundreds = ['', 'ק', 'ר', 'ש', 'ת'];
  
  if (n === 15) return 'טו';
  if (n === 16) return 'טז';
  
  let result = '';
  
  const h = Math.floor(n / 100);
  result += hundreds[h] || '';
  
  const remainder = n % 100;
  if (remainder === 15) {
    result += 'טו';
  } else if (remainder === 16) {
    result += 'טז';
  } else {
    const t = Math.floor(remainder / 10);
    const u = remainder % 10;
    result += tens[t] || '';
    result += units[u] || '';
  }
  return result;
}

// 2. Translation Maps & Logic (Mirrors src/utils/judaicTranslator.ts)
const judaicBookNames = {
  gn: 'Bereshit (Gênesis)',
  ex: 'Shemot (Êxodo)',
  lv: 'Vayikra (Levítico)',
  nm: 'Bemidbar (Números)',
  dt: 'Devarim (Deuteronômio)',
  js: 'Yehoshua (Josué)',
  jz: 'Shoftim (Juízes)',
  rt: 'Rut (Rute)',
  '1sm': 'Shmuel Alef (1º Samuel)',
  '2sm': 'Shmuel Bet (2º Samuel)',
  '1rs': 'Melakhim Alef (1º Reis)',
  '2rs': 'Melakhim Bet (2º Reis)',
  '1cr': 'Divrei-HaYamim Alef (1º Crônicas)',
  '2cr': 'Divrei-HaYamim Bet (2º Crônicas)',
  ed: 'Ezra (Esdras)',
  ne: 'Nechemyah (Neemias)',
  et: 'Ester',
  jó: 'Iyov (Jó)',
  sl: 'Tehillim (Salmos)',
  pv: 'Mishlei (Provérbios)',
  ec: 'Kohelet (Eclesiastes)',
  ct: 'Shir-HaShirim (Cantares)',
  is: 'Yesha\'yahu (Isaías)',
  jr: 'Yirmeyahu (Jeremias)',
  lm: 'Eikhah (Lamentações)',
  ez: 'Yechezk\'el (Ezequiel)',
  dn: 'Daniel',
  os: 'Hoshea (Oseias)',
  jl: 'Yo\'el (Joel)',
  am: 'Amos',
  ob: 'Obadyah (Obadias)',
  jn: 'Yonah (Jonas)',
  mq: 'Mikhah (Miqueias)',
  na: 'Nachum (Naum)',
  hc: 'Chavakuk (Habacuque)',
  sf: 'Tzefanyah (Sofonias)',
  ag: 'Chaggai (Ageu)',
  zc: 'Zekharyah (Zacarias)',
  ml: 'Mal\'akhi (Malaquias)',
  mt: 'Mattityahu (Mateus)',
  mc: 'Markos (Marcos)',
  lc: 'Lukas (Lucas)',
  jo: 'Yochanan (João)',
  at: 'Atos dos Emissários',
  rm: 'Romanos',
  '1co': '1ª Coríntios',
  '2co': '2ª Coríntios',
  gl: 'Gálatas',
  ef: 'Efésios',
  fp: 'Filipenses',
  cl: 'Colossenses',
  '1ts': '1ª Tessalonicenses',
  '2ts': '2ª Tessalonicenses',
  '1tm': '1ª Timóteo',
  '2tm': '2ª Timóteo',
  tt: 'Tito',
  fm: 'Filemom',
  hb: 'Hebreus',
  tg: 'Ya\'akov (Tiago)',
  '1pe': 'Kefa Alef (1ª Pedro)',
  '2pe': 'Kefa Bet (2ª Pedro)',
  '1jo': 'Yochanan Alef (1ª João)',
  '2jo': 'Yochanan Bet (2ª João)',
  '3jo': 'Yochanan Guimel (3ª João)',
  jd: 'Yehudah (Judas)',
  ap: 'Revelação (Chazon)'
};

const judaicCategories = {
  'A Lei (Torá)': 'Torá (A Lei)',
  'Históricos': 'Nevi\'im Rishonim (Profetas Anteriores / Históricos)',
  'Poéticos': 'Ketuvim (Escritos / Poéticos)',
  'Profetas Maiores': 'Nevi\'im Acharonim (Profetas Posteriores Maiores)',
  'Profetas Menores': 'Nerei Asar (Os Doze Profetas Menores)',
  'Evangelhos': 'Besorot (Evangelhos)',
  'Histórico': 'Histórico (Atos)',
  'Epístolas Paulinas': 'Cartas de Sha\'ul (Paulo)',
  'Epístolas Gerais': 'Cartas Gerais',
  'Profético': 'Chazon (Revelação)'
};

const judaicTermsMap = [
  // 1. Divine Names (Negative lookahead prevents translating terms that already have brackets like Deus[Elohim])
  [/\bDeus\b(?!\s*\[)/g, 'Elohim'],
  [/\bdeus\b(?!\s*\[)/g, 'elohim'],
  [/\bDeuses\b(?!\s*\[)/g, 'elohim'],
  [/\bdeuses\b(?!\s*\[)/g, 'elohim'],
  [/\bSENHOR\b(?!\s*\[)/g, 'Adonai'],
  [/\bSenhor\b(?!\s*\[)/g, 'Adonai'],
  [/\bsenhor\b(?!\s*\[)/g, 'adonai'],
  [/\bSENHORES\b(?!\s*\[)/g, 'adonai'],
  [/\bSenhores\b(?!\s*\[)/g, 'adonai'],
  [/\b[JY]HVH\b/g, 'YHWH'],
  [/\b[jy]hvh\b/g, 'yhwh'],
  [/\bJEOVÁ\b/g, 'YHWH'],
  [/\bJeová\b/g, 'YHWH'],
  [/\bjeová\b/g, 'yhwh'],
  [/\bIehouah\b/gi, 'YAHUAH'],
  [/\bIEHOUAH\b/gi, 'YAHUAH'],
  
  // 2. Messianic / Theological Terms
  [/\bJesus\b(?!\s*\[)/g, 'Yeshua'],
  [/\bCristo\b(?!\s*\[)/g, 'o Mashiach'],
  [/\bcristo\b(?!\s*\[)/g, 'o mashiach'],
  [/\bMessias\b(?!\s*\[)/g, 'Mashiach'],
  [/\bmessias\b(?!\s*\[)/g, 'mashiach'],
  [/\bEspírito\s+Santo\b/gi, 'Ruach HaKodesh'],
  [/\bNova\s+Aliança\b/gi, 'Brit Chadashah'],
  [/\bapóstolo\b/g, 'emissário'],
  [/\bapóstolos\b/g, 'emissários'],
  [/\bApóstolo\b/g, 'Emissário'],
  [/\bApóstolos\b/g, 'Emissários'],
  [/\bigreja\b/g, 'congregação'],
  [/\bigrejas\b/g, 'congregações'],
  [/\bIgreja\b/g, 'Congregação'],
  [/\bIgrejas\b/g, 'Congregações'],
  [/\bdiscípulo\b/g, 'talmid'],
  [/\bdiscípulos\b/g, 'talmidim'],
  [/\bDiscípulo\b/g, 'Talmid'],
  [/\bDiscípulos\b/g, 'Talmidim'],
  [/\bpecado\b/g, 'transgressão'],
  [/\bpecados\b/g, 'transgressões'],
  [/\bPecado\b/g, 'Transgressão'],
  [/\bPecados\b/g, 'Transgressões'],
  [/\bbatismo\b/g, 'imersão'],
  [/\bbatismos\b/g, 'imersões'],
  [/\bBatismo\b/g, 'Imersão'],
  [/\bbatizar\b/g, 'imergir'],
  [/\bbatizou\b/g, 'imergiu'],
  [/\bbatizado\b/g, 'imergido'],
  [/\bbatizados\b/g, 'imergidos'],
  [/\bBatizar\b/g, 'Imergir'],
  [/\bBatizou\b/g, 'Imergiu'],
  [/\bBatizado\b/g, 'Imergido'],
  [/\bBatizados\b/g, 'Imergidos'],
  [/\banjo\b/g, 'mensageiro (malakh)'],
  [/\banjos\b/g, 'mensageiros (malakhim)'],
  [/\bAnjo\b/g, 'Mensageiro (Malakh)'],
  [/\bAnjos\b/g, 'Mensageiros (Malakhim)'],
  [/\bevangelho\b/g, 'boas-novas'],
  [/\bEvangelho\b/g, 'Boas-Novas'],
  [/\blei\b/g, 'Torá'],
  [/\bLei\b/g, 'Torá'],
  [/\baliança\b/g, 'brit'],
  [/\bAliança\b/g, 'Brit'],
  [/\bsacerdote\b/g, 'cohen'],
  [/\bsacerdotes\b/g, 'cohanim'],
  [/\bSacerdote\b/g, 'Cohen'],
  [/\bSacerdotes\b/g, 'Cohanim'],
  [/\bsacerdócio\b/g, 'cohenato'],
  [/\bsanto\b/g, 'kadosh'],
  [/\bsantos\b/g, 'kedoshim'],
  [/\bSanto\b/g, 'Kadosh'],
  [/\bSantos\b/g, 'Kedoshim'],
  [/\bSábado\b/g, 'Shabbat'],
  [/\bsábado\b/g, 'shabbat'],
  [/\bSábados\b/g, 'Shabbatot'],
  [/\bsábados\b/g, 'shabbatot'],
  [/\bPáscoa\b/g, 'Pesach'],
  [/\bpáscoa\b/g, 'pesach'],
  [/\bPentecostes\b/g, 'Shavuot'],
  [/\bpentecostes\b/g, 'shavuot'],
  [/\bTabernáculos\b/g, 'Sukkot'],
  [/\btabernáculos\b/g, 'sukkot'],
  
  // 3. Biblical Names (Hebrew Restorations)
  [/\bMoisés\b/g, 'Moshe'],
  [/\bAbraão\b/g, 'Avraham'],
  [/\bIsaque\b/g, 'Yitzchak'],
  [/\bJacó\b/g, 'Ya\'akov'],
  [/\bSalomão\b/g, 'Shlomo'],
  [/\bDavi\b/g, 'David'],
  [/\bPaulo\b/g, 'Sha\'ul'],
  [/\bPedro\b/g, 'Kefa'],
  [/\bJoão\b/g, 'Yochanan'],
  [/\bMateus\b/g, 'Mattityahu'],
  [/\bMarcos\b/g, 'Markos'],
  [/\bLucas\b/g, 'Lukas'],
  [/\bTiago\b/g, 'Ya\'akov'],
  [/\bJudas\b/g, 'Yehudah'],
  [/\bMaria\b/g, 'Miryam'],
  [/\bJosé\b/g, 'Yosef'],
  [/\bElias\b/g, 'Eliyahu'],
  [/\bEliseu\b/g, 'Elisha'],
  [/\bIsaías\b/g, 'Yesha\'yahu'],
  [/\bJeremias\b/g, 'Yirmeyahu'],
  [/\bEzequiel\b/g, 'Yechezk\'el'],
  [/\bOseias\b/g, 'Hoshea'],
  [/\bJoel\b/g, 'Yo\'el'],
  [/\bObadias\b/g, 'Obadyah'],
  [/\bJonas\b/g, 'Yonah'],
  [/\bMiqueias\b/g, 'Mikhah'],
  [/\bNaum\b/g, 'Nachum'],
  [/\bHabacuque\b/g, 'Chavakuk'],
  [/\bSofonias\b/g, 'Tzefanyah'],
  [/\bAgeu\b/g, 'Chaggai'],
  [/\bZacarias\b/g, 'Zekharyah'],
  [/\bMalaquias\b/g, 'Mal\'akhi'],
  [/\bEnoque\b/g, 'Chanokh'],
  [/\bNoé\b/g, 'Noach'],
  [/\bMelquisedeque\b/g, 'Malki-Tzedek'],
  [/\bSara\b/g, 'Sarah'],
  [/\bRebeca\b/g, 'Rivkah'],
  [/\bRaquel\b/g, 'Rachel'],
  [/\bLia\b/g, 'Leah'],
  [/\bFaraó\b/g, 'Par\'oh'],
  [/\bSinai\b/g, 'Sinai'],
  [/\bSinaí\b/g, 'Sinai'],
  [/\bJerusalém\b/g, 'Yerushalayim'],
  [/\bEgito\b/g, 'Mitzrayim'],
  [/\bBabilônia\b/g, 'Bavel'],
  
  [/\bIsrael\b/g, 'Yisra\'el'],
  [/\bAdão\b/g, 'Adam'],
  [/\badão\b/g, 'adam'],
  [/\bEva\b/g, 'Chavah'],
  [/\beva\b/g, 'chavah'],
  [/\bCaim\b/g, 'Kayin'],
  [/\bcaim\b/g, 'kayin'],
  [/\bAbel\b/g, 'Hevel'],
  [/\babel\b/g, 'hevel'],
  [/\bSete\b/g, 'Shet'],
  [/\bSem\b/g, 'Shem'],
  [/\bSamuel\b/g, 'Shmuel'],
  [/\bsamuel\b/g, 'shmuel'],
  [/\bSaul\b/g, 'Sha\'ul'],
  [/\bsaul\b/g, 'sha\'ul'],
  [/\bArão\b/g, 'Aharon'],
  [/\barão\b/g, 'aharon'],
  [/\bRute\b/g, 'Rut'],
  [/\brute\b/g, 'rut'],
  [/\bEsdras\b/g, 'Ezra'],
  [/\besdras\b/g, 'ezra'],
  [/\bNeemias\b/g, 'Nechemyah'],
  [/\bneemias\b/g, 'nechemyah'],
  [/\bDaniel\b/g, 'Dani\'el'],
  [/\bdaniel\b/g, 'dani\'el'],
  [/\bRúben\b/g, 'Re\'uven'],
  [/\brúben\b/g, 're\'uven'],
  [/\bSimeão\b/g, 'Shim\'on'],
  [/\bsimeão\b/g, 'shim\'on'],
  [/\bLevi\b/g, 'Levy'],
  [/\blevi\b/g, 'levy'],
  [/\bJudá\b/g, 'Yehudah'],
  [/\bjudá\b/g, 'yehudah'],
  [/\bZabulon\b/g, 'Zevulun'],
  [/\bzabulon\b/g, 'zevulun'],
  [/\bZebulom\b/g, 'Zevulun'],
  [/\bzebulom\b/g, 'zevulun'],
  [/\bIssacar\b/g, 'Yissakhar'],
  [/\bissacar\b/g, 'yissakhar'],
  [/\bBenjamin\b/g, 'Binyamin'],
  [/\bbenjamin\b/g, 'binyamin'],
  [/\bEfraim\b/g, 'Efrayim'],
  [/\befraim\b/g, 'efrayim'],
  [/\bManassés\b/g, 'Menasheh'],
  [/\bmanassés\b/g, 'menasheh'],
  [/\bAser\b/g, 'Asher'],
  [/\baser\b/g, 'asher'],
  [/\bGênesis\b/g, 'Bereshit'],
  [/\bgênesis\b/g, 'bereshit'],
  [/\bÊxodo\b/g, 'Shemot'],
  [/\bêxodo\b/g, 'shemot'],
  [/\bLevítico\b/g, 'Vayikra'],
  [/\blevítico\b/g, 'vayikra'],
  [/\bNúmeros\b/g, 'Bemidbar'],
  [/\bnúmeros\b/g, 'bemidbar'],
  [/\bDeuteronômio\b/g, 'Devarim'],
  [/\bdeuteronômio\b/g, 'devarim'],
  [/\bLamentações\b/g, 'Eikhah'],
  [/\blamentações\b/g, 'eikhah'],
  [/\bApocalipse\b/g, 'Chazon'],
  [/\bapocalipse\b/g, 'chazon'],
  [/\bJosué\b/g, 'Yehoshua'],
  [/\bjosué\b/g, 'yehoshua'],
  [/\bCaleb\b/g, 'Kalev'],
  [/\bcaleb\b/g, 'kalev']
];

function translateToJudaic(text) {
  if (!text) return text;
  let result = text;
  for (const [regex, replacement] of judaicTermsMap) {
    result = result.replace(regex, replacement);
  }
  return result;
}

function getJudaicBookName(abbrev, defaultName) {
  const lower = abbrev.toLowerCase();
  return judaicBookNames[lower] || defaultName;
}

function getJudaicTransliteration(translit) {
  if (!translit) return translit;
  let result = translit;
  result = result.replace(/\b[JY]HVH\b/g, 'YHWH')
                 .replace(/\b[jy]hvh\b/g, 'yhwh');
  result = result.replace(/YËHOVÅH/g, 'YAHUAH')
                 .replace(/YHOVÅH/g, 'YAHUAH')
                 .replace(/Yëhovåh/g, 'Yahuah')
                 .replace(/Yhovåh/g, 'Yahuah')
                 .replace(/yëhovåh/g, 'yahuah')
                 .replace(/yhovåh/g, 'yahuah');
  return result;
}

// Helper to escape XML/HTML content
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// 2. Load Book Metadata
const dbPath = path.resolve('public/db');
const booksMetadata = JSON.parse(fs.readFileSync(path.join(dbPath, 'books.json'), 'utf8'));

// Sort books by ID
booksMetadata.sort((a, b) => a.id - b.id);

console.log(`Carregados ${booksMetadata.length} livros de books.json. Iniciando compilação do EPUB...`);

// 3. Setup JSZip
const zip = new JSZip();

// First file must be mimetype, stored completely uncompressed
zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

// META-INF/container.xml
const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
zip.file('META-INF/container.xml', containerXml, { compression: 'DEFLATE' });

// OEBPS/styles.css (Paper-white theme with Word-by-word Interlinear RTL Grid styles)
const stylesCss = `/* Stylesheet for As Sagradas Escrituras Originais do Eterno */
html, body {
  background-color: #fdfbf7 !important; /* Parchment off-white background */
  color: #111111 !important;
}

body {
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.6;
  margin: 0;
  padding: 5% 5% 5% 5%;
}

h1.book-title {
  text-align: center;
  font-size: 1.8em;
  margin-top: 0.5em;
  margin-bottom: 0.8em;
  color: #3f1a63 !important;
  border-bottom: 2px solid #3f1a63;
  padding-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

h2.chapter-title {
  font-size: 1.4em;
  margin-top: 1em;
  margin-bottom: 0.8em;
  color: #582485 !important;
  border-bottom: 1px solid #e0d0f0;
  padding-bottom: 4px;
  text-align: center;
}

/* Sumário / Navegação */
nav ol {
  list-style-type: none;
  padding-left: 0;
  margin-top: 1.5em;
}

nav li {
  margin-bottom: 0.6em;
  border-bottom: 1px dashed #e6e6e6;
  padding-bottom: 4px;
}

nav a {
  text-decoration: none;
  color: #582485 !important;
  font-weight: bold;
}

/* Prefácio */
.preface-title {
  text-align: center;
  font-size: 1.6em;
  color: #3f1a63 !important;
  margin-bottom: 1.2em;
}

.preface-section {
  margin-bottom: 1.8em;
}

.preface-section h3 {
  color: #582485 !important;
  font-size: 1.15em;
  margin-bottom: 0.6em;
  border-left: 3px solid #582485;
  padding-left: 8px;
}

.preface-section p {
  text-indent: 1.5em;
  margin-bottom: 1em;
  text-align: justify;
}

/* Livros e Capítulos */
.chapter-jump {
  text-align: center;
  font-size: 0.85em;
  margin-bottom: 2em;
  padding: 12px;
  background-color: #faf7f2 !important;
  border-radius: 6px;
  line-height: 2.2;
  border: 1px solid #ebdffd;
}

.chapter-jump a {
  text-decoration: none;
  color: #582485 !important;
  margin: 0 4px;
  padding: 2px 7px;
  border: 1px solid #e0d0f0;
  border-radius: 4px;
  background-color: #ffffff !important;
  display: inline-block;
}

.chapter-jump .active-nav {
  font-weight: bold;
  background-color: #e0d0f0 !important;
  color: #3f1a63 !important;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid #c8b0e8;
  display: inline-block;
  margin: 0 4px;
}

.verse {
  margin-bottom: 1.8em;
  text-align: justify;
}

.verse-num {
  font-weight: bold;
  font-size: 0.85em;
  color: #582485 !important;
  margin-right: 6px;
}

.verse-text {
  font-size: 1.1em;
  font-weight: normal;
}

/* Interlinear Row Grid (flowing RTL, matching user screenshot) */
.interlinear-container {
  direction: rtl;
  text-align: right;
  margin-top: 10px;
  margin-bottom: 25px;
  padding: 12px;
  background-color: #faf7f2 !important; /* Cream background box */
  border-radius: 6px;
  border: 1px solid #ebdffd;
  line-height: 1.35;
}

.word-block {
  display: inline-block;
  direction: ltr;
  text-align: center;
  vertical-align: top;
  margin: 8px 12px;
  min-width: 75px;
}

.word-hebrew {
  display: block;
  font-family: "Georgia", "Times New Roman", serif;
  font-size: 1.45em;
  font-weight: bold;
  color: #111111 !important;
  margin-bottom: 5px;
  white-space: nowrap;
}

.word-translit {
  display: block;
  font-size: 0.85em;
  font-weight: normal;
  color: #444444 !important;
  text-transform: uppercase;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.word-portuguese {
  display: block;
  font-size: 0.8em;
  color: #666666 !important;
  line-height: 1.25;
  white-space: normal;
  word-wrap: break-word;
}

/* Special styling for the index/reference block on the right (א.א) */
.index-block .word-hebrew {
  color: #582485 !important;
  font-size: 1.25em;
}

.index-block .word-translit {
  color: #582485 !important;
  font-weight: bold;
}

.index-block .word-portuguese {
  color: #582485 !important;
  font-weight: bold;
}
`;
zip.file('OEBPS/styles.css', stylesCss, { compression: 'DEFLATE' });

// OEBPS/cover.xhtml
const coverXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt" lang="pt">
<head>
  <title>Capa</title>
  <style type="text/css">
    @page { padding: 0; margin: 0; }
    html, body {
      background-color: #0d0d0d !important;
    }
    body {
      margin: 0;
      padding: 0;
      text-align: center;
    }
    div.cover {
      text-align: center;
      padding: 0;
      margin: 0;
    }
    img {
      max-width: 100%;
      height: auto;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="cover">
    <img src="images/cover.png" alt="Capa das Sagradas Escrituras Originais do Eterno" />
  </div>
</body>
</html>`;
zip.file('OEBPS/cover.xhtml', coverXhtml, { compression: 'DEFLATE' });

// OEBPS/preface.xhtml
const prefaceXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="pt" lang="pt">
<head>
  <title>Prefácio</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <h1 class="preface-title">Prefácio e Apresentação</h1>
  
  <div class="preface-section">
    <h3>A Visão desta Edição</h3>
    <p>Bem-vindo a <strong>As Sagradas Escrituras Originais do Eterno</strong>. Esta obra é fruto do desejo ardente de aproximar o leitor da revelação original confiada aos profetas do Tanakh (Antigo Testamento) e aos emissários da Brit Chadashah (Nova Aliança / Novo Testamento).</p>
    <p>Ao longo dos séculos, traduções sucessivas suavizaram ou substituíram termos cruciais da cultura judaica por conceitos helenísticos. Esta edição restaura a terminologia e os nomes hebraicos em estilo interlinear e contextual, utilizando como referência metodológica as premissas de fidelidade presentes em obras renomadas como a <em>Bíblia Judaica Completa</em> de David Stern.</p>
  </div>

  <div class="preface-section">
    <h3>A Restauração dos Nomes Sagrados</h3>
    <p>O Tetragrama Sagrado (<strong>יהוה</strong>), que aparece milhares de vezes nos manuscritos originais, é aqui grafado e transliterado como <strong>YHWH</strong> para ressaltar Sua natureza consonantal inefável, ou traduzido por <strong>Adonai</strong> (Senhor) quando lido no fluxo devocional.</p>
    <p>Nas passagens fundamentais onde o próprio Criador revela e proclama Seu Nome, foi restaurada a grafia <strong>YAHUAH</strong> (como em Êxodo 3:15 e Êxodo 3:2), eliminando formas corrompidas ou errôneas introduzidas por copistas medievais tardios.</p>
  </div>

  <div class="preface-section">
    <h3>Terminologia e Nomes Originais Hebraicos</h3>
    <p>Os nomes próprios dos personagens bíblicos foram restaurados para suas pronúncias e grafias originais: <em>Moshe</em> em vez de Moisés, <em>Avraham</em> em vez de Abraão, <em>Yitzchak</em> em vez de Isaque, <em>Ya'akov</em> em vez de Jacó, <em>Sha'ul</em> em vez de Paulo, <em>Kefa</em> em vez de Pedro, e o Nome do Salvador, <strong>Yeshua</strong>, em vez de Jesus.</p>
    <p>Substituiu-se também a terminologia teológica de origem grega ou latina por correspondentes fiéis de raiz judaico-bíblica: <strong>Elohim</strong> (em vez de Deus), <strong>o Mashiach</strong> (em vez de o Cristo), <strong>Ruach HaKodesh</strong> (em vez de Espírito Santo), <strong>Congregação</strong> (em vez de Igreja), <strong>Talmid/Talmidim</strong> (em vez de Discípulo/Discípulos), <strong>Imersão</strong> (em vez de Batismo), <strong>Torá</strong> (em vez de Lei), <strong>Brit</strong> (em vez de Aliança) e <strong>Shabbat</strong> (em vez de Sábado).</p>
  </div>

  <div class="preface-section">
    <h3>Texto Interlinear e Estrutura de Estudo</h3>
    <p>Para enriquecer a leitura e a exegese bíblica, cada versículo nesta edição do EPUB apresenta, logo abaixo da tradução em língua portuguesa, o texto original hebraico pontuado (massorético) e a respectiva transliteração fonética organizada em colunas que fluem da direita para a esquerda (RTL). Assim, mesmo o leitor sem conhecimentos avançados de hebraico poderá contemplar a melodia dos originais e estudar o vocabulário sagrado de forma simples e direta.</p>
    <p>Este arquivo foi otimizado sob o padrão EPUB para adaptar-se dinamicamente ao tamanho de qualquer tela (celulares, tablets e computadores), permitindo ao leitor ajustar o tamanho e tipo de letra, o contraste das cores e as margens, desfrutando de uma experiência de leitura confortável e viva.</p>
  </div>
</body>
</html>`;
zip.file('OEBPS/preface.xhtml', prefaceXhtml, { compression: 'DEFLATE' });

// 4. Load Cover Image
const coverPath = path.resolve('public/bible_cover.png');
if (fs.existsSync(coverPath)) {
  const coverBuffer = fs.readFileSync(coverPath);
  zip.file('OEBPS/images/cover.png', coverBuffer);
} else {
  console.warn("ATENÇÃO: Capa public/bible_cover.png não encontrada.");
}

// 5. Generate Book Pages at the Chapter Level
const spineItems = [];
const manifestItems = [];
const bookLinks = [];

for (const book of booksMetadata) {
  const bookFile = `${book.abbrev}.json`;
  const bookFilePath = path.join(dbPath, bookFile);
  
  if (!fs.existsSync(bookFilePath)) {
    console.warn(`Aviso: Arquivo do livro ${bookFilePath} não encontrado. Pulando.`);
    continue;
  }
  
  const verses = JSON.parse(fs.readFileSync(bookFilePath, 'utf8'));
  const judaicBookName = getJudaicBookName(book.abbrev, book.name);
  
  // Group verses by chapter
  const chapters = {};
  for (const v of verses) {
    if (!chapters[v.chapter]) {
      chapters[v.chapter] = [];
    }
    chapters[v.chapter].push(v);
  }
  
  const totalChapters = Object.keys(chapters).length;
  
  // Render each chapter as a separate file
  for (const ch of Object.keys(chapters).sort((a, b) => Number(a) - Number(b))) {
    
    // Quick-jump navigation headers: Chapters AND Verses
    let quickJumpHtml = '';
    const chapterVerses = chapters[ch].map(v => v.verse).sort((a, b) => a - b);
    
    if (totalChapters > 1) {
      quickJumpHtml = `
      <div class="chapter-jump">
        <strong>Capítulos:</strong>
        ${Object.keys(chapters).sort((a, b) => Number(a) - Number(b)).map(otherCh => {
          if (otherCh === ch) {
            return `<span class="active-nav">${otherCh}</span>`;
          }
          return `<a href="${book.abbrev}_${otherCh}.xhtml">${otherCh}</a>`;
        }).join(' ')}
        <br/>
        <strong>Versículos:</strong>
        ${chapterVerses.map(vNum => `<a href="#v-${vNum}">${vNum}</a>`).join(' ')}
      </div>`;
    } else {
      quickJumpHtml = `
      <div class="chapter-jump">
        <strong>Versículos:</strong>
        ${chapterVerses.map(vNum => `<a href="#v-${vNum}">${vNum}</a>`).join(' ')}
      </div>`;
    }
    
    // Render verses
    let versesHtml = '';
    for (const v of chapters[ch]) {
      const translatedText = translateToJudaic(v.text_pt);
      
      // Render word-by-word interlinear grid if words exist
      let interlinearHtml = '';
      if (v.words && v.words.length > 0) {
        const hebrewRef = `${toHebrewNumeral(Number(ch))}.${toHebrewNumeral(v.verse)}`;
        const decRef = `${ch}.${v.verse}`;
        
        // 1st Block: Gematria Reference (א.א / 1.1 / 1.1)
        let wordBlocksHtml = `
        <div class="word-block index-block">
          <span class="word-hebrew">${hebrewRef}</span>
          <span class="word-translit">${decRef}</span>
          <span class="word-portuguese">${decRef}</span>
        </div>`;
        
        // Subsequent Blocks: Hebrew words
        for (const w of v.words) {
          const wordHebrew = w.hebrew ? w.hebrew : '';
          const wordTranslit = w.transliteration ? getJudaicTransliteration(w.transliteration) : '';
          const wordPort = w.portuguese ? translateToJudaic(w.portuguese) : '';
          
          wordBlocksHtml += `
        <div class="word-block">
          <span class="word-hebrew">${escapeXml(wordHebrew)}</span>
          <span class="word-translit">${escapeXml(wordTranslit)}</span>
          <span class="word-portuguese">${escapeXml(wordPort)}</span>
        </div>`;
        }
        
        interlinearHtml = `
      <div class="interlinear-container" dir="rtl">
        ${wordBlocksHtml}
      </div>`;
      }
      
      versesHtml += `
      <p class="verse" id="v-${v.verse}">
        <span class="verse-num">${v.verse}</span>
        <span class="verse-text">${escapeXml(translatedText)}</span>
        ${interlinearHtml}
      </p>`;
    }
    
    // Running header layout
    const isFirstChapter = (ch === "1");
    const bookTitleHeader = isFirstChapter
      ? `<h1 class="book-title">${escapeXml(judaicBookName)}</h1>`
      : `<h1 class="book-title" style="font-size: 1.1em; border-bottom: none; margin-top: 0px; margin-bottom: 5px; opacity: 0.7; text-align: center;">${escapeXml(judaicBookName)}</h1>`;

    const chapterXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt" lang="pt">
<head>
  <title>${escapeXml(judaicBookName)} - Cap. ${ch}</title>
  <link rel="stylesheet" type="text/css" href="../styles.css" />
</head>
<body>
  <section class="book-chapter" epub:type="chapter">
    ${bookTitleHeader}
    <h2 class="chapter-title" style="${isFirstChapter ? '' : 'margin-top: 5px;'}">Capítulo ${ch}</h2>
    ${quickJumpHtml}
    ${versesHtml}
  </section>
</body>
</html>`;

    const zipChapterPath = `OEBPS/books/${book.abbrev}_${ch}.xhtml`;
    zip.file(zipChapterPath, chapterXhtml, { compression: 'DEFLATE' });
    
    const chapterId = `book-${book.abbrev}-${ch}`;
    manifestItems.push(`<item id="${chapterId}" href="books/${book.abbrev}_${ch}.xhtml" media-type="application/xhtml+xml"/>`);
    spineItems.push(`<itemref idref="${chapterId}"/>`);
  }
  
  bookLinks.push({ abbrev: book.abbrev, name: judaicBookName, category: book.category, testament: book.testament });
}

// 6. Generate EPUB 3 toc.xhtml (Navigation Document) pointing to Chapter 1
const otBooks = bookLinks.filter(b => b.testament === 'Antigo Testamento');
const ntBooks = bookLinks.filter(b => b.testament === 'Novo Testamento');

const categoriesOrder = [
  'A Lei (Torá)',
  'Históricos',
  'Poéticos',
  'Profetas Maiores',
  'Profetas Menores',
  'Evangelhos',
  'Histórico',
  'Epístolas Paulinas',
  'Epístolas Gerais',
  'Profético'
];

function groupByCategory(books) {
  const grouped = {};
  for (const b of books) {
    if (!grouped[b.category]) {
      grouped[b.category] = [];
    }
    grouped[b.category].push(b);
  }
  return grouped;
}

const otGrouped = groupByCategory(otBooks);
const ntGrouped = groupByCategory(ntBooks);

let tocListHtml = `
      <li><a href="cover.xhtml">Capa</a></li>
      <li><a href="preface.xhtml">Prefácio e Apresentação</a></li>
      
      <li>
        <span style="font-size: 1.2em; font-weight: bold; color: #3f1a63; display: block; margin-top: 1.5em; margin-bottom: 0.5em;">TANAKH (ANTIGO TESTAMENTO)</span>
        <ol style="list-style-type: none; padding-left: 15px;">`;

for (const cat of categoriesOrder) {
  if (otGrouped[cat] && otGrouped[cat].length > 0) {
    const judaicCat = judaicCategories[cat] || cat;
    tocListHtml += `
          <li>
            <span style="font-weight: bold; color: #582485; display: block; margin-top: 0.8em; margin-bottom: 0.4em;">${escapeXml(judaicCat)}</span>
            <ol style="list-style-type: none; padding-left: 15px;">`;
    for (const b of otGrouped[cat]) {
      tocListHtml += `
              <li><a href="books/${b.abbrev}_1.xhtml">${escapeXml(b.name)}</a></li>`;
    }
    tocListHtml += `
            </ol>
          </li>`;
  }
}
tocListHtml += `
        </ol>
      </li>
      
      <li>
        <span style="font-size: 1.2em; font-weight: bold; color: #3f1a63; display: block; margin-top: 1.5em; margin-bottom: 0.5em;">BRIT CHADASHAH (NOVO TESTAMENTO)</span>
        <ol style="list-style-type: none; padding-left: 15px;">`;

for (const cat of categoriesOrder) {
  if (ntGrouped[cat] && ntGrouped[cat].length > 0) {
    const judaicCat = judaicCategories[cat] || cat;
    tocListHtml += `
          <li>
            <span style="font-weight: bold; color: #582485; display: block; margin-top: 0.8em; margin-bottom: 0.4em;">${escapeXml(judaicCat)}</span>
            <ol style="list-style-type: none; padding-left: 15px;">`;
    for (const b of ntGrouped[cat]) {
      tocListHtml += `
              <li><a href="books/${b.abbrev}_1.xhtml">${escapeXml(b.name)}</a></li>`;
    }
    tocListHtml += `
            </ol>
          </li>`;
  }
}
tocListHtml += `
        </ol>
      </li>`;

const tocXhtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="pt" lang="pt">
<head>
  <title>Sumário</title>
  <link rel="stylesheet" type="text/css" href="styles.css" />
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1 class="book-title" style="border-bottom: 2px solid #582485;">Sumário Geral</h1>
    <ol>
      ${tocListHtml}
    </ol>
  </nav>
</body>
</html>`;
zip.file('OEBPS/toc.xhtml', tocXhtml, { compression: 'DEFLATE' });

// 7. Generate EPUB 2 toc.ncx (Backwards Compatibility)
let ncxNavPoints = `
    <navPoint id="navpoint-cover" playOrder="1">
      <navLabel><text>Capa</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
    <navPoint id="navpoint-preface" playOrder="2">
      <navLabel><text>Prefácio e Apresentação</text></navLabel>
      <content src="preface.xhtml"/>
    </navPoint>`;

let playOrder = 3;
for (const b of bookLinks) {
  ncxNavPoints += `
    <navPoint id="navpoint-${b.abbrev}" playOrder="${playOrder++}">
      <navLabel><text>${escapeXml(b.name)}</text></navLabel>
      <content src="books/${b.abbrev}_1.xhtml"/>
    </navPoint>`;
}

const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:as-sagradas-escrituras-originais-do-eterno-v1"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>As Sagradas Escrituras Originais do Eterno</text>
  </docTitle>
  <navMap>
    ${ncxNavPoints}
  </navMap>
</ncx>`;
zip.file('OEBPS/toc.ncx', tocNcx, { compression: 'DEFLATE' });

// 8. Generate OEBPS/content.opf
const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookId" version="3.0" xml:lang="pt">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">urn:uuid:as-sagradas-escrituras-originais-do-eterno-v1</dc:identifier>
    <dc:title>As Sagradas Escrituras Originais do Eterno</dc:title>
    <dc:language>pt</dc:language>
    <dc:creator>Exegese Original Massorética</dc:creator>
    <dc:publisher>Editora do Eterno</dc:publisher>
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0] + 'Z'}</meta>
    <meta name="cover" content="cover-image"/>
  </metadata>
  
  <manifest>
    <item id="styles" href="styles.css" media-type="text/css"/>
    <item id="toc" href="toc.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="preface-page" href="preface.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-image" href="images/cover.png" media-type="image/png"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  
  <spine toc="ncx">
    <itemref idref="cover-page"/>
    <itemref idref="preface-page"/>
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
zip.file('OEBPS/content.opf', contentOpf, { compression: 'DEFLATE' });

// 9. Write the EPUB file to root
console.log("Gerando arquivo .epub com compressão deflated...");
zip.generateAsync({ type: 'nodebuffer' }).then((buffer) => {
  const epubPath = path.resolve('As-Sagradas-Escrituras.epub');
  fs.writeFileSync(epubPath, buffer);
  console.log(`Sucesso! Ebook EPUB criado em: ${epubPath}`);
  console.log(`Tamanho final do arquivo: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
}).catch((err) => {
  console.error("Erro ao gerar o arquivo EPUB:", err);
});
