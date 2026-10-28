'use strict';
const fs=require('fs'),path=require('path');
const p=path.join(__dirname,'..','app','dist','studio-gateway.exe');
if(!fs.existsSync(p)){console.error('FATAL: missing '+p);process.exit(1);}
const b=fs.readFileSync(p);
if(b.length<100000 || b.toString('ascii',0,2)!=='MZ'){console.error('FATAL: gateway is not a valid Windows executable');process.exit(1);}
console.log('Gateway verified:',p,'size:',b.length);
