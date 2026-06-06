import fs from 'fs';
import path from 'path';

const epubPath = path.resolve('As-Sagradas-Escrituras.epub');

if (!fs.existsSync(epubPath)) {
  console.error(`Erro: Arquivo não encontrado em ${epubPath}`);
  process.exit(1);
}

const fd = fs.openSync(epubPath, 'r');
const header = Buffer.alloc(100);
fs.readSync(fd, header, 0, 100, 0);
fs.closeSync(fd);

// Verify ZIP signature PK\x03\x04
if (header.readUInt32LE(0) !== 0x04034b50) {
  console.error('Erro: Arquivo não é um arquivo ZIP válido.');
  process.exit(1);
}

// Byte 8-9: compression method
const compressionMethod = header.readUInt16LE(8);
// Byte 26-27: filename length
const fileNameLength = header.readUInt16LE(26);
// Byte 28-29: extra field length
const extraFieldLength = header.readUInt16LE(28);

const filename = header.toString('utf8', 30, 30 + fileNameLength);

console.log('--- Verificação de Cabeçalho EPUB ZIP ---');
console.log(`Primeiro arquivo no ZIP: "${filename}"`);
console.log(`Comprimento do nome do arquivo: ${fileNameLength} bytes`);
console.log(`Método de compressão (0 = STORE/Sem compressão): ${compressionMethod}`);
console.log(`Comprimento do campo extra: ${extraFieldLength} bytes`);

const mimetypeContentStart = 30 + fileNameLength + extraFieldLength;
const mimetypeContent = header.toString('utf8', mimetypeContentStart, mimetypeContentStart + 20);
console.log(`Conteúdo do mimetype: "${mimetypeContent}"`);

if (filename !== 'mimetype') {
  console.error('ERRO: O arquivo "mimetype" deve ser o primeiro arquivo no ZIP!');
  process.exit(1);
}

if (compressionMethod !== 0) {
  console.error('ERRO: O arquivo "mimetype" deve ser armazenado sem compressão (método = 0)!');
  process.exit(1);
}

if (mimetypeContent !== 'application/epub+zip') {
  console.error('ERRO: O conteúdo do mimetype deve ser exatamente "application/epub+zip"!');
  process.exit(1);
}

console.log('SUCESSO: A estrutura do EPUB atende perfeitamente à especificação formal (mimetype em primeiro lugar, sem compressão)!');
