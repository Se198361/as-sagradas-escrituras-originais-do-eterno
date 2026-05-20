const fs = require('fs');
const path = require('path');

const bibliaPath = path.join(__dirname, '../src/assets/biblia.json');

try {
  let fileContent = fs.readFileSync(bibliaPath, 'utf8');
  fileContent = fileContent.replace(/^\uFEFF/, '');
  const data = JSON.parse(fileContent);
  
  // Let's find Matthew
  const mateus = data.find(x => x.abbrev === 'mt');
  console.log("Mateus details in biblia.json:");
  console.log("Name:", mateus.name);
  console.log("Abbrev:", mateus.abbrev);
  console.log("Chapters length:", mateus.chapters.length);
  console.log("Chapter 1 length:", mateus.chapters[0].length);
  console.log("Chapter 1 Verse 1:", mateus.chapters[0][0]);
} catch (e) {
  console.error("Error reading biblia.json:", e.message);
}
