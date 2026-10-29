const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('studio',{start:(token)=>ipcRenderer.send('studio:start',typeof token==='string'?token:'')});
