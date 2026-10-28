
(function(){
let last='';
function show(message){
 if(!message||message===last)return;last=message;
 let bar=document.getElementById('studioError');
 if(!bar){bar=document.createElement('div');bar.id='studioError';bar.style.cssText='position:fixed;bottom:14px;left:50%;transform:translateX(-50%);max-width:650px;z-index:99999;background:#742d38;color:#fff;padding:12px 16px;border-radius:10px;font:13px system-ui;box-shadow:0 10px 25px #0008';document.body.appendChild(bar)}
 bar.textContent='Ошибка редактора: '+message+' — нажмите F12 → Console для подробностей.';
}
window.addEventListener('error',e=>{if(e.message)show(e.message)});
window.addEventListener('unhandledrejection',e=>show(String(e.reason?.message||e.reason||'Неизвестная ошибка')));
})();
