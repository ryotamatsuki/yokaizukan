import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Publish complete file contents by renaming a private temp file in the same
// directory; never truncate a previously read file in place.
export function writeAtomic(filename,contents) {
  const dir=path.dirname(filename);
  const temp=path.join(dir,'.'+path.basename(filename)+'.'+crypto.randomUUID()+'.tmp');
  let created=false;
  try{
    const fd=fs.openSync(temp,'wx',0o600);created=true;
    try {fs.writeFileSync(fd,contents,'utf8');fs.fsyncSync(fd);}
    finally {fs.closeSync(fd);}
    fs.renameSync(temp,filename);
    created=false;
  } finally {
    if(created)try{fs.unlinkSync(temp)}catch(error){if(error.code!=='ENOENT')throw error}
  }
}
export function readOptional(filename,fallback) {
  try{return fs.readFileSync(filename,'utf8')}
  catch(error){if(error.code==='ENOENT')return fallback;throw error}
}
