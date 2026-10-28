
/* Обновляет оттенки полосы при смене темы, включая сохранённую тему. */
document.addEventListener('DOMContentLoaded', () => {
 const presets={
  dark:['#172537','#526b87','#7ca8cf'],
  light:['#e8edf5','#9eafc3','#6f8daa'],
  ocean:['#0c2939','#39758a','#55b3ce'],
  forest:['#192e26','#527b64','#7ab994'],
  purple:['#251e35','#78678f','#a890ce']
 };
 const root=document.documentElement;
 function update(){
  const choice=document.getElementById('themeChoice');
  const key=choice?.value || 'dark';
  const colors=presets[key]||presets.dark;
  ['--scroll-track','--scroll-thumb','--scroll-hover'].forEach((k,i)=>root.style.setProperty(k,colors[i]));
 }
 update();
 document.getElementById('themeChoice')?.addEventListener('change',update);
 document.getElementById('resetAppearance')?.addEventListener('click',()=>queueMicrotask(update));
});
