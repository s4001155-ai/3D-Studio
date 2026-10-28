const {app,BrowserWindow,protocol,net,shell}=require('electron');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
protocol.registerSchemesAsPrivileged([{scheme:'studio',privileges:{standard:true,secure:true,supportFetchAPI:true,stream:true}}]);
app.whenReady().then(()=>{
 protocol.handle('studio',request=>{
  const url=new URL(request.url);
  let rel=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  const root=path.resolve(__dirname,'src');
  const target=path.resolve(root,rel);
  if(target!==root&&!target.startsWith(root+path.sep))return new Response('Forbidden',{status:403});
  return net.fetch(pathToFileURL(target).toString());
 });
 const win=new BrowserWindow({width:1440,height:900,minWidth:980,minHeight:620,backgroundColor:'#101827',webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 win.loadURL('studio://app/index.html');
 win.webContents.setWindowOpenHandler(({url})=>{if(url.startsWith('https://'))shell.openExternal(url);return {action:'deny'}});
});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
