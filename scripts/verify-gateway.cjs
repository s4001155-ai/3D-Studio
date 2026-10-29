const fs=require('fs'),path=require('path');
const p=path.resolve(__dirname,'../app/dist/studio-gateway.exe');
if(!fs.existsSync(p)||fs.statSync(p).size<100000){console.error('Gateway missing or too small:',p);process.exit(1)}
const fd=fs.openSync(p,'r');const b=Buffer.alloc(2);fs.readSync(fd,b,0,2,0);fs.closeSync(fd);
if(b.toString()!=='MZ'){console.error('Invalid Windows executable');process.exit(1)}
console.log('Gateway OK',p);
