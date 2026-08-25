import fs from 'node:fs';
const path = 'public/data/sources.json';
let text = fs.readFileSync(path, 'utf8');
for (const id of ['SRC_JAC_ISHIZUCHI_HOKIBO', 'SRC_TENGUKYO_MIYAKE_2023']) {
  const from = `\n{\n      "id": "${id}"`;
  const to = `\n    {\n      "id": "${id}"`;
  if (!text.includes(from)) throw new Error(`Formatting target not found: ${id}`);
  text = text.replace(from, to);
}
fs.writeFileSync(path, text);
console.log('Fixed Ishizuchi source object indentation.');
