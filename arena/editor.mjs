import {project,templates,ratios,animations,layer,validate,draw,dimensions} from './motion.mjs?v=2';
import {save,get} from './persistence.mjs?v=2';
import {availableFormats,download,renderVideo,imageMap} from './export.mjs?v=2';
import {$,$$,tr,escape as e,choice,label,action,toast,err} from './ui.mjs?v=2';
const text=(key,value,max=120)=>'<input data-key="'+key+'" value="'+e(value)+'" maxlength="'+max+'">';
const number=(key,value,min,max,step=1)=>'<input type="number" data-key="'+key+'" min="'+min+'" max="'+max+'" step="'+step+'" value="'+value+'">';
const select=(key,options,value)=>'<select data-key="'+key+'">'+options.map(([v,n])=>choice(v,n,value)).join('')+'</select>';
const color=(key,value)=>'<input type="color" data-key="'+key+'" value="'+value+'">';
export async function editor(root,id,template) {
  const stored=id?await get(id):null;
  if(id&&!stored)throw Error(tr('المشروع غير موجود على هذا الجهاز','Project not found on this device'));
  let p=stored?validate(stored):project(template,tr('ar','en'));
  let selected=p.layers[0]?.id;
  let frame=0,playing=false,loop=true,handle,started=0,anchor=0,timer,controller;
  let images=new Map(), disposed=false;
  const undo=[],redo=[];
  root.innerHTML='<div class="editor"><div class="toolbar row space"><div class="row">'+label(tr('اسم المشروع','Project name'),text('name',p.name))+
    action('undo',tr('تراجع','Undo'))+action('redo',tr('إعادة','Redo'))+action('save',tr('حفظ','Save'))+'</div><div class="row"><span id="save-state" class="muted" role="status"></span>'+action('export',tr('تصدير','Export'),true)+'</div></div>'+
    '<div class="workspace"><aside class="panel stack" id="layers"></aside><section class="panel stage"><canvas id="stage" role="img" aria-label="'+tr('معاينة الفيديو','Video preview')+'"></canvas><div class="row space">'+
    '<div class="row">'+action('play',tr('تشغيل','Play'))+action('restart',tr('من البداية','Restart'))+action('loop',tr('تكرار','Loop'))+'</div><output id="time" class="time"></output></div></section><aside class="panel stack" id="inspector"></aside></div>'+
    '<section class="panel timeline"><div class="row space"><h3>'+tr('الخط الزمني','Timeline')+'</h3><div id="duration"></div></div><input id="seek" aria-label="'+tr('موضع التشغيل','Playhead')+'" type="range" min="0" value="0"><div id="tracks"></div></section></div>';
  const canvas=$('#stage'),ctx=canvas.getContext('2d',{alpha:false});
  const current=()=>p.layers.find(item=>item.id===selected);
  const length=()=>Math.ceil(p.duration*p.fps);
  let activeMedia=0;
  async function media() {
    const version=++activeMedia;
    const next=await imageMap(p);
    if(!disposed&&version===activeMedia){images=next;paint();}
  }
  function paint() {
    const [w,h]=dimensions(p.ratio,540);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    frame=Math.max(0,Math.min(length()-1,frame));
    draw(ctx,p,frame,images);
    $('#seek').max=length()-1;$('#seek').value=frame;
    $('#time').textContent=(frame/p.fps).toFixed(2)+' / '+p.duration.toFixed(2)+' s · '+frame+' f';
  }
  async function persist(show=false) {
    clearTimeout(timer);timer=undefined;
    const snapshot=structuredClone(p);
    try{
      await save(snapshot);
      if(!disposed){$('#save-state').textContent=tr('محفوظ محليًا','Saved locally');if(show)toast(tr('تم حفظ المشروع','Project saved'));}
    }catch(e){if(!disposed){$('#save-state').textContent=tr('تعذّر الحفظ','Save failed');err(e);}}
  }
  function changed(){
    $('#save-state').textContent=tr('جارٍ الحفظ…','Saving…');
    clearTimeout(timer);timer=setTimeout(()=>persist(),450);
  }
  function update(change,refresh=true){
    undo.push(structuredClone(p));if(undo.length>25)undo.shift();
    redo.length=0;change();p.updated=Date.now();changed();if(refresh)panels();paint();
  }
  function history(from,to) {
    if(!from.length)return;
    to.push(structuredClone(p));p=from.pop();
    if(!current())selected=p.layers[0]?.id;
    panels();paint();media().catch(err);changed();
  }
  function panels() {
    const l=current();
    const localizedType={text:tr('نص','Text'),shape:tr('شكل','Shape'),image:tr('صورة','Image')};
    const layerName=x=>x.type==='shape'?localizedType.shape:(x.text||localizedType[x.type]);
    $('.toolbar input').value=p.name;
    $('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;
    $('#layers').innerHTML='<h3>'+tr('الطبقات','Layers')+'</h3>'+
      p.layers.slice().reverse().map(x=>'<button class="layer" type="button" data-select="'+e(x.id)+'" aria-pressed="'+(x===l)+'">'+e(layerName(x))+'</button>').join('')+
      '<div class="row">'+action('add-text',tr('+ نص','+ Text'))+action('add-shape',tr('+ شكل','+ Shape'))+action('add-image',tr('+ صورة','+ Image'))+
      '</div><input id="upload-image" type="file" accept="image/png,image/jpeg,image/webp" hidden>';
    $('#inspector').innerHTML='<h3>'+tr('خصائص المشروع','Project settings')+'</h3><div class="cols">'+
      label(tr('الأبعاد','Aspect'),select('ratio',Object.keys(ratios).map(x=>[x,x]),p.ratio))+
      label('FPS',select('fps',[24,30,60].map(x=>[x,x]),p.fps))+
      label(tr('الخلفية','Background'),color('background',p.background))+label(tr('اللون المميز','Accent'),color('accent',p.accent))+'</div>'+
      (l?'<h3>'+tr('خصائص الطبقة','Layer properties')+'</h3><div class="row">'+action('above',tr('أمام','Forward'))+action('below',tr('خلف','Backward'))+
      action('duplicate',tr('نسخ','Duplicate'))+action('delete',tr('حذف','Delete'))+'</div>'+
      '<label><input data-layer="hidden" type="checkbox" '+(l.hidden?'checked':'')+'>'+tr('إخفاء','Hide')+'</label>'+
      '<label><input data-layer="locked" type="checkbox" '+(l.locked?'checked':'')+'>'+tr('قفل','Lock')+'</label>'+
      (l.locked?'':(l.type==='shape'?label(tr('الشكل','Shape'),select('text',[['rectangle',tr('مستطيل','Rectangle')],['circle',tr('دائرة','Circle')],['triangle',tr('مثلث','Triangle')]],l.text)):
        label(l.type==='text'?tr('النص','Text'):tr('اسم الصورة','Image name'),'<textarea data-key="text" maxlength="240" rows="2" dir="auto">'+e(l.text)+'</textarea>'))+
      label(tr('الحركة','Animation'),select('animation',animations.map((name,i)=>[name,tr(['ثابت','تلاشي','انزلاق','تكبير','ارتداد','دوران','كشف','نبض'][i],name)]),l.animation))+
      '<div class="cols">'+label('X',number('x',l.x,-100,200))+label('Y',number('y',l.y,-100,200))+
      label(tr('الحجم','Size'),number('size',l.size,1,150))+label(tr('الدوران','Rotation'),number('rotation',l.rotation,-360,360))+
      label(tr('الشفافية','Opacity'),number('opacity',l.opacity,0,100))+label(tr('اللون','Color'),color('color',l.color))+
      label(tr('بداية (ث)','Start (s)'),number('start',l.start,0,l.end,.01))+label(tr('نهاية (ث)','End (s)'),number('end',l.end,l.start,p.duration,.01))+'</div>'):'');
    $('#duration').innerHTML=label(tr('المدة (ث)','Duration (s)'),number('duration',p.duration,3,30,.01));
    $('#tracks').innerHTML=p.layers.slice().reverse().map(x=>'<div class="track"><button data-select="'+e(x.id)+'" type="button">'+e(layerName(x))+'</button><div class="rail"><span data-track="'+e(x.id)+'" style="left:'+100*x.start/p.duration+'%;width:'+100*(x.end-x.start)/p.duration+'%"></span></div></div>').join('');
  }
  function add(item) {
    if(p.layers.length>=24){toast(tr('الحد الأقصى 24 طبقة','Maximum 24 layers'));return;}
    update(()=>{p.layers.push(item);selected=item.id;});
  }
  const onChange=event=>{
    const target=event.target;
    if(target.id==='upload-image'){
      const file=target.files[0];if(!file)return;
      if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2_000_000){toast(tr('اختر PNG أو JPEG أو WebP بحجم لا يتجاوز 2 ميجابايت','Choose PNG, JPEG or WebP up to 2 MB'));return;}
      const reader=new FileReader();
      reader.onload=async()=>{
        try{
          const item=layer('image',file.name.slice(0,240),'#ffffff',p.duration);item.asset=reader.result;item.size=60;
          await imageMap({layers:[item]});if(disposed)return;add(item);await media();
        }catch(e){err(e);}
      };
      reader.onerror=()=>err(reader.error);reader.readAsDataURL(file);return;
    }
    const key=target.dataset.key??target.dataset.layer;
    if(!key)return;
    const value=target.type==='number'?target.valueAsNumber:target.type==='checkbox'?target.checked:key==='fps'?Number(target.value):target.value;
    if(target.type==='number'&&!target.validity.valid){panels();return;}
    const targetLayer=current();
    update(()=>{
      if(Object.hasOwn(p,key)){
        p[key]=value;
        if(key==='duration')p.layers.forEach(x=>{x.start=Math.min(x.start,value);x.end=Math.min(x.end,value);});
      }else if(targetLayer)targetLayer[key]=value;
    });
  };
  function animate(now) {
    frame=anchor+Math.floor((now-started)*p.fps/1000);
    if(frame>=length()){
      if(loop){started=now;anchor=0;frame=0;}
      else{frame=length()-1;setPlaying(false);}
    }
    paint();if(playing)handle=requestAnimationFrame(animate);
  }
  function setPlaying(value) {
    playing=value;cancelAnimationFrame(handle);
    $('#play').textContent=playing?tr('إيقاف مؤقت','Pause'):tr('تشغيل','Play');
    if(playing){anchor=frame>=length()-1?0:frame;started=performance.now();handle=requestAnimationFrame(animate);}
  }
  const controls={
    undo:()=>history(undo,redo),redo:()=>history(redo,undo),save:()=>persist(true),
    play:()=>setPlaying(!playing),restart:()=>{frame=0;setPlaying(playing);paint();},
    loop:()=>{loop=!loop;$('#loop').setAttribute('aria-pressed',String(loop));},
    'add-text':()=>add(layer('text',tr('نص جديد','New text'),p.accent,p.duration)),
    'add-shape':()=>add(layer('shape','rectangle',p.accent,p.duration)),
    'add-image':()=>$('#upload-image').click(),
    duplicate:()=>{const l=current();if(l)add({...l,id:crypto.randomUUID(),locked:false});},
    delete:()=>{const l=current();if(l&&!l.locked)update(()=>{p.layers=p.layers.filter(x=>x!==l);selected=p.layers.at(-1)?.id;});},
    above:()=>reorder(1),below:()=>reorder(-1),
    export:()=>exportDialog()
  };
  function reorder(offset){
    const from=p.layers.indexOf(current());const to=from+offset;
    if(from>=0&&to>=0&&to<p.layers.length&&!current().locked)update(()=>{[p.layers[from],p.layers[to]]=[p.layers[to],p.layers[from]];});
  }
  const click=event=>{
    const target=event.target.closest('button');
    if(!target)return;
    if(target.dataset.select){selected=target.dataset.select;panels();}
    else controls[target.id]?.();
  };
  const keys=event=>{
    if(event.target.matches('input,textarea,select'))return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){
      event.preventDefault();event.shiftKey?controls.redo():controls.undo();
    }
  };
  let drag;
  function pointerDown(event){
    const bar=event.target.closest('[data-track]');
    const item=p.layers.find(x=>x.id===bar?.dataset.track);
    if(!item||item.locked||event.button!==0)return;
    const rect=bar.getBoundingClientRect();
    const mode=rect.width>=26&&event.clientX>rect.right-8?'end':
      rect.width>=26&&event.clientX<rect.left+8?'start':'move';
    setPlaying(false);
    drag={bar,item,mode,pointer:event.pointerId,x:event.clientX,width:bar.parentElement.clientWidth,
      start:item.start,end:item.end,nextStart:item.start,nextEnd:item.end};
    bar.setPointerCapture(event.pointerId);event.preventDefault();
  }
  const clamp=(value,min,max)=>Math.max(min,Math.min(value,max));
  function pointerMove(event){
    if(!drag||event.pointerId!==drag.pointer)return;
    const delta=Math.round((event.clientX-drag.x)*p.duration/drag.width*p.fps)/p.fps;
    const {start,end,mode,bar}=drag;
    if(mode==='start')drag.nextStart=clamp(start+delta,0,end);
    else if(mode==='end')drag.nextEnd=clamp(end+delta,start,p.duration);
    else {
      drag.nextStart=clamp(start+delta,0,p.duration-(end-start));
      drag.nextEnd=drag.nextStart+(end-start);
    }
    bar.style.left=100*drag.nextStart/p.duration+'%';
    bar.style.width=100*(drag.nextEnd-drag.nextStart)/p.duration+'%';
  }
  function pointerEnd(event){
    if(!drag||event.pointerId!==drag.pointer)return;
    const d=drag;drag=undefined;selected=d.item.id;
    if(event.type==='pointerup'&&(d.nextStart!==d.start||d.nextEnd!==d.end)){
      update(()=>{d.item.start=d.nextStart;d.item.end=d.nextEnd;});
    }else panels();
  }
  function exportDialog(){
    setPlaying(false);
    const formats=availableFormats();
    const dialog=document.createElement('dialog');dialog.className='export';
    const base=(p.name||'motion-arena').replace(/[<>:"/\\|?*]/g,'_');
    dialog.innerHTML='<div class="stack"><h2>'+tr('تصدير المشروع','Export project')+'</h2>'+
      (formats.length?'<div class="cols">'+label(tr('الصيغة','Format'),'<select id="format">'+formats.map(f=>choice(f.extension,f.extension.toUpperCase())).join('')+'</select>')+
      label(tr('الدقة','Resolution'),'<select id="quality"><option value="720">720p</option><option value="1080">1080p</option></select>')+'</div>'+
      '<p>'+tr('يُسجَّل الفيديو أثناء التشغيل. أبقِ هذه التبويبة مفتوحة حتى يكتمل التنزيل.','The video records in real time. Keep this tab visible until the download finishes.')+'</p>':
      '<p>'+tr('تصدير الفيديو غير متاح في هذا المتصفح. يمكنك تنزيل المشروع أو صورة ثابتة.','This browser cannot export video. You can download the project or a still image.')+'</p>')+
      '<progress max="1" value="0" hidden aria-label="'+tr('تقدم التصدير','Export progress')+'"></progress><p id="export-error" class="danger" role="status"></p><div class="row">'+
      action('video',tr('تنزيل الفيديو','Download video'),true)+action('png','PNG')+action('json','JSON')+action('prompt',tr('البرومبت','Prompt'))+action('close-export',tr('إغلاق','Close'))+'</div></div>';
    root.append(dialog);dialog.showModal();
    const stop=()=>controller?.abort();
    dialog.addEventListener('close',()=>{stop();dialog.remove();},{once:true});
    const video=$('#video',dialog);video.disabled=!formats.length;
    $('#close-export',dialog).onclick=()=>dialog.close();
    $('#json',dialog).onclick=()=>download(new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),base+'.json');
    $('#png',dialog).onclick=()=>canvas.toBlob(blob=>blob&&download(blob,base+'.png'),'image/png');
    $('#prompt',dialog).onclick=()=>{
      const prompt='Create a '+p.duration+' second motion composition at '+p.fps+' FPS in '+p.ratio+'. Template: '+p.template+
        '. Background: '+p.background+'; accent: '+p.accent+'.\n'+p.layers.filter(l=>!l.hidden).map(l=>l.type+' "'+l.text+'" at '+l.x+'%, '+l.y+'%; '+l.animation+' motion, '+l.start+'–'+l.end+' seconds.').join('\n');
      download(new Blob([prompt],{type:'text/plain'}),base+'-prompt.txt');
    };
    video.onclick=async()=>{
      if(controller){stop();return;}
      controller=new AbortController();
      const bar=$('progress',dialog);const error=$('#export-error',dialog);
      error.textContent='';bar.hidden=false;bar.value=0;
      video.textContent=tr('إلغاء التصدير','Cancel export');
      try{
        const format=formats.find(f=>f.extension===$('#format',dialog).value);
        const blob=await renderVideo(p,{format,quality:Number($('#quality',dialog).value),progress:n=>bar.value=n,signal:controller.signal});
        download(blob,base+'.'+format.extension);
      }catch(e){if(e.name!=='AbortError')error.textContent=e.message;}
      finally{controller=undefined;video.textContent=tr('تنزيل الفيديو','Download video');bar.hidden=true;}
    };
  }
  root.addEventListener('click',click);root.addEventListener('change',onChange);
  const tracks=$('#tracks');
  tracks.addEventListener('pointerdown',pointerDown);tracks.addEventListener('pointermove',pointerMove);
  tracks.addEventListener('pointerup',pointerEnd);tracks.addEventListener('pointercancel',pointerEnd);
  document.addEventListener('keydown',keys);
  $('#seek').oninput=event=>{setPlaying(false);frame=Number(event.target.value);paint();};
  $('#loop').setAttribute('aria-pressed','true');
  panels();paint();media().catch(err);if(!stored)changed();
  return ()=>{
    if(timer)persist();disposed=true;cancelAnimationFrame(handle);controller?.abort();
    root.removeEventListener('click',click);root.removeEventListener('change',onChange);document.removeEventListener('keydown',keys);
  };
}
