
window.addEventListener('load',()=>{try{
 const header=document.querySelector('header'),sidebars=document.querySelectorAll('main > aside');
 const settings=document.getElementById('appearanceSettings');
 if(header&&settings){
  const dock=document.createElement('div');dock.id='settingsDock';
  const trigger=document.createElement('button');trigger.id='settingsToggle';trigger.type='button';trigger.textContent='⚙ Настройки интерфейса';
  trigger.setAttribute('aria-expanded','false');
  dock.appendChild(trigger);dock.appendChild(settings);header.appendChild(dock);
  trigger.addEventListener('click',()=>{const open=dock.classList.toggle('open');trigger.setAttribute('aria-expanded',String(open))});
  document.addEventListener('pointerdown',e=>{if(!dock.contains(e.target)){dock.classList.remove('open');trigger.setAttribute('aria-expanded','false')}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){dock.classList.remove('open');trigger.setAttribute('aria-expanded','false')}});
 }
 
 if(!header||sidebars.length<2)return;
 const right=sidebars[1];
 const palette=document.createElement('section');palette.id='shapePalette';
 const title=document.createElement('b');title.textContent='＋ Создать фигуру';palette.appendChild(title);
 const tiles=document.createElement('div');tiles.id='shapeTiles';
 const icons={text:'<path d="M12 15H68V27H47V68H33V27H12Z" fill="#d4a2fa" stroke="#8257ac" stroke-width="2"/>',
 cube:'<path d="M14 22L39 11L65 22L40 35Z" fill="#ed7777"/><path d="M14 22L40 35V68L14 55Z" fill="#b73344"/><path d="M40 35L65 22V55L40 68Z" fill="#dc4654"/>',
 sphere:'<circle cx="40" cy="40" r="28" fill="#008fbd"/><circle cx="31" cy="27" r="12" fill="#36c6ed" opacity=".55"/>',
 cylinder:'<path d="M15 21V58Q40 75 65 58V21" fill="#c77326"/><ellipse cx="40" cy="21" rx="25" ry="11" fill="#ee9a3d" stroke="#824a1e"/>',
 cone:'<path d="M40 9L12 61Q40 77 68 61Z" fill="#814db1"/><path d="M40 9L40 69Q58 68 68 61Z" fill="#63338e"/>',
 cat:'<path d="M25 29L23 10L35 20L47 9L53 29Q70 42 55 63Q40 77 25 62Q12 43 25 29Z" fill="#8ab2e5" stroke="#45658b" stroke-width="2"/><circle cx="32" cy="37" r="2.4" fill="#1b3249"/><circle cx="46" cy="37" r="2.4" fill="#1b3249"/><path d="M37 46L41 46L39 50Z" fill="#e88aa4"/><path d="M54 56Q77 55 66 34" fill="none" stroke="#8ab2e5" stroke-width="8" stroke-linecap="round"/>',
 pyramid:'<path d="M40 9L9 62L43 72L70 58Z" fill="#e3ba22" stroke="#f6d957"/><path d="M40 9L43 72L70 58Z" fill="#c39516"/>',
 roof:'<path d="M9 52L30 16L52 52Z" fill="#5cae65"/><path d="M30 16L59 27L78 65L52 52Z" fill="#327d43"/><path d="M9 52L52 52L78 65L38 65Z" fill="#78c27b"/>',
 wedge:'<path d="M15 61L49 14L49 61Z" fill="#4bb5c4"/><path d="M49 14L72 28V70L49 61Z" fill="#2c7b9d"/>',
 hemisphere:'<path d="M10 53A30 30 0 0 1 70 53Z" fill="#e34b9f"/><ellipse cx="40" cy="53" rx="30" ry="9" fill="#b72e7e"/>',
 torus:'<ellipse cx="40" cy="42" rx="32" ry="22" fill="#13a4c4"/><ellipse cx="40" cy="42" rx="13" ry="8" fill="#23364d" stroke="#79d7e7" stroke-width="2"/>',
 angularTorus:'<path d="M18 20L60 20L74 37L64 61L16 61L6 37Z M30 33L49 33L56 42L48 50L30 50L24 42Z" fill="#e4a02f" fill-rule="evenodd" stroke="#ffd27b" stroke-width="2"/>',
 diamond:'<path d="M40 8L70 39L40 72L10 39Z" fill="#e45157"/><path d="M40 8L40 72L70 39Z" fill="#ad2738"/>',
 tapered:'<path d="M26 18L12 59Q40 77 68 59L54 18Z" fill="#6db8c7"/><ellipse cx="40" cy="18" rx="14" ry="7" fill="#a7e0e9"/>'
 };
 const items=[['text','Текст'],['cube','Куб'],['cylinder','Цилиндр'],['sphere','Шар'],['cone','Конус'],['pyramid','Пирамида'],['roof','Крыша'],['wedge','Клин'],['hemisphere','Полусфера'],['torus','Тор'],['angularTorus','Гранёный тор'],['diamond','Ромб'],['tapered','Суженный цилиндр'],['cat','Кошка']];
 items.forEach(([key,label])=>{
 const btn=document.createElement('button');btn.type='button';btn.className='shape-tile';btn.title='Добавить: '+label;
 btn.innerHTML='<svg viewBox="0 0 80 80" aria-hidden="true">'+icons[key]+'</svg><span>'+label+'</span>';
 btn.addEventListener('click',()=>{
  if(key==='text'){window.dispatchEvent(new Event('studio-add-text'))}else if(['cube','sphere','cylinder','cone','cat'].includes(key)){document.getElementById(key).click()}
  else{const select=document.getElementById('newShape');select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}))}
 });
 tiles.appendChild(btn)
 });
 palette.appendChild(tiles);
 ['cube','sphere','cylinder','cone','cat','newShape'].forEach(id=>{const el=document.getElementById(id);if(el){el.classList.add('legacy-shapes');palette.appendChild(el)}});
 right.prepend(palette);
 // Скрываем старые подписи перенесённых элементов, оставляя габариты только в верхней панели.
 [...right.querySelectorAll('label')].forEach(el=>el.style.display='none');
 [...right.querySelectorAll('small')].forEach(el=>{if(!el.closest('#shapePalette'))el.style.display='none'});

 const editor=document.createElement('div');editor.className='top-editor';
 const heading=document.createElement('b');heading.textContent='Параметры объекта';editor.appendChild(heading);
 const name=document.getElementById('name');
 if(name){const nameWrap=document.createElement('div');nameWrap.append('Название ');nameWrap.appendChild(name);editor.appendChild(nameWrap)}
 const details=document.createElement('details');details.innerHTML='<summary>↔ Перемещение по сетке ▾</summary><div class="movement-panel"></div>';
 const movement=details.querySelector('.movement-panel');
 ['moveLeft','moveRight','moveBack','moveFront','moveDown','moveUp'].forEach(id=>{const el=document.getElementById(id);if(el)movement.appendChild(el)});
 const info=document.createElement('small');info.textContent='Один щелчок — 1 мм; удержание — непрерывное движение по одной оси.';movement.appendChild(info);
 editor.appendChild(details);
 function group(title,id){
 const block=document.createElement('div');block.style.cssText='display:flex;flex-direction:column;gap:4px';
 const lab=document.createElement('label');lab.textContent=title;block.appendChild(lab);
 const el=document.getElementById(id);if(el)block.appendChild(el);editor.appendChild(block);
 }
 group('Положение XYZ (мм)','position');
 group('Габариты XYZ (мм)','scale');
 group('Поворот XYZ (°)','rotation');
 const color=document.getElementById('color');
 if(color){const block=document.createElement('div');block.append('Цвет ');block.appendChild(color);editor.appendChild(block)}
 header.appendChild(editor);
 // Остальные команды (экспорт, отмена, центрирование) остаются в верхней строке.
 const updateHeight=()=>document.documentElement.style.setProperty('--header-height',header.offsetHeight+'px');
 updateHeight();if(typeof ResizeObserver!=='undefined')new ResizeObserver(updateHeight).observe(header);
}catch(err){console.error('Ошибка перестановки панелей:',err);}
});

// Language selector belongs to the project home screen.
document.addEventListener('DOMContentLoaded',()=>{
 const slot=document.getElementById('homeLanguageSlot');
 const control=document.getElementById('languageControl');
 if(slot&&control)slot.appendChild(control);
});
