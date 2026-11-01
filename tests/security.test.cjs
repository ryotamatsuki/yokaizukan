const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','js','ehime.js'),'utf8');
const begin=source.indexOf('function safeHttpURL(value)'),end=source.indexOf('function escapeAttribute(value)',begin);
assert.ok(begin>=0&&end>begin);
const safeURL=new Function('window',source.slice(begin,end)+'return safeHttpURL;')({location:{href:'https://ryotamatsuki.github.io/yokaizukan/'}});
test('javascript and data URLs are blocked in loaded source data',()=>{
  assert.equal(safeURL('javascript:alert(1)'),'');
  assert.equal(safeURL('data:text/html,<script>alert(1)</script>'),'');
  assert.equal(safeURL('https://example.org/article'),'https://example.org/article');
  assert.equal(safeURL('images/legend.png'),'https://ryotamatsuki.github.io/yokaizukan/images/legend.png');
});
test('all data-driven source links and images call URL allowlist',()=>{
  assert.match(source,/href="\$\{escapeAttribute\(safeHttpURL\(source\.url\)/);
  assert.match(source,/src="\$\{escapeAttribute\(safeHttpURL\(path\)\)\}"/);
  assert.doesNotMatch(source,/href="\$\{escapeAttribute\(source\.url/);
});
test('JS parses',()=>assert.doesNotThrow(()=>new Function(source)));
