'use strict';
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
let win, backend, timer, starting = false, ready = false;
let loadingEditor=false;
function gatewayPath(){
 const paths=app.isPackaged
  ? [path.join(process.resourcesPath,'studio-gateway.exe')]
  : [path.join(__dirname,'app','dist','studio-gateway.exe')];
 return paths.find(fs.existsSync)||paths[0];
}
function welcome(){
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>3D Studio</title><style>
 body{font:16px system-ui;background:#172638;color:#eff6ff;margin:0;padding:30px}
 button{background:#3678bd;color:white;border:0;padding:13px 20px;border-radius:7px;cursor:pointer}
 p{line-height:1.5;color:#d5e4f5}</style>
 <h2>3D Studio — Public Beta</h2><p>Online search uses our cloud API. No API key is required.</p>
 <button id="start">Launch 3D Studio</button><p>Offline modeling works without internet. Online model downloads depend on Thingiverse availability.</p>
 <script>document.getElementById('start').onclick=()=>{document.getElementById('start').disabled=true;window.studio.start();}</script></html>`;
 win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));
}
function showFailure(message){
  clearTimeout(timer);
  ready=false;starting=false;loadingEditor=false;
  if(backend){backend.kill();backend=null;}
  const safe=String(message).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><body style="font:16px system-ui;background:#192c40;color:white;padding:35px">
    <h2>Не удалось запустить 3D Studio</h2><p>${safe}</p><p>Попробуйте перезапустить приложение. Если ошибка повторится, пришлите текст сообщения разработчику.</p>
    <button style="padding:12px" onclick="location.reload()">Повторить загрузку страницы</button></body>`;
  if(win&&!win.isDestroyed())win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html)).catch(()=>{});
}
function waitForServer(port,attempt=0){
 if(!win||win.isDestroyed())return;
 if(attempt>=60){showFailure('Локальный сервер не отвечает на порту '+port);return;}
 const req=http.get({hostname:'127.0.0.1',port,path:'/',timeout:1200},res=>{
  res.resume();
  if(res.statusCode!==200){setTimeout(()=>waitForServer(port,attempt+1),250);return;}
  if(ready)return;
  ready=true;clearTimeout(timer);loadingEditor=true;
  win.loadURL('http://127.0.0.1:'+port+'/').then(()=>{
    loadingEditor=false;
    if(win&&!win.isDestroyed()){win.setSize(1450,920);win.center();win.maximize();}
  }).catch(e=>showFailure('Не удалось открыть интерфейс: '+e.message));
 });
 req.on('error',()=>setTimeout(()=>waitForServer(port,attempt+1),250));
 req.on('timeout',()=>req.destroy());
}
function start(value){
 if(starting)return;
 starting=true;ready=false;
 const exe=gatewayPath();
 if(!fs.existsSync(exe)){showFailure('studio-gateway.exe отсутствует в ресурсах установщика');return;}
 const web=app.isPackaged?path.join(process.resourcesPath,'web'):path.join(__dirname,'app');
 if(!fs.existsSync(path.join(web,'index.html'))){showFailure('index.html отсутствует в ресурсах установщика');return;}
 const env={...process.env,STUDIO_WEB_ROOT:web};
 delete env.THINGIVERSE_TOKEN;
 backend=spawn(exe,['--port','0'],{cwd:web,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let log='';
 backend.stdout.on('data',chunk=>{
   log=(log+chunk.toString()).slice(-4096);
   const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
   if(m&&!ready&&!loadingEditor){
      const port=Number(m[1]);
      if(port>0&&port<=65535){loadingEditor=true;waitForServer(port);}
   }
 });
 backend.stderr.on('data',b=>console.error('Gateway:',b.toString().slice(0,300)));
 backend.on('error',e=>showFailure('Ошибка запуска сервера: '+e.message));
 backend.on('exit',code=>{if(!app.isQuitting&&starting)showFailure('Локальный сервер завершился. Код: '+code);});
 timer=setTimeout(()=>{if(!ready)showFailure('Сервер не запустился за 35 секунд. Последний вывод: '+log.slice(-300));},35000);
}
app.whenReady().then(()=>{
 ipcMain.on('studio:start',(_,token)=>start(token));
 win=new BrowserWindow({width:650,height:440,autoHideMenuBar:true,webPreferences:{
  nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
 welcome();
 win.webContents.on('did-fail-load',(_event,code,description,url,isMainFrame)=>{
   if(isMainFrame && !app.isQuitting && starting)showFailure('Ошибка загрузки '+code+': '+description+' ('+url+')');
 });
 win.on('closed',()=>app.quit());
});
app.on('before-quit',()=>{app.isQuitting=true;clearTimeout(timer);if(backend){backend.kill();backend=null;}});
app.on('window-all-closed',()=>app.quit());
