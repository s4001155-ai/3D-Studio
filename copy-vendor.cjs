const fs=require('node:fs'),path=require('node:path');
const from=path.join(__dirname,'node_modules','three');
const to=path.join(__dirname,'src','vendor');
fs.mkdirSync(to,{recursive:true});
fs.copyFileSync(path.join(from,'build','three.module.js'),path.join(to,'three.module.js'));
fs.cpSync(path.join(from,'examples','jsm'),path.join(to,'addons'),{recursive:true,force:true});
