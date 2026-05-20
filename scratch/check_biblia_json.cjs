const fs = require('fs');
const path = require('path');

const bibliaPath = path.join(__dirname, '../src/assets/biblia.json');

try {
  let fileContent = fs.readFileSync(bibliaPath, 'utf8');
  // Strip BOM if present
  fileContent = fileContent.replace(/^\uFEFF/, '');
  const data = JSON.parse(fileContent);
  console.log("biblia.json details:");
  console.log("Is array:", Array.isArray(data));
  console.log("Length:", data.length);
  if (data.length > 0) {
    console.log("First element:", JSON.stringify(data[0], null, 2));
    console.log("A middle element (e.g. NT):", JSON.stringify(data.find(x => x.abbrev === 'mt'), null, 2));
    console.log("Last element:", JSON.stringify(data[data.length - 1], null, 2));
  }
} catch (e) {
  console.error("Error reading biblia.json:", e.message);
}
