import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {writeAtomic,readOptional} from '../scripts/atomic-file.mjs';

test('atomic file write preserves entire payload and replaces older content',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'yokai-atomic-test-'));
 try{
  const target=path.join(dir,'data.json');
  assert.equal(readOptional(target,null),null);
  writeAtomic(target,JSON.stringify({version:1,items:[1]}));
  assert.equal(JSON.parse(readOptional(target,'' )).version,1);
  writeAtomic(target,JSON.stringify({version:2,items:[1,2]}));
  assert.deepEqual(JSON.parse(fs.readFileSync(target,'utf8')),{version:2,items:[1,2]});
  assert.deepEqual(fs.readdirSync(dir),['data.json']);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('generator scripts never use existsSync check prior to update',()=>{
 for(const filename of ['build_detailed_articles.mjs','update_50_yokai_data.mjs']){
  const s=fs.readFileSync(new URL('../scripts/'+filename,import.meta.url),'utf8');
  assert.doesNotMatch(s,/fs\.existsSync\((?:ARTICLE_PATH|PROMPTS_PATH)\)/);
  assert.match(s,/writeAtomic\(/);
 }
});
