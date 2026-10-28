
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
const printerProfiles={
 '5m':{maker:'Flashforge',name:'Adventurer 5M',width:220,depth:220,height:220,materials:['PLA','PETG'],speed:1},
 '5mpro':{maker:'Flashforge',name:'Adventurer 5M Pro',width:220,depth:220,height:220,materials:['PLA','PETG','ABS','ASA'],speed:1},
 'ad5x':{maker:'Flashforge',name:'AD5X',width:220,depth:220,height:220,materials:['PLA','PETG','TPU'],speed:1},
 'creator5':{maker:'Flashforge',name:'Creator 5',width:256,depth:256,height:256,materials:['PLA','PETG','TPU'],speed:.85},
 'creator5pro':{maker:'Flashforge',name:'Creator 5 Pro',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','ABS','ASA'],speed:.85},
 'a1mini':{maker:'Bambu Lab',name:'A1 mini',width:180,depth:180,height:180,materials:['PLA','PETG','TPU','PVA'],speed:.9},
 'a1':{maker:'Bambu Lab',name:'A1',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA'],speed:.9},
 'p1p':{maker:'Bambu Lab',name:'P1P',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA'],speed:.95},
 'p1s':{maker:'Bambu Lab',name:'P1S',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:.95},
 'p2s':{maker:'Bambu Lab',name:'P2S',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1},
 'x1c':{maker:'Bambu Lab',name:'X1 Carbon',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1},
 'x1e':{maker:'Bambu Lab',name:'X1E',width:256,depth:256,height:256,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1},
 'h2s':{maker:'Bambu Lab',name:'H2S',width:340,depth:320,height:340,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1.2},
 'h2d':{maker:'Bambu Lab',name:'H2D (один экструдер)',width:325,depth:320,height:325,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1.2},
 'h2c':{maker:'Bambu Lab',name:'H2C (один экструдер)',width:305,depth:320,height:325,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:1.2},
 'mk4s':{maker:'Prusa',name:'MK4S',width:250,depth:210,height:220,materials:['PLA','PETG','TPU','PVA'],speed:.7},
 'coreone':{maker:'Prusa',name:'CORE One+',width:250,depth:220,height:270,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:.85},
 'coreonel':{maker:'Prusa',name:'CORE One L+',width:300,depth:300,height:330,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:.85},
 'xl':{maker:'Prusa',name:'XL+',width:360,depth:360,height:360,materials:['PLA','PETG','TPU','PVA','ABS','ASA','PA','PC'],speed:.8}
};
const filamentFactors={PETG:1,PLA:.88,ABS:1.12,ASA:1.16,TPU:1.4,PVA:1.3,PA:1.25,PC:1.25};
let printerProfile=printerProfiles['5m'];
function populateModels(){
 const maker=document.getElementById('manufacturer').value, model=document.getElementById('printerModel'),previous=model.value;
 model.replaceChildren();
 for(const [id,p] of Object.entries(printerProfiles))if(p.maker===maker){const opt=document.createElement('option');opt.value=id;opt.textContent=p.name;model.appendChild(opt)}
 if([...model.options].some(o=>o.value===previous))model.value=previous;
 configurePrinter();
}
const sceneThemeColors={
 dark:{grid:'#304054',bounds:'#48b8ff'},
 light:{grid:'#a1b1c5',bounds:'#2878ad'},
 ocean:{grid:'#24576a',bounds:'#37d4ee'},
 forest:{grid:'#365a46',bounds:'#91d79d'},
 purple:{grid:'#514269',bounds:'#c39aff'}
};
var appearance;
function rebuildGrid(){
 const p=printerProfile||{width:220,depth:220};
 const size=Math.max(p.width,p.depth);
 const chosen=appearance?.gridStep==='custom'?Number(appearance?.customGridSize):Number(appearance?.gridStep);
 const step=Number.isFinite(chosen)?Math.max(.1,Math.min(220,chosen)):1;
 const divisions=Math.max(1,Math.min(1200,Math.ceil(size/step)));
 const theme=appearance?.themeChoice||'dark';
 const palette=sceneThemeColors[theme]||sceneThemeColors.dark;
 const line=appearance?.gridColor||palette.grid;
 const geometry=new THREE.GridHelper(size,divisions,line,line).geometry;
 grid.geometry.dispose();grid.geometry=geometry;
}
function configurePrinter(){
 printerProfile=printerProfiles[document.getElementById('printerModel').value]||printerProfiles['5m'];
 const filament=document.getElementById('filament');
 for(const option of filament.options){option.disabled=!printerProfile.materials.includes(option.value)}
 if(!printerProfile.materials.includes(filament.value))filament.value=printerProfile.materials.includes('PETG')?'PETG':printerProfile.materials[0];
 const {width,depth,height}=printerProfile;
 document.getElementById('printerInfo').textContent=`Область печати: ${width} × ${depth} × ${height} мм. Шаг сетки: 1 мм.`;
 document.getElementById('estimateAccuracy').textContent=filament.value==='PETG'&&document.getElementById('printerModel').value==='5m'?'PETG на 5M: калибровка по 5 моделям.':'Ориентировочная оценка, не проверенная на выбранном принтере. Для точности используйте его слайсер.';
 rebuildGrid();
 boundary.geometry.dispose();boundary.geometry=new THREE.EdgesGeometry(new THREE.BoxGeometry(width,height,depth));boundary.position.y=height/2;
 clippingSides[0].constant=-width/2;clippingSides[1].constant=-width/2;clippingSides[3].constant=-height;clippingSides[4].constant=-depth/2;clippingSides[5].constant=-depth/2;
 document.getElementById('platformInfo').textContent=`Платформа: ${width} × ${depth} мм, высота: ${height} мм. Шаг сетки: 1 мм.`;
 updateEstimate();
}
const canvas=document.querySelector('#view'),renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x101827);const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(45,1,.1,5000);camera.position.set(220,190,260);const controls=new OrbitControls(camera,canvas);controls.target.set(0,60,0);controls.update();
// Adaptive wheel zoom: near the target retain a practical minimum movement in millimetres.
controls.enableZoom=false;
canvas.addEventListener('wheel',event=>{
 event.preventDefault();
 const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?canvas.clientHeight:1);
 const steps=Math.max(-8,Math.min(8,delta/100));
 if(Math.abs(steps)<0.0001)return;
 const offset=camera.position.clone().sub(controls.target);
 const distance=offset.length();
 if(distance<0.00001)return;
 const relative=distance*(Math.exp(steps*0.13)-1);
 const minimum=1.5*steps;
 const movement=Math.sign(steps)*Math.max(Math.abs(relative),Math.abs(minimum));
 const next=Math.max(1,Math.min(3000,distance+movement));
 camera.position.copy(controls.target).addScaledVector(offset.normalize(),next);
 controls.update();
},{passive:false});scene.add(new THREE.HemisphereLight(0xffffff,0x536178,2));const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(60,120,100);scene.add(light);const grid=new THREE.GridHelper(220,220,0x57718b,0x304054);scene.add(grid);scene.add(new THREE.AxesHelper(45));const boundary=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(220,220,220)),new THREE.LineBasicMaterial({color:0x48b8ff,transparent:true,opacity:.45}));boundary.position.y=110;scene.add(boundary);
const root=new THREE.Group();scene.add(root);
const limitWarning=document.createElement('div');limitWarning.id='limitWarning';limitWarning.style.cssText='position:fixed;top:76px;left:50%;transform:translateX(-50%);background:#782d37;color:white;padding:12px 20px;border-radius:9px;z-index:40;display:none;box-shadow:0 6px 25px #0008';document.body.appendChild(limitWarning);
function checkBounds(){root.updateMatrixWorld(true);let outside=[];for(const obj of root.children){const b=new THREE.Box3().setFromObject(obj);if(b.min.x < -printerProfile.width/2-1e-5 || b.max.x > printerProfile.width/2+1e-5 || b.min.z < -printerProfile.depth/2-1e-5 || b.max.z > printerProfile.depth/2+1e-5 || b.min.y < -0.02 || b.max.y > printerProfile.height+1e-5)outside.push(obj.name)}limitWarning.style.display=outside.length?'block':'none';limitWarning.textContent=outside.length?(()=>{
const lang=localStorage.getItem('3dstudio.ui.language')||'en';
const prefix=lang==='ru'?'⚠ Объект выходит за область печати':lang==='zh'?'⚠ 物体超出打印范围':'⚠ Object exceeds the build volume';
return `${prefix} ${printerProfile.width} × ${printerProfile.depth} × ${printerProfile.height} mm: `+outside.join(', ');
})():''}
function snap(v){return Math.round(v)}
// Красным окрашивается только реальная геометрия за границей области печати.
renderer.localClippingEnabled=true;
const overflowGroup=new THREE.Group();scene.add(overflowGroup);
const clippingSides=[
  new THREE.Plane(new THREE.Vector3(-1,0,0),-110), // X < -110
  new THREE.Plane(new THREE.Vector3(1,0,0),-110),  // X > 110
  new THREE.Plane(new THREE.Vector3(0,-1,0),-0.02),   // Y < -0.02 (погрешность касания платформы)
  new THREE.Plane(new THREE.Vector3(0,1,0),-220), // Y > 220
  new THREE.Plane(new THREE.Vector3(0,0,-1),-110),// Z < -110
  new THREE.Plane(new THREE.Vector3(0,0,1),-110)  // Z > 110
];
let overflowCopies=[];
function highlightOverflow(){
  root.updateMatrixWorld(true);
  const meshes=[];
  root.traverse(o=>{if(o.isMesh)meshes.push(o)});
  const signature=meshes.map(m=>m.uuid).join('|');
  if(highlightOverflow.signature!==signature){
    for(const o of overflowCopies){overflowGroup.remove(o);o.material.dispose()}
    overflowCopies=[];
    for(const mesh of meshes){
      for(const plane of clippingSides){
        const mat=new THREE.MeshBasicMaterial({color:0xff2539,transparent:true,opacity:.85,side:THREE.DoubleSide,depthTest:true,depthWrite:false,clippingPlanes:[plane],clipIntersection:false});
        const copy=new THREE.Mesh(mesh.geometry,mat);
        copy.matrixAutoUpdate=false;copy.renderOrder=100;
        copy.userData.source=mesh;copy.userData.sideIndex=clippingSides.indexOf(plane);
        overflowGroup.add(copy);overflowCopies.push(copy);
      }
    }
    highlightOverflow.signature=signature;
  }
  for(const copy of overflowCopies){
    const source=copy.userData.source;
    const bounds=new THREE.Box3().setFromObject(source);
    const tolerance=0.02;
    const beyond=[bounds.min.x < -printerProfile.width/2-tolerance,bounds.max.x > printerProfile.width/2+tolerance,
      bounds.min.y < -tolerance,bounds.max.y > printerProfile.height+tolerance,
      bounds.min.z < -printerProfile.depth/2-tolerance,bounds.max.z > printerProfile.depth/2+tolerance];
    copy.visible=beyond[copy.userData.sideIndex];
    if(copy.visible){copy.matrix.copy(source.matrixWorld);copy.matrixWorldNeedsUpdate=true}
  }
}

let selected=null,seq=0;let undoStack=[];const $=id=>document.getElementById(id);
// Оценка по геометрии (не G-code): скорость, число слоёв, стенки, верх/низ, решётка.
function estimateMesh(obj){
 obj.updateMatrixWorld(true);
 let solidVolume=0, surfaceArea=0;
 obj.traverse(m=>{
  if(!m.isMesh || !m.geometry)return;
  const geom=m.geometry, pos=geom.getAttribute('position'), idx=geom.index;
  if(!pos)return;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),ab=new THREE.Vector3(),ac=new THREE.Vector3(),cross=new THREE.Vector3();
  const count=idx?idx.count:pos.count;
  let signed=0;
  for(let i=0;i+2<count;i+=3){
   const ia=idx?idx.getX(i):i,ib=idx?idx.getX(i+1):i+1,ic=idx?idx.getX(i+2):i+2;
   a.fromBufferAttribute(pos,ia).applyMatrix4(m.matrixWorld);
   b.fromBufferAttribute(pos,ib).applyMatrix4(m.matrixWorld);
   c.fromBufferAttribute(pos,ic).applyMatrix4(m.matrixWorld);
   ab.subVectors(b,a);ac.subVectors(c,a);cross.crossVectors(ab,ac);
   surfaceArea+=cross.length()/2;
   signed+=a.dot(new THREE.Vector3().crossVectors(b,c))/6;
  }
  solidVolume+=Math.abs(signed);
 });
 const bb=new THREE.Box3().setFromObject(obj),size=bb.getSize(new THREE.Vector3());
 return {volume:solidVolume,area:surfaceArea,height:size.y,footprint:size.x*size.z};
}
function formatPrintTime(minutes){
 if(!Number.isFinite(minutes)||minutes<=0)return '—';
 const rounded=Math.max(1,Math.round(minutes));
 const h=Math.floor(rounded/60),m=rounded%60;
 return h?`${h} ч ${m} мин`:`${m} мин`;
}
// Калибровка по пяти замерам официального слайсера Flashforge.
const printCalibration={
 'Куб':{reference:12,old:25},
 'Кошка':{reference:25,old:44},
 'Конус':{reference:8,old:20},
 'Цилиндр':{reference:13,old:26},
 'Сфера':{reference:13,old:24}
};
function updateEstimate(){
 const scope=$('estimateScope'),output=$('estimateValue');
 if(!scope||!output)return;
 const targets=selected?[selected]:root.children;
 scope.textContent=selected?'Выбран: '+selected.name:'Все объекты на платформе';
 if(!targets.length){output.textContent='Нет объектов';return}
 const density=Math.min(1,Math.max(0,Number($('infillPercent').value)||0)/100);
 const walls=Math.min(8,Math.max(1,Number($('wallCount').value)||3));
 let minutes=0;
 for(const obj of targets){
  const {volume,area,height,footprint}=estimateMesh(obj);
  if(volume<=0||height<=0)continue;
  const shellThickness=walls*.42;
  // Объём стенок ограничен полным объёмом, верх/низ приблизительно 5 слоёв каждый.
  const shell=Math.min(volume,area*shellThickness*.48+footprint*2);
  const infill=Math.max(0,volume-shell)*density;
  const printedVolume=Math.min(volume,shell+infill);
  const layerCount=Math.max(1,Math.ceil(Math.max(0,height-.3)/.2)+1);
  // Эффективные скорости ниже номинальных 300 мм/с из-за коротких участков и ускорений.
  const shellLength=shell/(.42*.2), infillLength=infill/(.45*.2);
  const extrusionSeconds=shellLength/Math.min(300,65)+infillLength/Math.min(300,115);
  const travelSeconds=(layerCount*3+Math.sqrt(Math.max(0,footprint))*layerCount*.8)/Math.min(500,160);
  const layerOverhead=layerCount*.8;
  const rawMinutes=(extrusionSeconds+travelSeconds+layerOverhead+90)/60;
  const shape=Object.keys(printCalibration).find(k=>obj.name.startsWith(k));
  const factor=shape?printCalibration[shape].reference/printCalibration[shape].old:0.5;
  minutes+=rawMinutes*factor*filamentFactors[document.getElementById('filament').value]/printerProfile.speed;
 }
 output.textContent=formatPrintTime(minutes);
 output.title='Калиброванная приближённая оценка по пяти эталонам; не заменяет слайсинг G-code';
}
$('infillPercent').addEventListener('input',updateEstimate);
$('wallCount').addEventListener('input',updateEstimate);
document.getElementById('manufacturer').addEventListener('change',populateModels);
document.getElementById('printerModel').addEventListener('change',configurePrinter);
document.getElementById('filament').addEventListener('change',configurePrinter);
populateModels();
setInterval(()=>{if(document.visibilityState==='visible' && document.getElementById('projectHome').hidden)updateEstimate()},3500);

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);checkBounds();highlightOverflow()}loop();
// Устанавливаем нижнюю точку геометрии точно на плоскость земли (Y=0).
function placeOnGround(object){
  object.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(object);
  if(!bounds.isEmpty()){
    object.position.y-=bounds.min.y;
    object.updateMatrixWorld(true);
  }
}
function material(){return new THREE.MeshStandardMaterial({color:appearance?.defaultObjectColor||0x57b4ff,roughness:.65,side:THREE.DoubleSide,wireframe:!!appearance?.wireframeMode})}
function roofGeometry(w=36,h=30,d=40,half=false){
 // Замкнутая треугольная призма, либо её половина — клин.
 const x=half?0:-w/2, x2=w/2,z=d/2;
 const vertices=half?[[x,0,-z],[x2,0,-z],[x, h,-z],[x,0,z],[x2,0,z],[x,h,z]]:
 [[-w/2,0,-z],[w/2,0,-z],[0,h,-z],[-w/2,0,z],[w/2,0,z],[0,h,z]];
 const faces=[[0,2,1],[3,4,5],[0,1,4],[0,4,3],[1,2,5],[1,5,4],[2,0,3],[2,3,5]];
 const arr=[];for(const f of faces)for(const i of f)arr.push(...vertices[i]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));g.computeVertexNormals();return g;
}
function shapeGeometry(type,params={}){
 const sides=params.sides||48,top=params.top??16;
 switch(type){
 case 'cube':return new THREE.BoxGeometry(30,30,30);
 case 'sphere':return new THREE.SphereGeometry(18,48,32);
 case 'cylinder':return new THREE.CylinderGeometry(top,16,35,sides);
 case 'cone':return new THREE.CylinderGeometry(top===16?0:top,18,35,sides);
 case 'tapered':return new THREE.CylinderGeometry(top,18,35,sides);
 case 'pyramid':return new THREE.CylinderGeometry(0,22,36,4,1);
 case 'roof':return roofGeometry();
 case 'wedge':return roofGeometry(36,30,40,true);
 case 'hemisphere':return new THREE.SphereGeometry(18,48,24,0,Math.PI*2,0,Math.PI/2);
 case 'torus':{const g=new THREE.TorusGeometry(20,7,16,64);g.rotateX(Math.PI/2);return g}
 case 'angularTorus':{const g=new THREE.TorusGeometry(20,7,4,10);g.rotateX(Math.PI/2);return g}
 case 'diamond':return new THREE.OctahedronGeometry(22,0);
 default:return new THREE.BoxGeometry(30,30,30)
 }
}
// Unicode 3D text: browser font rasterization, then a closed extruded mesh.
function buildTextGeometry(value){
 const text=(value||' ').slice(0,80);
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const fontSize=48, unit=12/fontSize;
 ctx.font='bold 48px "Noto Sans","Microsoft YaHei","Arial Unicode MS",sans-serif';
 const width=Math.min(2400,Math.max(64,Math.ceil(ctx.measureText(text).width)+12));
 canvas.width=width;canvas.height=66;
 ctx.font='bold 48px "Noto Sans","Microsoft YaHei","Arial Unicode MS",sans-serif';
 ctx.textBaseline='alphabetic';ctx.fillStyle='#fff';ctx.fillText(text,6,51);
 const data=ctx.getImageData(0,0,width,66).data;
 const step=Math.max(1,Math.ceil(width/1100));
 const cols=Math.ceil(width/step),rows=Math.ceil(66/step);
 const filled=new Uint8Array(cols*rows);
 let minX=cols,maxX=-1,minZ=rows,maxZ=-1;
 for(let z=0;z<rows;z++)for(let x=0;x<cols;x++){
  let on=false;
  for(let dz=0;dz<step&&!on;dz++)for(let dx=0;dx<step;dx++){
   const px=x*step+dx,pz=z*step+dz;
   if(px<width&&pz<66&&data[(pz*width+px)*4+3]>110){on=true;break}
  }
  if(on){filled[z*cols+x]=1;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z)}
 }
 if(maxX<minX){minX=0;maxX=3;minZ=0;maxZ=3;for(let z=0;z<4;z++)for(let x=0;x<4;x++)filled[z*cols+x]=1}
 const verts=[],pitch=unit*step,thick=2;
 const vertex=(x,y,z)=>{verts.push((x-(minX+maxX+1)/2)*pitch,y,(z-(minZ+maxZ+1)/2)*pitch)};
 const quad=(a,b,c,d)=>{vertex(...a);vertex(...b);vertex(...c);vertex(...a);vertex(...c);vertex(...d)};
 const has=(x,z)=>x>=0&&x<cols&&z>=0&&z<rows&&filled[z*cols+x];
 for(let z=minZ;z<=maxZ;z++)for(let x=minX;x<=maxX;x++){
  if(!has(x,z))continue;
  const x0=x,x1=x+1,z0=z,z1=z+1;
  quad([x0,thick,z0],[x0,thick,z1],[x1,thick,z1],[x1,thick,z0]);
  quad([x0,0,z0],[x1,0,z0],[x1,0,z1],[x0,0,z1]);
  if(!has(x-1,z))quad([x0,0,z0],[x0,0,z1],[x0,thick,z1],[x0,thick,z0]);
  if(!has(x+1,z))quad([x1,0,z1],[x1,0,z0],[x1,thick,z0],[x1,thick,z1]);
  if(!has(x,z-1))quad([x1,0,z0],[x0,0,z0],[x0,thick,z0],[x1,thick,z0]);
  if(!has(x,z+1))quad([x0,0,z1],[x1,0,z1],[x1,thick,z1],[x0,thick,z1]);
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 geo.computeVertexNormals();return geo;
}
function enforceTextHeight(mesh,height=2){
 mesh.updateMatrixWorld(true);
 const size=new THREE.Box3().setFromObject(mesh).getSize(new THREE.Vector3());
 if(size.y>1e-8)mesh.scale.y*=height/size.y;
 setBottomY(mesh,0);
}
function addText(){
 saveUndo();
 const mesh=new THREE.Mesh(buildTextGeometry('Текст'),material());
 mesh.userData.shape='text';mesh.userData.text='Текст';mesh.userData.textHeightMM=2;
 mesh.name='Текст '+(++seq);
 root.add(mesh);placeOnGround(mesh);enforceTextHeight(mesh,2);select(mesh);
}
window.addEventListener('studio-add-text',addText);
function changeText(value){
 const obj=selected;
 if(!obj?.isMesh||obj.userData.shape!=='text')return;
 const floor=bottomY(obj),old=obj.geometry;
 const oldHeight=dimensions(obj).y;
 obj.geometry=buildTextGeometry(value);
 const height=dimensions(obj).y;
 if(height>1e-8)obj.scale.y*=oldHeight/height;
 setBottomY(obj,floor);
 obj.userData.text=value;
 old.dispose();
 checkBounds();updateEstimate();
}
document.getElementById('textContent').addEventListener('focus',()=>{if(selected)saveUndo()});
const textField=document.getElementById('textContent');
textField.addEventListener('input',e=>changeText(e.target.value));
textField.addEventListener('keydown',e=>{
 if(e.key==='Enter'){e.preventDefault();e.stopPropagation();changeText(e.currentTarget.value);e.currentTarget.blur()}
});
textField.addEventListener('pointerdown',e=>e.stopPropagation());
textField.addEventListener('click',e=>e.stopPropagation());
const shapeNames={cube:'Куб',sphere:'Сфера',cylinder:'Цилиндр',cone:'Конус',tapered:'Конический цилиндр',pyramid:'Пирамида',roof:'Треугольная призма',wedge:'Клин',hemisphere:'Полусфера',torus:'Тор',angularTorus:'Гранёный тор',diamond:'Ромбовидная фигура'};
function add(type){
 saveUndo();
 const mesh=new THREE.Mesh(shapeGeometry(type),material());
 mesh.userData.shape=type;
 mesh.userData.sides=48;
 mesh.userData.top=type==='cone'?0:16;
 mesh.name=(shapeNames[type]||type)+' '+(++seq);
 root.add(mesh);placeOnGround(mesh);select(mesh)
}
$('newShape').addEventListener('change',e=>{if(e.target.value)add(e.target.value);e.target.value=''});
function changeShapeParams(){
 if(!selected?.isMesh)return;
 const type=selected.userData.shape;
 if(!['cylinder','cone','tapered'].includes(type))return;
 const sides=Math.max(3,Math.min(256,Math.round(Number($('sidesNumber').value)||48)));
 const top=Math.max(0,Number($('topDiameter').value)||0)/2;
 saveUndo();
 const oldSize=dimensions(selected), oldBottom=bottomY(selected);
 const old=selected.geometry;
 selected.userData.sides=sides;selected.userData.top=top;
 selected.geometry=shapeGeometry(type,{sides,top});
 const newSize=dimensions(selected);
 for(const axis of ['x','y','z'])if(newSize[axis]>1e-7)selected.scale[axis]*=oldSize[axis]/newSize[axis];
 setBottomY(selected,oldBottom);
 old.dispose();$('sidesSlider').value=sides;$('sidesNumber').value=sides*1;
 refresh()
}
$('sidesSlider').oninput=e=>{$('sidesNumber').value=e.target.value;changeShapeParams()};
$('sidesNumber').onchange=changeShapeParams;
$('topDiameter').onchange=changeShapeParams;
function cat(){const group=new THREE.Group();group.name='Кошка '+(++seq);const mat=material();function part(g,x,y,z, sx=1,sy=1,sz=1){const m=new THREE.Mesh(g,mat.clone());m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m)}const ball=(r,x,y,z,sx=1,sy=1,sz=1)=>part(new THREE.SphereGeometry(r,24,16),x,y,z,sx,sy,sz);ball(17,0,23,0,1,1.3,.85);ball(14,0,49,4);for(const s of [-1,1]){part(new THREE.ConeGeometry(6,16,4),s*9,64,4,1,1,1);ball(6,s*10,8,11,.8,1.6,1);ball(2,s*6,51,16,.7,1,0.5)}ball(2,0,45,18);for(let i=0;i<7;i++){ball(5,19+i*2,12+i*4,-8+i*1.5,.8,.9,.8)}group.position.y=0;root.add(group);placeOnGround(group);select(group)}
let showDimensionsFromContext=false;
function select(o){if(o!==selected)showDimensionsFromContext=false;selected=o;refresh();if(!o)hideMenu()}
function hideMenu(){document.getElementById('contextMenu').style.display='none'}
function saveUndo(){undoStack.push(root.children.map(o=>o.clone(true)));if(undoStack.length>25)undoStack.shift()}
function showMenu(x,y){if(!selected)return;const menu=$('contextMenu');$('menuTitle').textContent=selected.name;const textSettings=$('textSettings');textSettings.style.display=selected.userData.shape==='text'?'block':'none';if(selected.userData.shape==='text')$('textContent').value=selected.userData.text||'Текст';const settings=$('meshSettings');const configurable=selected.isMesh&&['cylinder','cone','tapered'].includes(selected.userData.shape);settings.style.display=configurable?'block':'none';if(configurable){$('sidesNumber').value=selected.userData.sides||48;$('sidesSlider').value=selected.userData.sides||48;$('topDiameter').value=(selected.userData.top??16)*2}const wrap=$('menuRot');wrap.innerHTML='';['x','y','z'].forEach(axis=>{const label=document.createElement('label');label.textContent='Ось '+axis.toUpperCase();const inp=document.createElement('input');inp.type='number';inp.step='5';inp.value=THREE.MathUtils.radToDeg(selected.rotation[axis]).toFixed(1);inp.onfocus=()=>saveUndo();inp.oninput=()=>{if(selected){selected.rotation[axis]=THREE.MathUtils.degToRad(Number(inp.value)||0);refreshRotationPanel();refresh()}};label.appendChild(inp);wrap.appendChild(label)});menu.style.display='block';menu.style.left=Math.max(8,Math.min(x,innerWidth-260))+'px';menu.style.top=Math.max(8,Math.min(y,innerHeight-(configurable?550:selected.userData.shape==='text'?420:330)))+'px'}
function refreshRotationPanel(){const ins=$('rotation').querySelectorAll('input');['x','y','z'].forEach((a,i)=>{if(ins[i]&&selected)ins[i].value=THREE.MathUtils.radToDeg(selected.rotation[a]).toFixed(1)})}
function dimensions(o){if(!o)return new THREE.Vector3();o.updateMatrixWorld(true);return new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3())}
function bottomY(obj){obj.updateMatrixWorld(true);return new THREE.Box3().setFromObject(obj).min.y}
function setBottomY(obj,value){obj.position.y+=value-bottomY(obj)}
function refresh(){const list=$('objects');list.innerHTML='';root.children.forEach(o=>{const b=document.createElement('button');b.textContent=o.name;b.className=o===selected?'selected':'';b.onclick=()=>select(o);list.appendChild(b)});$('name').value=selected?.name||'';$('color').value=selected?'#'+(selected.isMesh?selected.material.color:selected.children[0].material.color).getHexString():'#57b4ff';for(const key of ['position','scale','rotation']){const div=$(key);div.innerHTML='';['x','y','z'].forEach(axis=>{const inp=document.createElement('input');inp.type='number';inp.step=key==='rotation'?'5':'1';inp.min=key==='scale'?'0.1':'';inp.style.width='30%';inp.title=axis.toUpperCase()+' ('+(key==='rotation'?'°':'мм')+')';inp.setAttribute('aria-label',inp.title);const dim=selected?dimensions(selected):new THREE.Vector3();inp.value=selected?(key==='rotation'?THREE.MathUtils.radToDeg(selected.rotation[axis]).toFixed(1):key==='scale'?dim[axis].toFixed(1):(axis==='y'?bottomY(selected):selected.position[axis]).toFixed(1)):0;inp.onfocus=()=>{if(selected)saveUndo()};inp.oninput=()=>{if(!selected||inp.value===''||inp.value==='-'||inp.value==='.')return;const value=Number(inp.value);if(!Number.isFinite(value))return;if(key==='rotation')selected.rotation[axis]=THREE.MathUtils.degToRad(value);else if(key==='position'){if(axis==='y')setBottomY(selected,snap(value));else selected.position[axis]=snap(value)}else{if(value<=0){alert('Размер должен быть больше 0 мм');refresh();return}const current=dimensions(selected)[axis];if(current>1e-8){const floor=bottomY(selected);selected.scale[axis]*=value/current;setBottomY(selected,floor)}else{alert('Невозможно изменить нулевой размер по этой оси');refresh();return}}checkBounds();updateEstimate()};inp.onchange=()=>{if(selected)refresh()};const wrap=document.createElement('div');wrap.style.cssText='width:30%;display:flex;flex-direction:column;gap:3px';const tag=document.createElement('small');tag.textContent=axis.toUpperCase()+(key==='rotation'?' (°)':' (мм)');wrap.appendChild(tag);inp.style.width='100%';wrap.appendChild(inp);div.appendChild(wrap)})}}
// Перемещение выбранного объекта мышью по горизонтальной плоскости.
const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2(), dragPlane=new THREE.Plane(), hit=new THREE.Vector3(), offset=new THREE.Vector3();let dragging=false,dragTarget=null;
function setPointer(e){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera)}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;showDimensionsFromContext=false;setPointer(e);const hits=raycaster.intersectObjects(root.children,true);if(!hits.length){hideMenu();select(null);return}let obj=hits[0].object;while(obj.parent&&obj.parent!==root)obj=obj.parent;if(obj.parent!==root)return;hideMenu();select(obj);saveUndo();dragTarget=obj;dragPlane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0),obj.position);if(raycaster.ray.intersectPlane(dragPlane,hit)){offset.copy(obj.position).sub(hit);dragging=true;controls.enabled=false;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing'}});
canvas.addEventListener('pointermove',e=>{setPointer(e);if(dragging&&dragTarget){if(raycaster.ray.intersectPlane(dragPlane,hit)){dragTarget.position.x=snap(hit.x+offset.x);dragTarget.position.z=snap(hit.z+offset.z);refreshParametersOnly()}}else{canvas.style.cursor=raycaster.intersectObjects(root.children,true).length?'grab':'auto'}});
function finishDrag(e){if(dragging){dragging=false;dragTarget=null;controls.enabled=true;canvas.style.cursor='auto';if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId)}}
canvas.addEventListener('pointerup',finishDrag);canvas.addEventListener('pointercancel',finishDrag);
function refreshParametersOnly(){const inputs=$('position').querySelectorAll('input');['x','y','z'].forEach((axis,i)=>{if(inputs[i]&&selected)inputs[i].value=(axis==='y'?bottomY(selected):selected.position[axis]).toFixed(1)})}
const moveMap={moveLeft:['x',-1],moveRight:['x',1],moveBack:['z',-1],moveFront:['z',1],moveDown:['y',-1],moveUp:['y',1]};
let holdTimer=null,holdDelay=null,holdButton=null;
function stopHold(){clearInterval(holdTimer);clearTimeout(holdDelay);holdTimer=null;holdDelay=null;if(holdButton){holdButton.classList.remove('holding');holdButton=null}}
function moveOne(axis,delta){if(!selected)return;if(axis==='y')setBottomY(selected,snap(bottomY(selected))+delta);else selected.position[axis]=snap(selected.position[axis])+delta;refresh()}
for(const [id,[axis,delta]] of Object.entries(moveMap)){
 const btn=$(id);
 btn.addEventListener('pointerdown',e=>{if(e.button!==0||!selected)return;e.preventDefault();stopHold();saveUndo();holdButton=btn;btn.classList.add('holding');btn.setPointerCapture(e.pointerId);moveOne(axis,delta);holdDelay=setTimeout(()=>{holdTimer=setInterval(()=>moveOne(axis,delta),45)},330)});
 btn.addEventListener('pointerup',stopHold);btn.addEventListener('pointercancel',stopHold);btn.addEventListener('lostpointercapture',stopHold);
 btn.addEventListener('click',e=>{if(e.detail===0&&selected){saveUndo();moveOne(axis,delta)}});
}
window.addEventListener('blur',stopHold);

$('name').onchange=e=>{if(selected){selected.name=e.target.value;refresh()}};$('color').oninput=e=>{if(!selected)return;selected.traverse(o=>{if(o.isMesh)o.material.color.set(e.target.value)})};for(const t of ['cube','sphere','cylinder','cone'])$(t).onclick=()=>{saveUndo();add(t)};$('cat').onclick=()=>{saveUndo();cat()};
function duplicate(){if(!selected)return;saveUndo();const copy=selected.clone(true);copy.name=selected.name+' — копия';copy.position.x+=20;copy.traverse(o=>{if(o.isMesh)o.material=o.material.clone()});root.add(copy);select(copy);hideMenu()}
$('duplicate').onclick=duplicate;$('menuDuplicate').onclick=duplicate;$('menuDelete').onclick=removeSelected;
$('menuClose').onclick=hideMenu;$('menuReset').onclick=()=>{if(!selected)return;saveUndo();selected.rotation.set(0,0,0);showMenu(parseFloat($('contextMenu').style.left),parseFloat($('contextMenu').style.top));refresh()};
$('undo').onclick=()=>{if(!undoStack.length)return;const snapshot=undoStack.pop();root.clear();snapshot.forEach(o=>root.add(o));selected=null;hideMenu();refresh()};
$('centerObject').onclick=()=>{if(!selected){alert('Сначала выберите объект');return}saveUndo();hideMenu();selected.position.x=0;selected.position.z=0;placeOnGround(selected);refresh();};$('resetView').onclick=()=>{camera.position.set(220,190,260);controls.target.set(0,60,0);controls.update()};
canvas.addEventListener('contextmenu',e=>{e.preventDefault();setPointer(e);const hits=raycaster.intersectObjects(root.children,true);if(hits.length){let o=hits[0].object;while(o.parent&&o.parent!==root)o=o.parent;select(o);showDimensionsFromContext=true;showMenu(e.clientX,e.clientY)}else{showDimensionsFromContext=false;hideMenu()}});
function removeSelected(){if(!selected)return;saveUndo();hideMenu();const obj=selected;root.remove(obj);obj.traverse(child=>{if(child.isMesh){child.geometry?.dispose();if(Array.isArray(child.material))child.material.forEach(m=>m.dispose());else child.material?.dispose()}});selected=null;dragging=false;dragTarget=null;controls.enabled=true;canvas.style.cursor='auto';refresh()}
$('remove').onclick=removeSelected;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideMenu();return}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undo').click();return}if(e.key!=='Delete'&&e.key!=='Del')return;const active=document.activeElement;if(active&&(active.matches('input,textarea,select')||active.isContentEditable))return;e.preventDefault();removeSelected()});$('clear').onclick=()=>{saveUndo();hideMenu();root.clear();selected=null;refresh()};$('export').onclick=()=>{if(!root.children.length){alert('Добавьте хотя бы один объект');return}root.updateMatrixWorld(true);const data=new STLExporter().parse(root,{binary:true});const blob=new Blob([data],{type:'application/octet-stream'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='model.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)};configurePrinter();

// User customization — persistent locally, without modifying print geometry.
const themePresets={
 dark:['#101827','#192638','#1d293b','#293a51','#e9eef8'],
 light:['#e9edf3','#f9fbff','#dce5f0','#e2e9f4','#19283d'],
 ocean:['#071c29','#0d2e3c','#10384a','#184b60','#e0f7ff'],
 forest:['#101e19','#1c3028','#223c31','#304e40','#e4f6e9'],
 purple:['#191427','#292039','#342847','#48395e','#f3eaff']
};
const appearanceIds=['themeChoice','accentChoice','defaultObjectColor','gridColor','boundsColor','showGrid','gridStep','showAxes','showBounds','wireframeMode'];
const appearanceDefaults={themeChoice:'dark',accentChoice:'#66b8ff',defaultObjectColor:'#57b4ff',gridColor:null,boundsColor:null,showGrid:true,gridStep:"1",customGridSize:"3",showAxes:true,showBounds:true,wireframeMode:false};

function updateSceneColorPickers(){
 const palette=sceneThemeColors[appearance.themeChoice]||sceneThemeColors.dark;
 document.getElementById('gridColor').value=appearance.gridColor||palette.grid;
 document.getElementById('boundsColor').value=appearance.boundsColor||palette.bounds;
}
function readAppearance(){
 try{return {...appearanceDefaults,...JSON.parse(localStorage.getItem('3dstudio.appearance.v1')||'{}')}}catch{return {...appearanceDefaults}}
}
appearance=readAppearance();
function applyAppearance(){
 const p=themePresets[appearance.themeChoice]||themePresets.dark;
 ['--ui-bg','--ui-panel','--ui-head','--ui-control','--ui-text'].forEach((name,i)=>document.documentElement.style.setProperty(name,p[i]));
 document.documentElement.style.setProperty('--ui-accent',appearance.accentChoice);
 const light=appearance.themeChoice==='light';
 const card=light?'#ffffff':p[3];
 const muted=light?'#506078':'#b9c9df';
 const border=light?'#a9b8c9':'#496078';
 const sceneColor=light?'#e8eef6':appearance.themeChoice==='ocean'?'#0b2635':appearance.themeChoice==='forest'?'#14271f':appearance.themeChoice==='purple'?'#211a32':'#101827';
 for(const [key,value] of Object.entries({'--ui-muted':muted,'--ui-border':border,'--ui-card':card,'--ui-scene':sceneColor}))document.documentElement.style.setProperty(key,value);
 renderer.setClearColor(new THREE.Color(sceneColor),1);
 boundary.material.color.set(appearance.boundsColor||(sceneThemeColors[appearance.themeChoice]||sceneThemeColors.dark).bounds);
 
 if(typeof grid!=='undefined'){grid.visible=!!appearance.showGrid;rebuildGrid()}
 if(typeof boundary!=='undefined')boundary.visible=!!appearance.showBounds;
 scene.traverse(obj=>{if(obj.type==='AxesHelper')obj.visible=!!appearance.showAxes});
 root.traverse(obj=>{if(obj.isMesh&&obj.material)obj.material.wireframe=!!appearance.wireframeMode});
}
function saveAppearance(){
 try{localStorage.setItem('3dstudio.appearance.v1',JSON.stringify(appearance))}catch{}
}
for(const id of appearanceIds){
 const input=document.getElementById(id);
 if(!input)continue;
 if(input.type==='checkbox')input.checked=!!appearance[id];else if(appearance[id]!=null)input.value=appearance[id];
 input.addEventListener('input',()=>{
  appearance[id]=input.type==='checkbox'?input.checked:input.value;
  if(id==='themeChoice')updateSceneColorPickers();
  if(id==='gridStep')document.getElementById('customGridRow').style.display=appearance.gridStep==='custom'?'block':'none';
  applyAppearance();saveAppearance()
 });
}
updateSceneColorPickers();
const customGridInput=document.getElementById('customGridSize');
customGridInput.value=appearance.customGridSize||'3';
document.getElementById('customGridRow').style.display=appearance.gridStep==='custom'?'block':'none';
customGridInput.addEventListener('input',()=>{const value=Number(customGridInput.value);if(!Number.isFinite(value)||value<.1||value>220)return;appearance.customGridSize=String(value);if(appearance.gridStep==='custom'){applyAppearance();saveAppearance()}});
customGridInput.addEventListener('change',()=>{const value=Number(customGridInput.value);const fixed=Number.isFinite(value)?Math.max(.1,Math.min(220,value)):3;customGridInput.value=String(fixed);appearance.customGridSize=String(fixed);applyAppearance();saveAppearance()});
document.getElementById('resetAppearance').addEventListener('click',()=>{
 appearance={...appearanceDefaults};
 for(const id of appearanceIds){
  const el=document.getElementById(id);
  if(el.type==='checkbox')el.checked=!!appearance[id];else if(appearance[id]!=null)el.value=appearance[id];
 }
 customGridInput.value=appearance.customGridSize;document.getElementById('customGridRow').style.display='none';
 updateSceneColorPickers();applyAppearance();saveAppearance()
});
applyAppearance();

// Projects: persist complete editable THREE scene objects, including geometry, materials and metadata.
const PROJECTS_KEY='3dstudio.projects.v1';
let activeProjectId=null, lastSavedSnapshot='', projectSaveErrorShown=false;
function getProjects(){
 try{const data=JSON.parse(localStorage.getItem(PROJECTS_KEY)||'[]');return Array.isArray(data)?data:[]}catch{return []}
}
function setProjects(items){localStorage.setItem(PROJECTS_KEY,JSON.stringify(items))}
function projectPayload(){
 return {format:'3dstudio-project',version:1,name:activeProjectId?getProjects().find(p=>p.id===activeProjectId)?.name||'Проект':'Проект',
 scene:root.toJSON(),printer:{brand:document.getElementById('manufacturer')?.value,model:document.getElementById('printerModel')?.value,material:document.getElementById('filament')?.value},
 infill:document.getElementById('infillPercent')?.value,walls:document.getElementById('wallCount')?.value};
}
function captureProjectThumbnail(group=root){
 try{
  const box=new THREE.Box3().setFromObject(group);
  if(box.isEmpty())return null;
  const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
  const oldPosition=camera.position.clone(),oldTarget=controls.target.clone();
  const distance=Math.max(60,size.length()*1.65);
  camera.position.copy(center).add(new THREE.Vector3(distance*.8,distance*.65,distance));
  controls.target.copy(center);camera.lookAt(center);camera.updateMatrixWorld();
  const foreign=group!==root, oldRootVisible=root.visible, oldGridVisible=grid.visible, oldBoundaryVisible=boundary.visible;
  if(foreign){root.visible=false;scene.add(group)}
  grid.visible=false;boundary.visible=false;
  renderer.render(scene,camera);
  const preview=document.createElement('canvas');preview.width=320;preview.height=190;
  const ctx=preview.getContext('2d');
  ctx.fillStyle='#e8edf4';ctx.fillRect(0,0,320,190);
  ctx.drawImage(renderer.domElement,0,0,renderer.domElement.width,renderer.domElement.height,0,0,320,190);
  if(foreign){scene.remove(group);root.visible=oldRootVisible}
  grid.visible=oldGridVisible;boundary.visible=oldBoundaryVisible;
  camera.position.copy(oldPosition);controls.target.copy(oldTarget);controls.update();
  renderer.render(scene,camera);
  return preview.toDataURL('image/jpeg',.72);
 }catch(err){console.warn('Не удалось создать миниатюру',err);return null}
}
function saveActiveProject(silent=false,thumbnail=true){
 if(!activeProjectId)return false;
 try{
  const items=getProjects(),index=items.findIndex(p=>p.id===activeProjectId);
  if(index<0)return false;
  const data=projectPayload(),serialized=JSON.stringify(data);
  items[index]={...items[index],updated:new Date().toISOString(),data,thumbnail:thumbnail?(captureProjectThumbnail()||items[index].thumbnail):items[index].thumbnail};
  setProjects(items);lastSavedSnapshot=serialized;projectSaveErrorShown=false;const status=document.getElementById('saveStatus');if(status)status.textContent='✓ Сохранено '+new Date().toLocaleTimeString('ru-RU');
  if(!silent)alert('Проект сохранён');
  return true;
 }catch(e){
  if(!projectSaveErrorShown){alert('Не удалось сохранить проект: возможно, закончилось место в хранилище браузера. Скачайте файл проекта.');projectSaveErrorShown=true}
  return false;
 }
}
function showProjectHome(){if(activeProjectId)saveActiveProject(true);renderProjects();document.getElementById('projectHome').hidden=false;hideMenu()}
function hideProjectHome(){document.getElementById('projectHome').hidden=true}
function populateMissingThumbnails(){
 const items=getProjects();
 let changed=false;
 for(const item of items){
  if(item.thumbnail||!item.data?.scene)continue;
  try{
   const group=new THREE.ObjectLoader().parse(item.data.scene);
   item.thumbnail=captureProjectThumbnail(group);
   if(item.thumbnail)changed=true;
  }catch(err){console.warn('Миниатюра старого проекта',item.name,err)}
 }
 if(changed){try{setProjects(items)}catch(err){console.warn('Недостаточно памяти для миниатюр',err)}}
 return items;
}
function renderProjects(){
 const list=document.getElementById('projectList');list.replaceChildren();
 const items=populateMissingThumbnails().sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));
 if(!items.length){const p=document.createElement('p');p.className='muted';p.textContent='Пока нет сохранённых проектов.';list.appendChild(p)}
 for(const p of items){
  const row=document.createElement('div');row.className='project-row';
  const imageBox=document.createElement('div');imageBox.className='project-thumbnail';
  if(p.thumbnail){const img=document.createElement('img');img.src=p.thumbnail;img.alt='Предпросмотр модели: '+p.name;imageBox.appendChild(img)}
  else{const placeholder=document.createElement('span');placeholder.textContent='◈ 3D';imageBox.appendChild(placeholder)}
  imageBox.title='Открыть проект';imageBox.onclick=()=>openProject(p.id);row.appendChild(imageBox);
  const info=document.createElement('div');info.className='project-info';
  const title=document.createElement('strong');title.textContent=p.name;
  const date=document.createElement('small');date.textContent=p.updated?new Date(p.updated).toLocaleString('ru-RU'):'';
  info.append(title,date);row.appendChild(info);
  function action(label,callback,cls=''){const b=document.createElement('button');b.textContent=label;b.className=cls;b.onclick=callback;row.appendChild(b)}
  action('Открыть',()=>openProject(p.id));
  action('Переименовать',()=>{const field=document.createElement('input');field.value=p.name;field.maxLength=80;info.replaceChild(field,title);field.focus();field.select();const commit=()=>{const name=field.value.trim();const all=getProjects(),found=all.find(x=>x.id===p.id);if(found&&name){found.name=name.slice(0,80);setProjects(all)}renderProjects()};field.addEventListener('keydown',e=>{if(e.key==='Enter')commit();if(e.key==='Escape')renderProjects()});field.addEventListener('blur',commit,{once:true})});
  action('Удалить',()=>{
   // Подтверждение внутри приложения: системный confirm может блокироваться в превью.
   row.querySelectorAll('.confirm-delete').forEach(el=>el.remove());
   const confirmBox=document.createElement('div');confirmBox.className='confirm-delete';
   confirmBox.style.cssText='width:100%;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px';
   const question=document.createElement('span');question.textContent='Удалить «'+p.name+'» без возможности восстановления?';
   const yes=document.createElement('button');yes.textContent='Да, удалить';yes.className='danger';
   const no=document.createElement('button');no.textContent='Отмена';
   yes.addEventListener('click',()=>{
    try{
     const remaining=getProjects().filter(item=>item.id!==p.id);
     setProjects(remaining);
     if(activeProjectId===p.id){activeProjectId=null;lastSavedSnapshot=''}
     renderProjects();
    }catch(err){question.textContent='Ошибка удаления: '+err.message}
   });
   no.addEventListener('click',()=>confirmBox.remove());
   confirmBox.append(question,yes,no);row.appendChild(confirmBox);
  },'danger');
  list.appendChild(row);
 }
}
function resetProjectScene(){
 root.clear();selected=null;undoStack.length=0;seq=0;refresh();
}
function openProject(id){
 if(activeProjectId&&activeProjectId!==id)saveActiveProject(true);
 const p=getProjects().find(item=>item.id===id);
 if(!p)return alert('Проект не найден');
 try{
  resetProjectScene();
  const obj=new THREE.ObjectLoader().parse(p.data.scene);
  for(const child of [...obj.children])root.add(child);
  seq=root.children.length;
  activeProjectId=id;
  if(p.data.infill!=null)document.getElementById('infillPercent').value=p.data.infill;
  if(p.data.walls!=null)document.getElementById('wallCount').value=p.data.walls;
  const print=p.data.printer;
  if(print){
   const brand=document.getElementById('manufacturer'),model=document.getElementById('printerModel'),material=document.getElementById('filament');
   if(brand&&print.brand){brand.value=print.brand;brand.dispatchEvent(new Event('change'))}
   if(model&&print.model){model.value=print.model;model.dispatchEvent(new Event('change'))}
   if(material&&print.material){material.value=print.material;material.dispatchEvent(new Event('change'))}
  }
  refresh();checkBounds();updateEstimate();hideProjectHome();
  lastSavedSnapshot=JSON.stringify(projectPayload());
 }catch(e){console.error(e);alert('Не удалось открыть проект. Возможно, файл повреждён.')}
}
function newProject(){
 if(activeProjectId)saveActiveProject(true);
 const name=document.getElementById('newProjectName').value.trim()||'Новый проект';
 const id='p-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
 resetProjectScene();add('cube');
 const data=projectPayload();data.name=(name.trim()||'Новый проект').slice(0,80);
 try{
  const items=getProjects();items.push({id,name:data.name,updated:new Date().toISOString(),data,thumbnail:captureProjectThumbnail()});setProjects(items);
  activeProjectId=id;lastSavedSnapshot=JSON.stringify(projectPayload());hideProjectHome();refresh();
 }catch(e){alert('Не удалось создать проект в локальном хранилище.')}
}
function downloadProject(){
 if(!activeProjectId)return alert('Сначала создайте или откройте проект');
 saveActiveProject(true);
 const data=projectPayload(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;
 a.download=(data.name||'project').replace(/[\\/:*?"<>|]/g,'_')+'.3dstudio';
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const saveStatus=document.createElement('small');saveStatus.id='saveStatus';saveStatus.style.cssText='font-size:11px;color:#a5c8e8;white-space:nowrap';saveStatus.textContent='Автосохранение включено';document.getElementById('projectToolbar')?.appendChild(saveStatus);
document.getElementById('homeProject').onclick=showProjectHome;
document.getElementById('saveProject').onclick=()=>saveActiveProject();
document.getElementById('downloadProject').onclick=downloadProject;
document.getElementById('newProject').onclick=newProject;
document.getElementById('newProjectName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();newProject()}});
document.getElementById('importProject').onclick=()=>document.getElementById('projectFile').click();
document.getElementById('projectFile').onchange=async e=>{
 const file=e.target.files?.[0];if(!file)return;
 try{
  const data=JSON.parse(await file.text());
  if(data.format!=='3dstudio-project'||!data.scene?.object)throw Error('Неверный формат');
  const id='p-'+Date.now()+'-'+Math.random().toString(36).slice(2,8);
  const name=String(data.name||file.name).slice(0,80);
  const items=getProjects();items.push({id,name,updated:new Date().toISOString(),data});setProjects(items);openProject(id);
 }catch(err){alert('Не удалось импортировать проект: '+err.message)}
 e.target.value='';
};
// Save after editing pauses, without serializing geometry every animation frame.
setInterval(()=>{
 if(!activeProjectId||!document.getElementById('projectHome').hidden)return;
 try{const current=JSON.stringify(projectPayload());if(current!==lastSavedSnapshot)saveActiveProject(true,false)}catch{}
},2000);
window.addEventListener('beforeunload',()=>{if(activeProjectId)saveActiveProject(true,false)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&activeProjectId)saveActiveProject(true,false)});
window.addEventListener('pagehide',()=>{if(activeProjectId)saveActiveProject(true,false)});
renderProjects();
document.getElementById('projectHome').hidden=false;

// On-object dimension handles — experimental, camera-facing HTML overlays.
const dimensionLayer=document.createElement('div');
dimensionLayer.id='dimensionOverlay';
document.body.appendChild(dimensionLayer);
const dimensionHandles={};
for(const axis of ['x','y','z']){
 const label=document.createElement('label');
 label.className='dimension-handle axis-'+axis;
 const span=document.createElement('span');span.textContent=axis.toUpperCase();
 const input=document.createElement('input');input.type='number';input.min='0.1';input.step='1';
 input.setAttribute('aria-label',axis.toUpperCase()+' dimension in millimeters');
 const unit=document.createElement('span');unit.textContent='mm';
 label.append(span,input,unit);dimensionLayer.appendChild(label);
 dimensionHandles[axis]={label,input};
 input.addEventListener('pointerdown',e=>e.stopPropagation());
 input.addEventListener('click',e=>e.stopPropagation());
 input.addEventListener('keydown',e=>e.stopPropagation());
 input.addEventListener('focus',()=>{if(selected)saveUndo()});
 input.addEventListener('input',()=>{
  if(!selected||input.value===''||!Number.isFinite(input.valueAsNumber)||input.valueAsNumber<=0)return;
  const current=dimensions(selected)[axis];
  if(current<=1e-8)return;
  const floor=bottomY(selected);
  selected.scale[axis]*=input.valueAsNumber/current;
  setBottomY(selected,floor);
  checkBounds();updateEstimate();
 });
 input.addEventListener('change',()=>{if(selected)refresh()});
}
let lastDimensionValues={};
function positionDimensionHandles(){
 const rect=canvas.getBoundingClientRect();
 // Display only in editor, not in project home.
 const show=showDimensionsFromContext && !!selected && document.getElementById('projectHome').hidden;
 dimensionLayer.style.display=show?'block':'none';
 if(show){
  const box=new THREE.Box3().setFromObject(selected);
  if(!box.isEmpty()){
   const center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());
   const anchors={
    x:new THREE.Vector3(center.x,box.max.y+Math.max(3,size.y*.07),box.min.z),
    y:new THREE.Vector3(box.max.x+Math.max(3,size.x*.07),center.y,center.z),
    z:new THREE.Vector3(box.min.x,box.min.y+Math.max(2,size.y*.04),center.z)
   };
   for(const axis of ['x','y','z']){
    const {label,input}=dimensionHandles[axis];
    const point=anchors[axis].project(camera);
    const x=rect.left+(point.x+1)*rect.width/2;
    const y=rect.top+(1-point.y)*rect.height/2;
    const onscreen=point.z<1&&x>rect.left+10&&x<rect.right-10&&y>rect.top+10&&y<rect.bottom-10;
    label.style.display=onscreen?'flex':'none';
    label.style.left=x+'px';label.style.top=y+'px';
    if(document.activeElement!==input){
     const value=size[axis].toFixed(1);
     if(input.value!==value)input.value=value;
    }
   }
  }
 }
 requestAnimationFrame(positionDimensionHandles);
}
positionDimensionHandles();


// FEATURE: hole
// Experimental Tinkercad-style boolean subtraction (BSP, closed triangle meshes).
const EPS=1e-5;
class Vtx{
 constructor(pos,normal){this.pos=pos;this.normal=normal}
 clone(){return new Vtx(this.pos.clone(),this.normal.clone())}
 flip(){this.normal.negate()}
 interpolate(v,t){return new Vtx(this.pos.clone().lerp(v.pos,t),this.normal.clone().lerp(v.normal,t).normalize())}
}
class Plane{
 constructor(normal,w){this.normal=normal;this.w=w}
 clone(){return new Plane(this.normal.clone(),this.w)}
 flip(){this.normal.negate();this.w=-this.w}
 static from(a,b,c){
  const n=b.pos.clone().sub(a.pos).cross(c.pos.clone().sub(a.pos)).normalize();
  return new Plane(n,n.dot(a.pos))
 }
 split(p,coplanarFront,coplanarBack,front,back){
  const types=[],COP=0,FRONT=1,BACK=2,SPANNING=3;let polygonType=0;
  for(const v of p.vertices){
   const t=this.normal.dot(v.pos)-this.w;
   const type=t < -EPS?BACK:t>EPS?FRONT:COP;
   polygonType|=type;types.push(type)
  }
  switch(polygonType){
   case COP:(this.normal.dot(p.plane.normal)>0?coplanarFront:coplanarBack).push(p);break;
   case FRONT:front.push(p);break;
   case BACK:back.push(p);break;
   case SPANNING:{
    const f=[],b=[];
    for(let i=0;i<p.vertices.length;i++){
     const j=(i+1)%p.vertices.length,ti=types[i],tj=types[j],vi=p.vertices[i],vj=p.vertices[j];
     if(ti!==BACK)f.push(vi);
     if(ti!==FRONT)b.push(ti!==BACK?vi.clone():vi);
     if((ti|tj)===SPANNING){
      const t=(this.w-this.normal.dot(vi.pos))/this.normal.dot(vj.pos.clone().sub(vi.pos));
      const v=vi.interpolate(vj,t);f.push(v);b.push(v.clone())
     }
    }
    if(f.length>=3)front.push(new Poly(f));
    if(b.length>=3)back.push(new Poly(b));
   }
  }
 }
}
class Poly{
 constructor(vertices){this.vertices=vertices;this.plane=Plane.from(...vertices.slice(0,3))}
 clone(){return new Poly(this.vertices.map(v=>v.clone()))}
 flip(){this.vertices.reverse().forEach(v=>v.flip());this.plane.flip()}
}
class Node{
 constructor(polygons=[]){this.plane=null;this.front=null;this.back=null;this.polygons=[];if(polygons.length)this.build(polygons)}
 clone(){const n=new Node();n.plane=this.plane?.clone()||null;n.polygons=this.polygons.map(p=>p.clone());n.front=this.front?.clone()||null;n.back=this.back?.clone()||null;return n}
 invert(){for(const p of this.polygons)p.flip();this.plane?.flip();this.front?.invert();this.back?.invert();[this.front,this.back]=[this.back,this.front]}
 clipPolygons(polygons){
  if(!this.plane)return polygons.slice();
  let f=[],b=[];
  for(const p of polygons)this.plane.split(p,f,b,f,b);
  if(this.front)f=this.front.clipPolygons(f);
  if(this.back)b=this.back.clipPolygons(b);else b=[];
  return f.concat(b)
 }
 clipTo(other){this.polygons=other.clipPolygons(this.polygons);this.front?.clipTo(other);this.back?.clipTo(other)}
 allPolygons(){return this.polygons.concat(this.front?this.front.allPolygons():[],this.back?this.back.allPolygons():[])}
 build(polygons){
  if(!polygons.length)return;
  if(!this.plane)this.plane=polygons[0].plane.clone();
  const f=[],b=[];
  for(const p of polygons)this.plane.split(p,this.polygons,this.polygons,f,b);
  if(f.length){if(!this.front)this.front=new Node();this.front.build(f)}
  if(b.length){if(!this.back)this.back=new Node();this.back.build(b)}
 }
}
function meshPolygons(mesh){
 mesh.updateMatrixWorld(true);
 const geometry=mesh.geometry,position=geometry.getAttribute('position'),index=geometry.index;
 const normal=geometry.getAttribute('normal'),normalMatrix=new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);
 const count=index?index.count:position.count,polygons=[];
 for(let i=0;i+2<count;i+=3){
  const verts=[];
  for(let j=0;j<3;j++){
   const n=index?index.getX(i+j):i+j;
   const p=new THREE.Vector3().fromBufferAttribute(position,n).applyMatrix4(mesh.matrixWorld);
   const norm=normal?new THREE.Vector3().fromBufferAttribute(normal,n).applyMatrix3(normalMatrix).normalize():new THREE.Vector3(0,1,0);
   verts.push(new Vtx(p,norm));
  }
  if(verts[1].pos.clone().sub(verts[0].pos).cross(verts[2].pos.clone().sub(verts[0].pos)).lengthSq()>1e-10)polygons.push(new Poly(verts))
 }
 return polygons;
}
function subtractPolygons(a,b){
 const A=new Node(a),B=new Node(b);
 A.invert();A.clipTo(B);B.clipTo(A);B.invert();B.clipTo(A);B.invert();A.build(B.allPolygons());A.invert();
 return A.allPolygons();
}
function polygonsGeometry(polygons){
 const vertices=[];
 for(const p of polygons)for(let i=2;i<p.vertices.length;i++){
  for(const v of [p.vertices[0],p.vertices[i-1],p.vertices[i]])vertices.push(v.pos.x,v.pos.y,v.pos.z)
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();
 return g;
}
function isHole(obj){return !!obj?.userData?.isHole}
function setHole(obj,enabled){
 if(!obj?.isMesh)return false;
 obj.userData.isHole=enabled;
 if(enabled){
  obj.userData.previousColor='#'+obj.material.color.getHexString();
  obj.material=obj.material.clone();
  obj.material.color.set('#e5a4f9');
  obj.material.transparent=true;obj.material.opacity=.42;obj.material.depthWrite=false;
 }else{
  obj.material=obj.material.clone();
  obj.material.color.set(obj.userData.previousColor||'#57b4ff');
  obj.material.transparent=false;obj.material.opacity=1;obj.material.depthWrite=true;
 }
 refresh();return true
}
function subtractHoles(){
 if(!selected||isHole(selected)||!selected.isMesh){setStatus('Select a solid mesh to subtract holes from.');return}
 const target=selected;
 const targetBounds=new THREE.Box3().setFromObject(target);
 const cutters=root.children.filter(o=>o!==target&&o.isMesh&&isHole(o)&&new THREE.Box3().setFromObject(o).intersectsBox(targetBounds));
 if(!cutters.length){setStatus('No intersecting hole shapes. Move a purple hole into the selected solid.');return}
 try{
  saveUndo();
  let polygons=meshPolygons(target);
  for(const cutter of cutters)polygons=subtractPolygons(polygons,meshPolygons(cutter));
  if(!polygons.length)throw Error('The operation removed the entire solid.');
  const geometry=polygonsGeometry(polygons);
  // BSP output uses world coordinates: reset object transform.
  const old=target.geometry;target.geometry=geometry;
  target.position.set(0,0,0);target.rotation.set(0,0,0);target.scale.set(1,1,1);
  target.userData.shape='booleanSolid';
  old.dispose();
  for(const cutter of cutters)root.remove(cutter);
  select(target);refresh();checkBounds();updateEstimate();
  setStatus('Subtraction complete. Export STL to check the result in your slicer.');
 }catch(err){console.error(err);setStatus('Boolean error: '+err.message)}
}
const panel=document.createElement('div');
panel.id='holeTools';
panel.style.cssText='position:fixed;bottom:16px;right:18px;z-index:45;background:#17283b;border:1px solid #647e9a;border-radius:12px;padding:14px;max-width:320px;box-shadow:0 12px 32px #0009;color:#f1f5ff;font:13px system-ui';
panel.innerHTML=`<strong>🧪 Hole tool / Boolean subtraction</strong><p style="margin:8px 0;color:#b9cbe0">1. Add two shapes. 2. Select the cutter and click “Make hole”. 3. Move/rotate it inside another shape. 4. Select the solid and click “Subtract holes”.</p>
<div style="display:flex;gap:7px;flex-wrap:wrap"><button id="makeHole">Make hole</button><button id="makeSolid">Make solid</button><button id="subtractHoles">Subtract holes</button></div><p id="holeStatus" style="margin:9px 0 0;color:#a6e7ff"></p>`;
document.body.appendChild(panel);
function setStatus(message){document.getElementById('holeStatus').textContent=message}
document.getElementById('makeHole').onclick=()=>{if(!selected||!selected.isMesh)return setStatus('Select a mesh first.');saveUndo();setHole(selected,true);setStatus('Purple shape is now a hole. Move it into another shape.')};
document.getElementById('makeSolid').onclick=()=>{if(!selected||!selected.isMesh)return setStatus('Select a mesh first.');saveUndo();setHole(selected,false);setStatus('Shape changed back to solid.')};
document.getElementById('subtractHoles').onclick=subtractHoles;
// Exclude uncommitted hole shapes from STL output; they are cutters, not printed solids.
const exportButton=document.getElementById('export');
exportButton.onclick=()=>{
 const printable=root.children.filter(o=>!isHole(o));
 if(!printable.length){setStatus('No solid objects to export.');return}
 const group=new THREE.Group();
 root.updateMatrixWorld(true);
 for(const obj of printable){const clone=obj.clone(true);clone.applyMatrix4(obj.matrixWorld);group.add(clone)}
 const data=new STLExporter().parse(group,{binary:true});
 const blob=new Blob([data],{type:'application/octet-stream'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='model.stl';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
};

// FEATURE: sketch
// Interactive 2D grid sketcher. Points are snapped to 1 mm and extruded into 3D.
const sketchOverlay=document.createElement('div');
sketchOverlay.id='sketchOverlay';
sketchOverlay.style.cssText='display:none;position:fixed;inset:0;z-index:900;background:#07101de9;color:#e8f3ff;font:14px system-ui;padding:18px;box-sizing:border-box';
sketchOverlay.innerHTML=`<div style="max-width:1040px;margin:auto;height:100%;display:flex;flex-direction:column;gap:10px">
<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
<strong style="font-size:19px">✏️ Draw a custom shape</strong>
<span style="color:#b8c9df">Click grid intersections to add vertices (1 mm snap)</span>
<label>Height <input id="sketchHeight" type="number" min="0.1" max="220" step="1" value="5" style="width:75px"> mm</label>
<button id="sketchUndo">↶ Undo point</button><button id="sketchClear">Clear</button><button id="sketchCreate" style="background:#317ab3">Create 3D shape</button><button id="sketchClose">✕ Close</button>
</div><canvas id="sketchCanvas" style="width:100%;flex:1;min-height:250px;min-width:0;cursor:crosshair;border:1px solid #4a7396;border-radius:12px;background:#122236"></canvas>
<div id="sketchInfo" style="color:#a8d0f3">Click to place your first point. Draw a closed outline; the last point will connect to the first automatically.</div>
</div>`;
document.body.appendChild(sketchOverlay);
const sketchCanvas=document.getElementById('sketchCanvas'),sketchCtx=sketchCanvas.getContext('2d');
let sketchPoints=[],sketchHover=null,sketchScale=5,sketchOrigin={x:0,y:0};
function sketchToScreen(p){return {x:sketchOrigin.x+p.x*sketchScale,y:sketchOrigin.y-p.z*sketchScale}}
function sketchFromScreen(x,y){return {x:Math.round((x-sketchOrigin.x)/sketchScale),z:Math.round((sketchOrigin.y-y)/sketchScale)}}
function sketchSize(){
 const bounds=sketchCanvas.getBoundingClientRect(),ratio=window.devicePixelRatio||1;
 sketchCanvas.width=Math.round(bounds.width*ratio);sketchCanvas.height=Math.round(bounds.height*ratio);
 sketchCtx.setTransform(ratio,0,0,ratio,0,0);
 sketchOrigin={x:bounds.width/2,y:bounds.height/2};
 sketchScale=Math.max(3,Math.min(8,Math.floor(Math.min(bounds.width,bounds.height)/100)));
 sketchRender();
}
function sketchRender(){
 const ctx=sketchCtx,w=sketchCanvas.clientWidth,h=sketchCanvas.clientHeight;
 ctx.clearRect(0,0,w,h);
 const gap=sketchScale;
 ctx.lineWidth=1;
 for(let x=sketchOrigin.x%gap;x<w;x+=gap){ctx.strokeStyle='#ffffff14';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
 for(let y=sketchOrigin.y%gap;y<h;y+=gap){ctx.strokeStyle='#ffffff14';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
 ctx.strokeStyle='#5fa0c0';ctx.beginPath();ctx.moveTo(sketchOrigin.x,0);ctx.lineTo(sketchOrigin.x,h);ctx.moveTo(0,sketchOrigin.y);ctx.lineTo(w,sketchOrigin.y);ctx.stroke();
 if(sketchPoints.length){
  ctx.beginPath();
  sketchPoints.forEach((p,i)=>{const q=sketchToScreen(p);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y)});
  if(sketchPoints.length>=3){ctx.closePath();ctx.fillStyle='#48b7ff42';ctx.fill()}
  ctx.strokeStyle='#7bd0ff';ctx.lineWidth=2;ctx.stroke();
  if(sketchHover){const last=sketchToScreen(sketchPoints.at(-1)),hover=sketchToScreen(sketchHover);ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(hover.x,hover.y);ctx.stroke();ctx.setLineDash([])}
  sketchPoints.forEach((p,i)=>{const q=sketchToScreen(p);ctx.beginPath();ctx.arc(q.x,q.y,4,0,Math.PI*2);ctx.fillStyle=i?'#f0bd65':'#66ffb2';ctx.fill()})
 }
 document.getElementById('sketchInfo').textContent=`Points: ${sketchPoints.length} | Snap: 1 mm | ${sketchHover?'Cursor: X '+sketchHover.x+' mm, Z '+sketchHover.z+' mm':'Click on the grid to add points'} | Create requires at least 3 points.`;
}
sketchCanvas.addEventListener('pointermove',e=>{const r=sketchCanvas.getBoundingClientRect();sketchHover=sketchFromScreen(e.clientX-r.left,e.clientY-r.top);sketchRender()});
sketchCanvas.addEventListener('pointerleave',()=>{sketchHover=null;sketchRender()});
sketchCanvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 const r=sketchCanvas.getBoundingClientRect(),p=sketchFromScreen(e.clientX-r.left,e.clientY-r.top);
 if(sketchPoints.length&&sketchPoints.at(-1).x===p.x&&sketchPoints.at(-1).z===p.z)return;
 sketchPoints.push(p);sketchRender()
});
document.getElementById('sketchUndo').onclick=()=>{sketchPoints.pop();sketchRender()};
document.getElementById('sketchClear').onclick=()=>{sketchPoints=[];sketchRender()};
document.getElementById('sketchClose').onclick=()=>sketchOverlay.style.display='none';
document.getElementById('sketchCreate').onclick=()=>{
 if(sketchPoints.length<3){document.getElementById('sketchInfo').textContent='Please add at least 3 different points.';return}
 const height=Number(document.getElementById('sketchHeight').value);
 if(!Number.isFinite(height)||height<=0){document.getElementById('sketchInfo').textContent='Enter a positive height in millimeters.';return}
 const shape=new THREE.Shape();
 shape.moveTo(sketchPoints[0].x,sketchPoints[0].z);
 for(const p of sketchPoints.slice(1))shape.lineTo(p.x,p.z);
 shape.closePath();
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:8});
 geometry.rotateX(-Math.PI/2);
 saveUndo();
 const mesh=new THREE.Mesh(geometry,material());
 mesh.name='Custom shape '+(++seq);
 mesh.userData.shape='customSketch';
 root.add(mesh);placeOnGround(mesh);select(mesh);
 sketchOverlay.style.display='none';
};
const sketchToolButton=document.createElement('button');
sketchToolButton.textContent='✏️ Draw on grid';
sketchToolButton.title='Draw a polygon by clicking grid cells, then extrude it in millimeters';
sketchToolButton.style.cssText='background:#4c477a;color:white;border:1px solid #a99cff;padding:9px 13px;border-radius:7px;margin:5px';
sketchToolButton.onclick=()=>{sketchOverlay.style.display='block';sketchPoints=[];sketchHover=null;requestAnimationFrame(sketchSize)};
document.querySelector('header').appendChild(sketchToolButton);
window.addEventListener('resize',()=>{if(sketchOverlay.style.display!=='none')sketchSize()});



// FEATURE: mirror
// Mirror tools are available only from the object's right-click context menu.
const mirrorSection=document.createElement('section');
mirrorSection.id='mirrorSection';
mirrorSection.style.cssText='border-top:1px solid #50617c;margin-top:10px;padding-top:10px;display:grid;gap:8px';
mirrorSection.innerHTML=`
<strong style="font-size:13px">↔ Mirror object</strong>
<label style="display:grid;gap:4px">Mirror axis
<select id="mirrorAxis" style="width:100%;padding:7px;border-radius:6px"><option value="x">X — left / right</option><option value="y">Y — vertical</option><option value="z">Z — front / back</option></select></label>
<label style="display:grid;gap:4px">Copy offset (mm)
<input id="mirrorOffset" type="number" min="-220" max="220" step="1" value="35" style="width:100%;box-sizing:border-box;padding:7px;border-radius:6px"></label>
<div style="display:flex;gap:6px"><button id="mirrorCopy" type="button">Mirror copy</button><button id="mirrorOriginal" type="button">Mirror selected</button></div>
<small style="opacity:.85">Mirror copy makes a separate mirrored object. Offset moves it along the selected axis. Mirror selected changes the original.</small>`;
document.getElementById('contextMenu').appendChild(mirrorSection);
function updateMirrorPanel(){
 if(!selected)return;
 const size=dimensions(selected);
 const axis=document.getElementById('mirrorAxis').value;
 document.getElementById('mirrorOffset').value=Math.ceil(size[axis]+2);
}
document.getElementById('mirrorAxis').addEventListener('change',updateMirrorPanel);
function mirrorObject(copy){
 if(!selected)return;
 const axis=document.getElementById('mirrorAxis').value;
 const offset=Number(document.getElementById('mirrorOffset').value);
 if(!Number.isFinite(offset))return;
 saveUndo();
 const obj=copy?selected.clone(true):selected;
 if(copy){
  obj.name=selected.name+' mirrored '+axis.toUpperCase();
  root.add(obj);
 }
 // Negative scale mirrors the entire object, including child meshes.
 obj.scale[axis]*=-1;
 if(copy)obj.position[axis]+=offset;
 if(axis==='y'){
  const floor=bottomY(obj);
  obj.position.y-=floor;
 }
 select(obj);hideMenu();refresh();checkBounds();updateEstimate();
}
document.getElementById('mirrorCopy').addEventListener('click',()=>mirrorObject(true));
document.getElementById('mirrorOriginal').addEventListener('click',()=>mirrorObject(false));



// FEATURE: ruler
// Interactive point-to-point ruler: choose any two surface points on any meshes.
const rulerPanel=document.createElement('div');
rulerPanel.style.cssText='position:fixed;right:18px;bottom:18px;z-index:90;background:#17293e;color:#eef6ff;border:1px solid #6c87a8;border-radius:12px;padding:13px;width:290px;font:13px system-ui;box-shadow:0 12px 32px #0009';
rulerPanel.innerHTML=`<strong>📏 Precision ruler</strong><p style="color:#b8cbe0;margin:7px 0">Choose two points on any model surfaces. You can measure between faces of the same or different objects.</p>
<button id="rulerToggle" type="button">Start measuring</button>
<label style="display:flex;align-items:center;gap:6px;margin:8px 0"><input id="rulerVertex" type="checkbox"> Snap to nearest vertex</label>
<div style="display:flex;gap:6px"><button id="rulerUndo" type="button">Undo point</button><button id="rulerClear" type="button">Clear</button></div>
<p id="rulerResult" style="color:#9de3ff;margin:8px 0 0">Click Start measuring.</p>`;
document.body.appendChild(rulerPanel);
const rulerToggle=document.getElementById('rulerToggle');
const rulerResult=document.getElementById('rulerResult');
let rulerActive=false,rulerPoints=[],rulerMarkers=[],rulerLine=null;
const rulerMat=new THREE.MeshBasicMaterial({color:0xffd56e,depthTest:false});
function clearRulerVisual(){
 for(const marker of rulerMarkers){scene.remove(marker);marker.geometry.dispose()}
 rulerMarkers=[];
 if(rulerLine){scene.remove(rulerLine);rulerLine.geometry.dispose();rulerLine=null}
}
function updateRulerVisual(){
 clearRulerVisual();
 for(const p of rulerPoints){
  const marker=new THREE.Mesh(new THREE.SphereGeometry(1.5,12,8),rulerMat);
  marker.position.copy(p);marker.renderOrder=999;scene.add(marker);rulerMarkers.push(marker)
 }
 if(rulerPoints.length===2){
  const geometry=new THREE.BufferGeometry().setFromPoints(rulerPoints);
  rulerLine=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xffd56e,depthTest:false}));
  rulerLine.renderOrder=998;scene.add(rulerLine);
  const a=rulerPoints[0],b=rulerPoints[1];
  rulerResult.textContent=`Distance: ${a.distanceTo(b).toFixed(2)} mm | ΔX ${Math.abs(a.x-b.x).toFixed(2)} · ΔY ${Math.abs(a.y-b.y).toFixed(2)} · ΔZ ${Math.abs(a.z-b.z).toFixed(2)} mm`;
 }else rulerResult.textContent=rulerPoints.length?'Select the second point.':'Select the first point on a model.';
}
function nearestVertex(intersection){
 const mesh=intersection.object,position=mesh.geometry.getAttribute('position');
 if(!position)return intersection.point.clone();
 const face=intersection.face,ids=face?[face.a,face.b,face.c]:[];
 if(!ids.length)return intersection.point.clone();
 let best=null,dist=Infinity;
 for(const id of ids){
  const v=new THREE.Vector3().fromBufferAttribute(position,id).applyMatrix4(mesh.matrixWorld);
  const d=v.distanceToSquared(intersection.point);
  if(d<dist){dist=d;best=v}
 }
 return best||intersection.point.clone();
}
rulerToggle.onclick=()=>{
 rulerActive=!rulerActive;
 rulerToggle.textContent=rulerActive?'Finish measuring':'Start measuring';
 rulerToggle.style.background=rulerActive?'#327d67':'';
 rulerResult.textContent=rulerActive?'Click the first point on any model.':'Measuring paused. Click Start measuring to continue.';
};
document.getElementById('rulerUndo').onclick=()=>{rulerPoints.pop();updateRulerVisual()};
document.getElementById('rulerClear').onclick=()=>{rulerPoints=[];updateRulerVisual()};
canvas.addEventListener('pointerdown',e=>{
 if(!rulerActive||e.button!==0)return;
 e.preventDefault();e.stopImmediatePropagation();
 setPointer(e);
 const intersections=raycaster.intersectObjects(root.children,true);
 if(!intersections.length){rulerResult.textContent='Click a visible surface of an object.';return}
 const hit=intersections[0];
 const point=document.getElementById('rulerVertex').checked?nearestVertex(hit):hit.point.clone();
 if(rulerPoints.length===2)rulerPoints=[];
 rulerPoints.push(point);
 updateRulerVisual();
},true);
canvas.addEventListener('pointermove',e=>{if(rulerActive)canvas.style.cursor='crosshair'},true);
canvas.addEventListener('contextmenu',e=>{if(rulerActive){e.preventDefault();e.stopImmediatePropagation()}},true);



// FEATURE: chamfer
const roundedPanel=document.createElement('section');
roundedPanel.innerHTML='<strong>Rounded box</strong><div class="tool-fields"><label>X (mm)<input id="roundX" type="number" min="1" value="40"></label><label>Y (mm)<input id="roundY" type="number" min="1" value="25"></label><label>Z (mm)<input id="roundZ" type="number" min="1" value="30"></label><label>Radius (mm)<input id="roundR" type="number" min=".1" step=".5" value="3"></label></div><button id="roundCreate">Create rounded box</button>';
document.body.appendChild(roundedPanel);
document.getElementById('roundCreate').onclick=()=>{
 const width=Number(document.getElementById('roundX').value),height=Number(document.getElementById('roundY').value),depth=Number(document.getElementById('roundZ').value),r=Number(document.getElementById('roundR').value);
 if([width,height,depth,r].some(v=>!Number.isFinite(v)||v<=0)||r>=Math.min(width,height,depth)/2){alert('Enter valid dimensions and a radius smaller than half the shortest dimension.');return}
 const shape=new THREE.Shape(),x=-width/2,y=-depth/2,w=width,d=depth;
 shape.moveTo(x+r,y);shape.lineTo(x+w-r,y);shape.quadraticCurveTo(x+w,y,x+w,y+r);shape.lineTo(x+w,y+d-r);shape.quadraticCurveTo(x+w,y+d,x+w-r,y+d);shape.lineTo(x+r,y+d);shape.quadraticCurveTo(x,y+d,x,y+d-r);shape.lineTo(x,y+r);shape.quadraticCurveTo(x,y,x+r,y);
 const geo=new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,curveSegments:10});geo.rotateX(-Math.PI/2);
 saveUndo();const obj=new THREE.Mesh(geo,material());obj.name='Rounded box '+(++seq);root.add(obj);placeOnGround(obj);select(obj);
};

// FEATURE: check
const printCheckToolButton=document.createElement('button');
printCheckToolButton.textContent='Print check';
printCheckToolButton.title='Проверяет выход за область печати и минимальную толщину по габаритам.';
printCheckToolButton.style.cssText='background:#4c477a;color:white;border:1px solid #a99cff;padding:9px 13px;border-radius:7px;margin:5px';
printCheckToolButton.onclick=()=>{try{
if(!root.children.length)return alert('Нет объектов');
const warnings=[];
root.children.forEach(o=>{const b=new THREE.Box3().setFromObject(o),d=b.getSize(new THREE.Vector3());
if(b.min.x< -printerProfile.width/2||b.max.x>printerProfile.width/2||b.min.z< -printerProfile.depth/2||b.max.z>printerProfile.depth/2||b.min.y<-.02||b.max.y>printerProfile.height)warnings.push(o.name+': выходит за пределы 220 мм');
if(Math.min(d.x,d.y,d.z)<.8)warnings.push(o.name+': размер меньше 0.8 мм');
});
alert(warnings.length?warnings.join('\\n'):'По базовым проверкам проблем не найдено. Проверьте STL в слайсере: это не проверка замкнутости сетки.');
}catch(err){console.error(err);alert('Ошибка тестовой функции: '+err.message)}};
document.querySelector('header').appendChild(printCheckToolButton);


const specialPanel=document.createElement('div');
specialPanel.id='specialToolsPanel';
specialPanel.innerHTML='<strong>🧰 Special Tools</strong><small>Experimental tools — test on copies of your projects.</small><div id="specialToolButtons"></div>';
const specialToggle=document.createElement('button');
specialToggle.id='specialToolsToggle';specialToggle.textContent='🧰 Special Tools';
specialToggle.type='button';
specialToggle.addEventListener('click',()=>specialPanel.classList.toggle('open'));
document.body.append(specialToggle,specialPanel);
const buttons=document.getElementById('specialToolButtons');
for(const label of ['Draw on grid','Rounded box','Print check']){
 const btn=[...document.querySelectorAll('header button')].find(b=>b.textContent.includes(label));
 if(btn)buttons.appendChild(btn);
}
const sketchButton=[...document.querySelectorAll('header button')].find(b=>b.textContent.includes('Draw on grid'));
if(sketchButton)sketchButton.textContent='✏ Draw contour';
const holeTools=document.getElementById('holeTools');
if(holeTools){holeTools.style.position='static';holeTools.style.width='auto';holeTools.style.maxWidth='none';holeTools.style.boxShadow='none';buttons.appendChild(holeTools)}
if(rulerPanel){rulerPanel.style.position='static';rulerPanel.style.width='auto';rulerPanel.style.boxShadow='none';buttons.appendChild(rulerPanel)}
buttons.appendChild(roundedPanel);

window.addEventListener('studio-language-changed',()=>{checkBounds()});


// Integrated tool UI. Main modeling scene remains active when panels are opened.
const proTools = [
 ['Shell','01-shell.html','Create a solid or hollow box. Hollow geometry is experimental; check STL in a slicer.'],
 ['Smart Pattern','02-pattern.html','Select a mesh and create linear or circular copies. Copies are not automatically merged.'],
 ['Face Sketch','03-face-sketch.html','Pick a flat face and add a rectangular boss. The boss is a separate object.'],
 ['Smart Dimensions','04-smart-dimensions.html','Create a formula-driven box. This is not a full constraint solver.'],
 ['Thread Generator','05-thread.html','Create a helical ridge. Thread geometry is not standardised for fitting.'],
 ['Loft','06-loft.html','Create a transition between a rectangular and a circular profile.'],
 ['Sweep','07-sweep.html','Create a tube along a predefined curved path.'],
 ['Assembly Tools','08-assembly.html','Check bounding-box collisions and centre objects. Not a physical simulation.'],
 ['Design History','10-history.html','Save and restore temporary scene snapshots. Not a parametric feature tree.']
];
const toolButtons=document.getElementById('proToolsButtons');
const toolDock=document.getElementById('proToolDock');
const toolFrame=document.getElementById('proToolFrame');
const toolGuide=document.getElementById('toolGuideDialog');
proTools.forEach(([title,file,guide])=>{
 const button=document.createElement('button');button.textContent=title;button.type='button';
 button.title='Left-click: open preview. Right-click: guide.';
 button.addEventListener('click',()=>{
  document.getElementById('proToolTitle').textContent=title+' — experimental preview';
  toolFrame.src='./pro-tools/'+file;toolDock.hidden=false;
 });
 button.addEventListener('contextmenu',e=>{
  e.preventDefault();document.getElementById('toolGuideTitle').textContent=title;
  document.getElementById('toolGuideText').textContent=guide;
  if(!toolGuide.open)toolGuide.showModal();
 });
 toolButtons.appendChild(button);
});
document.getElementById('closeProTool').addEventListener('click',()=>{toolDock.hidden=true;toolFrame.src='about:blank'});
// Overlay is deliberately outside the editable root, so it never becomes part of STL exports.
const supportOverlay=new THREE.Group();scene.add(supportOverlay);
const supportMaterial=new THREE.MeshBasicMaterial({color:0xff3356,side:THREE.DoubleSide,transparent:true,opacity:.72,depthTest:false});
let supportActive=false, supportSignature='',supportLast=0;
function clearSupportOverlay(){
 for(const item of [...supportOverlay.children]){supportOverlay.remove(item);item.geometry.dispose()}
}
function supportSceneSignature(){
 root.updateMatrixWorld(true);
 const parts=[];
 root.traverse(o=>{if(o.isMesh)parts.push(o.uuid+':'+o.matrixWorld.elements.map(n=>n.toFixed(2)).join(',')+':'+o.geometry.uuid)});
 return parts.join('|');
}
function updateSupportOverlay(){
 clearSupportOverlay();
 const threshold=Number(document.getElementById('supportAngle').value);
 if(!(threshold>=5&&threshold<=85))return;
 const solids=[];root.traverse(o=>{if(o.isMesh&&o.visible)solids.push(o)});
 const boxes=solids.map(o=>({o,b:new THREE.Box3().setFromObject(o)}));
 const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),verts=[];
 const tolerance=.3;
 for(const mesh of solids){
  const geom=mesh.geometry,positions=geom?.getAttribute('position');if(!positions)continue;
  const indices=geom.index,total=indices?indices.count:positions.count;
  const sampleEvery=Math.max(1,Math.ceil(total/3/8000));
  for(let i=0;i+2<total;i+=3*sampleEvery){
   const points=[i,i+1,i+2].map(k=>new THREE.Vector3().fromBufferAttribute(positions,indices?indices.getX(k):k).applyMatrix4(mesh.matrixWorld));
   const [a,b,c]=points;
   const normal=b.clone().sub(a).cross(c.clone().sub(a));
   if(normal.lengthSq()<1e-10)continue;
   normal.normalize();
   if(normal.y>=-.0001)continue;
   const angle=Math.acos(THREE.MathUtils.clamp(-normal.y,-1,1))*180/Math.PI;
   if(angle>=threshold)continue;
   const samples=[a.clone().add(b).add(c).multiplyScalar(1/3),
     a.clone().multiplyScalar(.6).addScaledVector(b,.2).addScaledVector(c,.2),
     b.clone().multiplyScalar(.6).addScaledVector(a,.2).addScaledVector(c,.2),
     c.clone().multiplyScalar(.6).addScaledVector(a,.2).addScaledVector(b,.2)];
   let supported=0;
   for(const pt of samples){
    if(pt.y<=tolerance){supported++;continue}
    let contact=false;
    for(const entry of boxes){
     if(entry.o===mesh||entry.o.geometry?.type!=='BoxGeometry')continue;
     const e=entry.o.rotation;if(Math.abs(e.x)+Math.abs(e.y)+Math.abs(e.z)>.001)continue;
     const bb=entry.b;
     if(pt.x>=bb.min.x-.05&&pt.x<=bb.max.x+.05&&pt.z>=bb.min.z-.05&&pt.z<=bb.max.z+.05&&
       ((bb.max.y<=pt.y+.05&&pt.y-bb.max.y<=tolerance+.05)||(pt.y>=bb.min.y-.05&&pt.y<=bb.max.y+.05))){
       contact=true;break;
     }
    }
    if(!contact){
     ray.set(pt.clone().addScaledVector(down,.07),down);ray.near=0;ray.far=pt.y+1;
     for(const other of solids){
      if(other===mesh)continue;
      // Double-sided test without mutating original materials.
      const previous=other.material,materials=Array.isArray(previous)?previous:[previous],sides=materials.map(m=>m.side);
      try{
       materials.forEach(m=>m.side=THREE.DoubleSide);
       const hit=ray.intersectObject(other,true)[0];
       if(hit&&hit.distance+.07<=tolerance+.1){contact=true;break}
      }finally{materials.forEach((m,j)=>m.side=sides[j])}
     }
    }
    if(contact)supported++;
   }
   if(supported<3)verts.push(...a.toArray(),...b.toArray(),...c.toArray());
  }
 }
 if(verts.length){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  const highlight=new THREE.Mesh(geometry,supportMaterial);highlight.renderOrder=900;supportOverlay.add(highlight);
 }
 supportSignature=supportSceneSignature();
}
document.getElementById('analyzeSupport').addEventListener('click',()=>{supportActive=true;updateSupportOverlay()});
document.getElementById('clearSupport').addEventListener('click',()=>{supportActive=false;clearSupportOverlay()});
document.getElementById('supportAngle').addEventListener('change',()=>{if(supportActive)updateSupportOverlay()});
function supportWatcher(now){
 if(supportActive&&now-supportLast>550){
  supportLast=now;
  if(supportSceneSignature()!==supportSignature)updateSupportOverlay();
 }
 requestAnimationFrame(supportWatcher);
}
requestAnimationFrame(supportWatcher);
