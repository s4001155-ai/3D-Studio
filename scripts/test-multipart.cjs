const fs=require('fs'),assert=require('assert');
const html=fs.readFileSync('app/index.html','utf8');
const fn=html.slice(html.indexOf('async function v5import('),html.indexOf('async function v5search('));
assert(fn.includes("if(model.provider==='thingiverse'){\n   await v541ImportParts(model);\n   return;"),'Thingiverse must branch before download');
assert(fn.indexOf("if(model.provider==='thingiverse')")<fn.indexOf("fetch('/studio-v5/download/"),'Multipart must not fetch first single STL');
assert(html.includes('/studio-v5/parts/thingiverse/'),'Missing manifest route');
assert(html.includes('/studio-v5/part/thingiverse/'),'Missing per-part route');
console.log('Multipart route regression checks passed');
