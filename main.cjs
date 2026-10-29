'use strict';
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
let win, backend, timer, starting = false, ready = false;
function gatewayPath(){
 const paths=app.isPackaged
  ? [path.join(process.resourcesPath,'studio-gateway.exe')]
  : [path.join(__dirname,'app','dist','studio-gateway.exe')];
 return paths.find(fs.existsSync)||paths[0];
}
function welcome(){
 const html=`<!doctype html><html lang="ru"><meta charset="utf-8"><style>
 body{font:15px system-ui;background:#172638;color:#eff6ff;margin:0;padding:28px}
 input{display:block;box-sizing:border-box;width:100%;padding:12px;margin:16px 0;background:#263e59;color:white;border:1px solid #6484a2;border-radius:7px}
 button{background:#3678bd;color:white;border:0;padding:12px 18px;border-radius:7px;cursor:pointer}
 p{line-height:1.5;color:#d5e4f5}</style>
 <h2>3D Studio — Windows Desktop Test 5.3.2</h2>
 <p>Для онлайн-поиска Thingiverse введите свой тестовый App Token.
 Для работы с локальными моделями оставьте поле пустым.</p>
 <input type="password" id="token" placeholder="Thingiverse App Token (необязательно)" autocomplete="off">
 <button id="start">Открыть 3D Studio</button>
 <p>Токен не записывается в файл. Не распространяйте сборку с личным токеном.</p>
 <script>document.getElementById('start').onclick=()=>{
 const b=document.getElementById('start');b.disabled=true;
 window.studio.start(document.getElementById('token').value);
 document.getElementById('token').value='';
 }</script></html>`;
 win.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent(html));
}
function start(value){
 if(starting)return;
 starting=true;
 const exe=gatewayPath();
 if(!fs.existsSync(exe)){dialog.showErrorBox('Нет локального сервера','studio-gateway.exe не включён в сборку.');starting=false;return;}
 const web=app.isPackaged?path.join(process.resourcesPath,'web'):path.join(__dirname,'app');
 if(!fs.existsSync(path.join(web,'index.html'))){dialog.showErrorBox('Нет интерфейса','index.html не найден в ресурсах.');starting=false;return;}
 const token=typeof value==='string'?value.trim():'';
 const env={...process.env,STUDIO_WEB_ROOT:web,THINGIVERSE_TOKEN:token};
 backend=spawn(exe,['--port','0'],{cwd:web,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
 let log='';
 backend.stdout.on('data',chunk=>{
   log=(log+chunk.toString()).slice(-4096);
   const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)\//);
   if(m&&!ready){
      ready=true;clearTimeout(timer);
      win.loadURL('http://127.0.0.1:'+m[1]+'/');
      win.setSize(1450,920);win.center();win.maximize();
   }
 });
 backend.stderr.on('data',b=>console.error('Gateway:',b.toString().slice(0,300)));
 backend.on('error',e=>{dialog.showErrorBox('Ошибка сервера',e.message);app.quit();});
 backend.on('exit',code=>{if(!app.isQuitting){dialog.showErrorBox('Сервер остановился','Код: '+code);app.quit();}});
 timer=setTimeout(()=>{if(!ready){dialog.showErrorBox('Ошибка запуска','Сервер не ответил за 30 секунд.');app.quit();}},30000);
}
app.whenReady().then(()=>{
 ipcMain.on('studio:start',(_,token)=>start(token));
 win=new BrowserWindow({width:650,height:440,autoHideMenuBar:true,webPreferences:{
  nodeIntegration:false,contextIsolation:true,sandbox:true,preload:path.join(__dirname,'preload.cjs')}});
 welcome();
 win.on('closed',()=>app.quit());
});
app.on('before-quit',()=>{app.isQuitting=true;clearTimeout(timer);if(backend){backend.kill();backend=null;}});
app.on('window-all-closed',()=>app.quit());
