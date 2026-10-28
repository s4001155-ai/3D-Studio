(()=>{
"use strict";
const translations={"Язык": ["Language", "语言"], "Ваши проекты — создавайте, сохраняйте и возвращайтесь к работе.": ["Your projects — create, save and continue working.", "您的项目——创建、保存并继续工作。"], "＋ Новый проект": ["＋ New project", "＋ 新建项目"], "⬆ Открыть файл проекта": ["⬆ Import project file", "⬆ 导入项目文件"], "Сохранённые проекты": ["Saved projects", "已保存的项目"], "Название проекта": ["Project name", "项目名称"], "Новый проект": ["New project", "新项目"], "⌂ Проекты": ["⌂ Projects", "⌂ 项目"], "💾 Сохранить": ["💾 Save", "💾 保存"], "⬇ Файл проекта": ["⬇ Project file", "⬇ 项目文件"], "+ Куб": ["+ Cube", "+ 立方体"], "+ Сфера": ["+ Sphere", "+ 球体"], "+ Цилиндр": ["+ Cylinder", "+ 圆柱体"], "+ Конус": ["+ Cone", "+ 圆锥体"], "🐈 Кошка": ["🐈 Cat", "🐈 猫"], "⧉ Дублировать": ["⧉ Duplicate", "⧉ 复制"], "↶ Отменить": ["↶ Undo", "↶ 撤销"], "◎ Центрировать объект": ["◎ Centre object", "◎ 居中对象"], "⌖ Вид": ["⌖ View", "⌖ 视图"], "⬇ Экспорт STL": ["⬇ Export STL", "⬇ 导出 STL"], "Объекты": ["Objects", "对象"], "⏱ Оценка времени печати": ["⏱ Estimated print time", "⏱ 预计打印时间"], "Все объекты на платформе": ["All objects on the bed", "平台上的所有对象"], "Заполнение крест-накрест, %": ["Grid infill, %", "网格填充率 %"], "Количество стенок (периметров)": ["Wall count (perimeters)", "壁层数"], "Удалить выбранный": ["Delete selected", "删除选中项"], "Очистить сцену": ["Clear scene", "清空场景"], "🎨 Оформление и удобство": ["🎨 Appearance & usability", "🎨 外观与使用"], "Тема интерфейса": ["Interface theme", "界面主题"], "Тёмная": ["Dark", "深色"], "Светлая": ["Light", "浅色"], "Океан": ["Ocean", "海洋"], "Лес": ["Forest", "森林"], "Фиолетовая": ["Purple", "紫色"], "Акцентный цвет": ["Accent colour", "强调色"], "Цвет новых фигур": ["New shape colour", "新图形颜色"], "Цвет сетки": ["Grid colour", "网格颜色"], "Цвет границы печати": ["Print boundary colour", "打印边界颜色"], "Показывать сетку": ["Show grid", "显示网格"], "Размер клетки сетки": ["Grid cell size", "网格单元大小"], "1 мм — точная": ["1 mm — fine", "1 毫米 — 精细"], "20 мм — крупная": ["20 mm — coarse", "20 毫米 — 粗略"], "Свой размер…": ["Custom size…", "自定义大小…"], "Показывать оси XYZ": ["Show XYZ axes", "显示 XYZ 轴"], "Показывать границы печати": ["Show print boundaries", "显示打印边界"], "Показывать каркас фигур": ["Show wireframe", "显示线框"], "↶ Сбросить оформление": ["↶ Reset appearance", "↶ 重置外观"], "Параметры объекта": ["Object properties", "对象属性"], "Название": ["Name", "名称"], "Положение объекта (мм)": ["Object position (mm)", "对象位置（毫米）"], "Перемещение по сетке (1 нажатие = 1 мм)": ["Grid movement (1 click = 1 mm)", "网格移动（每次点击 1 毫米）"], "Габариты XYZ (мм)": ["Dimensions XYZ (mm)", "尺寸 XYZ（毫米）"], "Поворот XYZ (°)": ["Rotation XYZ (°)", "旋转 XYZ（度）"], "Цвет": ["Colour", "颜色"], "Закрыть": ["Close", "关闭"], "Сброс поворота": ["Reset rotation", "重置旋转"], "🗑 Удалить": ["🗑 Delete", "🗑 删除"], "⧉ Копия": ["⧉ Copy", "⧉ 复制"], "Открыть": ["Open", "打开"], "Переименовать": ["Rename", "重命名"], "Удалить": ["Delete", "删除"], "Да, удалить": ["Yes, delete", "确认删除"], "Отмена": ["Cancel", "取消"], "Нет объектов": ["No objects", "没有对象"], "Автосохранение включено": ["Autosave enabled", "已启用自动保存"], "Куб": ["Cube", "立方体"], "Сфера": ["Sphere", "球体"], "Цилиндр": ["Cylinder", "圆柱体"], "Конус": ["Cone", "圆锥体"], "Пирамида": ["Pyramid", "金字塔"], "Крыша": ["Roof", "屋顶"], "Клин": ["Wedge", "楔形"], "Полусфера": ["Hemisphere", "半球"], "Тор": ["Torus", "圆环"], "Гранёный тор": ["Faceted torus", "多面圆环"], "Ромб": ["Diamond", "菱形"], "Суженный цилиндр": ["Tapered cylinder", "锥形圆柱"], "Текст": ["Text", "文字"], "Создать фигуру": ["Create shape", "创建形状"], "＋ Создать фигуру": ["＋ Create shape", "＋ 创建形状"], "Настройки интерфейса": ["Interface settings", "界面设置"], "⚙ Настройки интерфейса": ["⚙ Interface settings", "⚙ 界面设置"]};

Object.assign(translations,{"3D-принтер и материал": ["3D printer & material", "3D打印机和材料"], "🖨 3D-принтер и материал": ["🖨 3D printer & material", "🖨 3D打印机和材料"], "Производитель": ["Manufacturer", "制造商"], "Модель принтера": ["Printer model", "打印机型号"], "Филамент": ["Filament", "耗材"], "Очистить сцену": ["Clear scene", "清空场景"], "Габариты X / Y / Z (мм) — длина, высота, глубина": ["Dimensions X / Y / Z (mm) — width, height, depth", "X / Y / Z 尺寸（毫米）"], "Поворот X / Y / Z (градусы)": ["Rotation X / Y / Z (degrees)", "X / Y / Z 旋转（度）"], "Цвет просмотра": ["Preview colour", "预览颜色"], "Поворот по осям, °": ["Rotate by axis, °", "按轴旋转，°"], "Объект": ["Object", "对象"], "Треугольная призма (крыша)": ["Triangular prism (roof)", "三棱柱（屋顶）"], "Половина крыши (клин)": ["Half roof (wedge)", "半屋顶（楔形）"], "Тор (пончик)": ["Torus (donut)", "圆环"], "Ромбовидная фигура": ["Diamond shape", "菱形体"], "Конический цилиндр": ["Tapered cylinder", "锥形圆柱"], "Область печати:": ["Build volume:", "打印区域："], "Платформа:": ["Build plate:", "打印平台："], "Шаг сетки:": ["Grid step:", "网格步长："], "высота:": ["height:", "高度："], "При выходе за границы появится предупреждение.": ["A warning appears when an object exceeds the build volume.", "超出打印范围时会显示警告。"], "Калибровано по 5 моделям Flashforge Adventurer 5M. Приблизительно: PETG 1,75 мм, сопло 0,4 мм, слой 0,20 мм (первый 0,30 мм), стенки и верх/низ, решётчатое заполнение. Учитываются скорости из ваших настроек с поправкой на ускорения и перемещения. Для точного времени нужен слайсинг.": ["Calibrated against five Flashforge Adventurer 5M models. Approximate estimate for PETG 1.75 mm, 0.4 mm nozzle, 0.20 mm layers (first layer 0.30 mm), walls, top/bottom layers and grid infill. Actual print time requires slicing.", "根据五个 Flashforge Adventurer 5M 模型校准。PETG 1.75 毫米、0.4 毫米喷嘴、0.20 毫米层高的近似估算。准确时间需使用切片软件。"], "Нажмите левой кнопкой на предмет, чтобы выбрать и перетащить его. Правая кнопка открывает меню поворота, копирования и удаления. Перетаскивайте мышью — предмет переместится. Перетаскивание пустого места вращает вид. Колесо — масштаб.": ["Left-click an object to select and drag it. Right-click for rotation, duplication and deletion. Drag empty space to orbit the camera; scroll to zoom.", "左键选择并拖动物体，右键打开旋转、复制和删除菜单。拖动空白区域旋转视角，滚轮缩放。"], "Проекты сохраняются в этом браузере. Для переноса на другой компьютер используйте «Скачать проект».": ["Projects are stored in this browser. Download project files to transfer them to another computer.", "项目保存在当前浏览器中。下载项目文件可迁移到其他电脑。"], "Свой размер клетки, мм": ["Custom grid size, mm", "自定义网格大小（毫米）"], "Нажатие — 1 мм. Удерживайте кнопку для непрерывного перемещения по одной оси.": ["Click to move 1 mm. Hold for continuous movement along one axis.", "单击移动 1 毫米，长按沿单轴连续移动。"], "Сохранено": ["Saved", "已保存"], "Автосохранение включено": ["Autosave enabled", "已启用自动保存"], "Все объекты на платформе": ["All objects on the bed", "平台上的所有对象"], "Положение XYZ (мм)": ["Position XYZ (mm)", "位置 XYZ（毫米）"], "Габариты XYZ (мм)": ["Dimensions XYZ (mm)", "尺寸 XYZ（毫米）"], "Поворот XYZ (°)": ["Rotation XYZ (°)", "旋转 XYZ（度）"], "↔ Перемещение по сетке ▾": ["↔ Move on grid ▾", "↔ 网格移动 ▾"], "＋ Создать фигуру": ["＋ Create shape", "＋ 创建形状"], "Время печати": ["Print time", "打印时间"], "⚙ Настройки интерфейса": ["⚙ Interface settings", "⚙ 界面设置"]});
Object.assign(translations,{"Шар": ["Sphere", "球体"], "Кошка": ["Cat", "猫"], "12 мин": ["12 min", "12 分钟"], "Пока нет сохранённых проектов.": ["No saved projects yet.", "暂无已保存的项目。"], "При выборе темы цвета сетки и границы подбираются автоматически. Их можно изменить вручную.": ["Grid and boundary colours adapt to the selected theme. You can customise them manually.", "网格和边界颜色会随主题自动调整，也可手动更改。"], "Шаг кнопок перемещения остаётся 1 мм независимо от размера клетки.": ["Movement buttons always move 1 mm, regardless of grid cell size.", "无论网格大小，移动按钮每次移动 1 毫米。"], "Настройки сохраняются в браузере на этом компьютере. Цвет фигуры не сохраняется в STL.": ["Settings are saved in this browser. Object colours are not included in STL files.", "设置保存在浏览器中。STL 文件不包含物体颜色。"], "Один щелчок — 1 мм; удержание — непрерывное движение по одной оси.": ["One click moves 1 mm; hold to move continuously along one axis.", "单击移动 1 毫米；长按沿单轴连续移动。"], "Новый проект": ["New project", "新项目"], "Калибровано по 5 моделям Flashforge Adventurer 5M.": ["Calibrated using five Flashforge Adventurer 5M models.", "根据五个 Flashforge Adventurer 5M 模型校准。"]});
const originals=new WeakMap();
const choice=document.getElementById('uiLanguage');
if(!choice)return;
let lang='en';
try{lang=localStorage.getItem('3dstudio.ui.language')||'en'}catch{}
if(!['ru','en','zh'].includes(lang))lang='en';
choice.value=lang;
const settingsChoice=document.getElementById('settingsLanguage');
if(settingsChoice)settingsChoice.value=lang;

const reverse=new Map();
for(const [ru,translationsForKey] of Object.entries(translations)){
 reverse.set(ru,ru);
 for(const translated of translationsForKey)reverse.set(translated,ru);
}
const dynamic=[
 [/^(\d+(?:[.,]\d+)?)\s*мин$/,'$1 min','$1 分钟'],
 [/^(\d+)\s*ч\s*(\d+)\s*мин$/,'$1 h $2 min','$1 小时 $2 分钟'],
 [/^Пока нет сохранённых проектов\.$/,'No saved projects yet.','暂无已保存的项目。']
];
function translate(original){
 const canonical=reverse.get(original)||original;
 if(translations[canonical])return lang==='ru'?canonical:translations[canonical][lang==='en'?0:1];
 if(lang==='ru')return canonical;
 for(const [pattern,en,zh] of dynamic)if(pattern.test(canonical))return canonical.replace(pattern,lang==='en'?en:zh);
 let value=canonical;
 const parts=[
  ['Область печати:','Build volume:','打印区域：'],
  ['Платформа:','Build plate:','打印平台：'],
  ['Шаг сетки:','Grid step:','网格步长：'],
  ['высота:','height:','高度：'],
  ['При выходе за границы появится предупреждение.','A warning appears when an object exceeds the build volume.','超出打印范围时会显示警告。'],
  ['PETG на 5M: калибровка по 5 моделям.','PETG on 5M: calibrated against 5 models.','5M PETG：已根据五个模型校准。'],
  ['Все объекты на платформе','All objects on the bed','平台上的所有对象'],
  ['Выбран:','Selected:','已选中：'],
  ['Нет объектов','No objects','没有对象'],
  ['Сохранено','Saved','已保存'],
  ['Куб ','Cube ','立方体 '],
  ['Сфера ','Sphere ','球体 '],
  ['Цилиндр ','Cylinder ','圆柱体 '],
  ['Конус ','Cone ','圆锥体 ']
 ];
 for(const [ru,en,zh] of parts)value=value.replaceAll(ru,lang==='en'?en:zh);
 return value;
}
const internalWrites=new WeakSet();
function translateNode(node){
 if(node.nodeType!==Node.TEXT_NODE)return;
 const parent=node.parentElement;
 if(!parent||parent.closest('script,style,textarea,#projectList .project-info'))return;
 const current=node.nodeValue;
 if(!current.trim())return;
 let original=originals.get(node);
 if(original===undefined){original=current;originals.set(node,original)}
 const output=translate(original);
 if(current!==output){
  internalWrites.add(node);
  node.nodeValue=output;
 }
}
function walk(root){
 if(!root)return;
 if(root.nodeType===Node.TEXT_NODE){translateNode(root);return}
 if(root.nodeType!==Node.ELEMENT_NODE)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 while(walker.nextNode())translateNode(walker.currentNode);
 for(const input of root.querySelectorAll('input[placeholder]')){
  if(!input.dataset.ruPlaceholder)input.dataset.ruPlaceholder=input.placeholder;
  input.placeholder=translate(input.dataset.ruPlaceholder);
 }
}
function update(){
 document.documentElement.lang=lang;
 walk(document.body);
 const settingsLabel=document.getElementById('settingsLanguageLabel');
 if(settingsLabel)settingsLabel.textContent=lang==='ru'?'Язык интерфейса':lang==='en'?'Interface language':'界面语言';
 const label=document.getElementById('languageLabel');
 if(label)label.textContent=lang==='ru'?'Язык':lang==='en'?'Language':'语言';
}
if(settingsChoice)settingsChoice.addEventListener('change',()=>{
 choice.value=settingsChoice.value;
 choice.dispatchEvent(new Event('change',{bubbles:true}));
});
choice.addEventListener('change',()=>{
 lang=choice.value;
 if(settingsChoice)settingsChoice.value=lang;
 try{localStorage.setItem('3dstudio.ui.language',lang)}catch{}
 update();
 // Update dynamic messages that are not ordinary static text nodes.
 window.dispatchEvent(new Event('studio-language-changed'));
});
const observer=new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='characterData'){
   const node=record.target;
   if(internalWrites.has(node)){internalWrites.delete(node);continue}
   originals.set(node,node.nodeValue);
   translateNode(node);
  }
  for(const node of record.addedNodes)walk(node);
 }
});
observer.observe(document.body,{subtree:true,childList:true,characterData:true});
update();
})();
