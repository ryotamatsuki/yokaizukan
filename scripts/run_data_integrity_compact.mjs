import { spawnSync } from 'node:child_process';

const result = spawnSync(process.execPath, ['scripts/validate_data_integrity.mjs'], {
  encoding: 'utf8',
  env: process.env
});

const stdout = result.stdout || '';
const stderr = result.stderr || '';
const combined = `${stdout}${stderr ? `\n${stderr}` : ''}`;
const lines = combined.split(/\r?\n/);

const missingSoundLines = [];
const soundReferenceLines = [];
const passthrough = [];

for (const line of lines) {
  if (line.includes('references missing optional sound file:')) {
    missingSoundLines.push(line);
    continue;
  }
  if (line.includes('yokai sound references (')) {
    soundReferenceLines.push(line);
    continue;
  }
  passthrough.push(line);
}

const cleaned = passthrough.join('\n').trim();
if (cleaned) console.log(cleaned);

if (soundReferenceLines.length) {
  const match = soundReferenceLines[0].match(/yokai sound references \((\d+)\)/);
  const count = match?.[1] || 'unknown';
  console.warn(`Optional sound references: ${count} total.`);
}
if (missingSoundLines.length) {
  console.warn(`Optional sound assets missing: ${missingSoundLines.length}. Detailed paths are intentionally suppressed from CI output.`);
}

process.exit(result.status ?? 1);
