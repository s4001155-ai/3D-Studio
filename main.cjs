'use strict';
const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
let backend, win, startupTimeout;
let token = '';
function gatewayPath(){
  const binary=process.platform==='win32'?'studio-gateway.exe':'studio-gateway';
  const candidates=app.isPackaged
    ? [path.join(process.resourcesPath,binary),path.join(process.resourcesPath,'app','dist',binary)]
    : [path.join(__dirname,'app','dist',binary)];
  return candidates.find(p=>fs.existsSync(p)) || candidates[0];
}
function createLoginWindow(){
  const w=new BrowserWindow({width:560,height:300,resizable:false,autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,preload:path.join(__dirname,'preload.cjs')}});
  const page=`<!doctype html><html lang="ru"><meta charset="utf-8"><style>body{font:15px system-ui;background:#172638;color:#eef6ff;padding:24px}button{padding:12px 18px;background:#3973b5;color:white;border:0;border-radius:7px;cursor:pointer}</style><h2>3D Studio — Public Beta 0.5.3</h2><p>Моделирование работает без интернета. Онлайн-поиск подключается через Cloudflare. Вводить токен Thingiverse не нужно.</p><button id="start">Открыть 3D Studio</button><script>document.getElementById('start').onclick=()=>{window.studio.start('');document.getElementById('start').disabled=true};</script></html>`;
  w.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(page));return w;
}
function launchGateway(value){
  if(backend)return;
  token = typeof value === 'string' ? value.trim() : '';
  const exe=gatewayPath();
  if(!fs.existsSync(exe)){
    dialog.showErrorBox('Не найден сервер','Локальный сервер отсутствует в ресурсах. Проверьте сборку GitHub Actions.');
    app.quit();return;
  }
  const env={...process.env,STUDIO_CLOUD_API:'https://3d-studio-api.s4001155.workers.dev',STUDIO_WEB_ROOT:app.isPackaged?path.join(process.resourcesPath,'web'):path.join(__dirname,'app')};
  backend=spawn(exe,['--port','0'],{cwd:app.isPackaged?path.join(process.resourcesPath,'web'):path.join(__dirname,'app'),env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  token='';
  let log='';let ready=false;
  backend.stdout.on('data',b=>{
    log+=b.toString();if(log.length>8192)log=log.slice(-8192);
    const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
    if(m&&!ready){ready=true;clearTimeout(startupTimeout);win.loadURL('http://127.0.0.1:'+m[1]+'/');win.setSize(1400,900);win.center();}
  });
  backend.stderr.on('data',b=>{console.error('Gateway:',b.toString().slice(0,500));});
  backend.on('exit',(code)=>{if(!app.isQuitting){dialog.showErrorBox('Сервер остановился','Локальный сервер завершился. Код: '+code);app.quit();}});
  startupTimeout=setTimeout(()=>{if(!ready){dialog.showErrorBox('Ошибка запуска','Локальный сервер не запустился за 25 секунд.');app.quit();}},25000);
}
app.whenReady().then(()=>{
  ipcMain.on('studio:start',(_,value)=>launchGateway(value));
  win=createLoginWindow();
  win.on('closed',()=>app.quit());
});
app.on('before-quit',()=>{app.isQuitting=true;clearTimeout(startupTimeout);if(backend){backend.kill();backend=null;}});
app.on('window-all-closed',()=>app.quit());
