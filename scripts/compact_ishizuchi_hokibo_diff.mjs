import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const TARGET_ID = 'ishizuchi_tengu_cluster';
const DATE = '2026-08-25';
const current = new Map();
const jsonFiles = [
  'public/data/legends.json',
  'public/data/articles.json',
  'public/data/ehime_research_v2.json',
  'public/data/evidence_check_table.json',
  'public/data/sources.json',
  'scripts/fixtures/ehime_11_articles.json'
];
for (const path of jsonFiles) current.set(path, JSON.parse(fs.readFileSync(path, 'utf8')));

const baseText = (path) => execFileSync('git', ['show', `origin/main:${path}`], { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const indentBlock = (text, spaces) => {
  const prefix = ' '.repeat(spaces);
  return text.split('\n').map((line, index) => index === 0 ? line : prefix + line).join('\n');
};

function findContainerObject(text, markerIndex) {
  let start = -1;
  let inString = false;
  let escaped = false;
  const stack = [];
  for (let i = 0; i <= markerIndex; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') stack.push(i);
    else if (ch === '}') stack.pop();
  }
  if (!stack.length) throw new Error('Object start not found');
  start = stack[stack.length - 1];

  let depth = 0;
  inString = false;
  escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return { start, end: i + 1 };
    }
  }
  throw new Error('Object end not found');
}

function replaceObject(text, marker, object) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Marker not found: ${marker}`);
  const { start, end } = findContainerObject(text, markerIndex);
  const lineStart = text.lastIndexOf('\n', start) + 1;
  const indent = start - lineStart;
  const serialized = indentBlock(JSON.stringify(object, null, 2), indent);
  return text.slice(0, start) + serialized + text.slice(end);
}

function updateFirstDate(text) {
  return text.replace(/"updatedAt":\s*"[^"]+"/, `"updatedAt": "${DATE}"`);
}

// Preserve main formatting and replace only the Ishizuchi records.
{
  const path = 'public/data/legends.json';
  const desired = current.get(path).legends.find((item) => item.id === TARGET_ID);
  let text = updateFirstDate(baseText(path));
  text = replaceObject(text, `"id": "${TARGET_ID}"`, desired);
  fs.writeFileSync(path, text);
}
{
  const path = 'public/data/articles.json';
  const desired = current.get(path).articles.find((item) => item.id === TARGET_ID);
  let text = updateFirstDate(baseText(path));
  text = replaceObject(text, `"id":"${TARGET_ID}"`, desired);
  fs.writeFileSync(path, text);
}
{
  const path = 'public/data/ehime_research_v2.json';
  const desired = current.get(path).items.find((item) => item.id === TARGET_ID);
  let text = updateFirstDate(baseText(path));
  text = replaceObject(text, `"id": "${TARGET_ID}"`, desired);
  fs.writeFileSync(path, text);
}
{
  const path = 'public/data/evidence_check_table.json';
  const desired = current.get(path).legendEvidence.find((item) => item.legendId === TARGET_ID);
  let text = updateFirstDate(baseText(path));
  text = replaceObject(text, `"legendId": "${TARGET_ID}"`, desired);
  fs.writeFileSync(path, text);
}
{
  const path = 'scripts/fixtures/ehime_11_articles.json';
  const desired = current.get(path).articles.find((item) => item.id === TARGET_ID);
  let text = baseText(path);
  text = replaceObject(text, `"id":"${TARGET_ID}"`, desired);
  fs.writeFileSync(path, text);
}

// Preserve the source registry and append only the three new source records.
{
  const path = 'public/data/sources.json';
  const desired = current.get(path).sources.filter((item) => [
    'SRC_ISHIZUCHI_SHAHO_765_HOKIBO',
    'SRC_JAC_ISHIZUCHI_HOKIBO',
    'SRC_TENGUKYO_MIYAKE_2023'
  ].includes(item.id));
  if (desired.length !== 3) throw new Error('Expected three new Ishizuchi sources');
  let text = updateFirstDate(baseText(path));
  const keyIndex = text.indexOf('"sources": [');
  if (keyIndex < 0) throw new Error('sources[] not found');
  const open = text.indexOf('[', keyIndex);
  let depth = 0;
  let inString = false;
  let escaped = false;
  let close = -1;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') { inString = true; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { close = i; break; }
    }
  }
  if (close < 0) throw new Error('sources[] close not found');
  const beforeClose = text.slice(0, close).replace(/\s+$/, '');
  const suffixWhitespace = text.slice(beforeClose.length, close);
  const addition = desired.map((item) => indentBlock(JSON.stringify(item, null, 2), 4)).join(',\n');
  text = `${beforeClose},\n    ${addition}${suffixWhitespace}${text.slice(close)}`;
  fs.writeFileSync(path, text);
}

function blobSha(path) {
  const content = fs.readFileSync(path);
  const header = Buffer.from(`blob ${content.length}\0`);
  return crypto.createHash('sha1').update(header).update(content).digest('hex');
}

function replaceProtectedHash(validatorPath, filePath, sha) {
  let text = fs.readFileSync(validatorPath, 'utf8');
  const escaped = filePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`('${escaped}':\\s*')[0-9a-f]{40}(')`);
  if (!pattern.test(text)) throw new Error(`${validatorPath}: protected hash missing for ${filePath}`);
  text = text.replace(pattern, `$1${sha}$2`);
  fs.writeFileSync(validatorPath, text);
}

for (const filePath of [
  'public/data/ehime_research_v2.json',
  'public/data/evidence_check_table.json',
  'public/data/sources.json'
]) {
  replaceProtectedHash('scripts/validate_ehime_literary_editing_v1.mjs', filePath, blobSha(filePath));
}
for (const filePath of ['public/data/ehime_research_v2.json', 'public/data/legends.json']) {
  replaceProtectedHash('scripts/validate_yokai_research_deepening_phase4.mjs', filePath, blobSha(filePath));
}

for (const path of jsonFiles) JSON.parse(fs.readFileSync(path, 'utf8'));
console.log('Compacted Ishizuchi Hokibo diff while preserving source-of-truth semantics.');
