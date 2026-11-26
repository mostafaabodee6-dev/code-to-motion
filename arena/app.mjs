import {project,templates,draw,validate} from './motion.mjs';
import {all,save,remove} from './persistence.mjs';
import {editor} from './editor.mjs';
import {competition} from './competition.mjs';
import {$,$$,tr,language,escape as e,section,action,toast,err} from './ui.mjs';
const root=$('#main');
let dispose,rendering=false,pending=false;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const href=path=>'#/'+path;
function route(){return location.hash.startsWith('#/')?location.hash.slice(2):'';}
function go(path){if(route()===path)render();else location.hash='/'+path;}
function header(page) {
  const entries=[['',tr('الرئيسية','Home')],['templates',tr('القوالب','Templates')],['projects',tr('مشاريعي','My projects')],['challenges',tr('التحديات','Challenges')],['gallery',tr('المعرض','Gallery')],['learn',tr('تعلّم','Learn')]];
  $('#header').innerHTML='<div class="bar"><a class="logo" href="#/"><span aria-hidden="true">◩</span> MOTION ARENA</a>'+
    '<nav class="nav" aria-label="'+tr('التنقل الرئيسي','Main navigation')+'">'+entries.map(([path,title])=>'<a href="'+href(path)+'"'+(page===path?' aria-current="page"':'')+'>'+title+'</a>').join('')+'</nav><div class="row">'+
    action('language',tr('English','العربية'))+action('theme',tr('المظهر','Theme'))+'</div></div>';
  $('#language').onclick=()=>{localStorage.setItem('arena-lang',tr('en','ar'));render();};
  $('#theme').onclick=()=>{
    const theme=document.documentElement.dataset.theme==='light'?'dark':'light';
    localStorage.setItem('arena-theme',theme);document.documentElement.dataset.theme=theme;
  };
}
const cards=()=>'<div class="grid">'+templates.map(t=>'<button class="template" data-template="'+t.id+'" type="button"><canvas width="400" height="225" aria-hidden="true"></canvas><strong>'+e(t[language()])+'</strong></button>').join('')+'</div>';
function bindCards(){
  for(const el of $$('[data-template]')){
    const p=project(el.dataset.template,language());
    draw($('canvas',el).getContext('2d'),p,40);
    el.onclick=()=>newProject(p.template).catch(err);
  }
}
async function newProject(template){
  const p=project(template,language());await save(p);go('studio/'+p.id);
}
function home(){
  root.innerHTML='<section class="wrap"><div class="hero"><div><span class="eyebrow">CODE TO MOTION</span><h1>'+tr('ساحة الموشن','Motion Arena')+'</h1><p>'+tr('صمّم. حرّك. نافس. افتح قالبًا، حوّله إلى فيديو خاص بك وشاركه في تحديات الورشة.','Create. Animate. Compete. Make a motion piece, export your video, and enter a workshop challenge.')+'</p>'+
    '<div class="row"><a class="button primary" href="#/templates">'+tr('ابدأ التصميم','Start creating')+'</a><a class="button" href="#/challenges">'+tr('انضم إلى التحدي','Join a challenge')+'</a></div></div>'+
    '<div class="hero-art"><canvas id="hero-preview" width="960" height="540" aria-label="'+tr('عرض موشن من قالب أبعاد','Animated Dimension template preview')+'"></canvas></div></div>'+
    '<section><h2>'+tr('اختر نقطة البداية','Pick a starting point')+'</h2>'+cards()+'</section>'+
    '<footer class="section row"><a href="../">'+tr('العودة إلى موقع الورشة','Back to the workshop')+'</a><a href="#/learn">'+tr('دليل الاستوديو','Studio guide')+'</a><a href="#/admin">'+tr('إدارة الفعالية','Event administration')+'</a></footer></section>';
  bindCards();
  const context=$('#hero-preview').getContext('2d'),p=project('dimension',language());
  let tick;const start=performance.now();
  function animate(now){draw(context,p,25+Math.floor((now-start)/40)%200);tick=requestAnimationFrame(animate);}
  if(reduced())draw(context,p,45);else animate(start);
  return ()=>cancelAnimationFrame(tick);
}
async function projects(){
  const saved=(await all()).sort((a,b)=>b.updated-a.updated);
  root.innerHTML=section(tr('مشاريعي','My projects'),'<div class="row"><a class="button primary" href="#/templates">'+tr('مشروع جديد','New project')+'</a>'+action('import',tr('استيراد JSON','Import JSON'))+
    '<input id="import-file" type="file" accept=".json,application/json" hidden></div><div class="section">'+
    (saved.length?'<div class="grid">'+saved.map(p=>'<article class="card stack"><h3>'+e(p.name)+'</h3><p dir="ltr">'+e(p.ratio)+' · '+p.duration+' s</p><div class="row">'+
    '<a class="button" href="#/studio/'+encodeURIComponent(p.id)+'">'+tr('تعديل','Edit')+'</a><button type="button" data-copy="'+e(p.id)+'">'+tr('نسخ','Duplicate')+'</button>'+
    '<button type="button" data-remove="'+e(p.id)+'">'+tr('حذف','Delete')+'</button></div></article>').join('')+'</div>':'<div class="card empty">'+tr('مشاريعك المحفوظة ستظهر هنا.','Your saved projects will appear here.')+'</div>')+'</div>');
  $('#import').onclick=()=>$('#import-file').click();
  $('#import-file').onchange=async event=>{
    try{
      const file=event.target.files[0];if(!file)return;
      if(file.size>32_000_000)throw Error(tr('الملف أكبر من 32 ميجابايت','Project file exceeds 32 MB'));
      const p=validate(JSON.parse(await file.text()));p.id=crypto.randomUUID();await save(p);go('studio/'+p.id);
    }catch(e){err(e);}
  };
  for(const b of $$('[data-copy]'))b.onclick=async()=>{
    try{const p=saved.find(x=>x.id===b.dataset.copy);await save({...p,id:crypto.randomUUID(),updated:Date.now()});render();}catch(e){err(e);}
  };
  for(const b of $$('[data-remove]'))b.onclick=async()=>{
    if(!confirm(tr('هل تحذف المشروع من هذا المتصفح؟','Delete this project from this browser?')))return;
    try{await remove(b.dataset.remove);render();}catch(e){err(e);}
  };
}
function learn(){
  root.innerHTML=section(tr('تعلّم الموشن','Learn motion'),'<div class="compact stack section">'+[
    [tr('ابدأ بقالب','Start with a template'),tr('اختر أحد القوالب الستة. أضف طبقة نص أو شكل أو صورة واضبط موقعها ولونها.','Pick one of six templates. Add text, a shape or an image and adjust its position and color.')],
    [tr('حرّك الطبقات','Animate the layers'),tr('اختر حركة من خصائص الطبقة. استخدم البداية والنهاية للتحكم في وقت الظهور ثم افحص النتيجة على الخط الزمني.','Choose a layer animation. Set its start and end times, then scrub the timeline to check the result.')],
    [tr('صدّر وشارك','Export and share'),tr('نزّل الفيديو من الاستوديو. إذا كانت هناك مسابقة مفتوحة، سجّل دخولك وارفع الملف للمراجعة.','Download the video from the studio. If a competition is open, sign in and upload your work for review.')],
    [tr('كمّل مع Codex وRemotion','Continue in Codex and Remotion'),tr('نزّل JSON والبرومبت من نافذة التصدير، واستخدمهما لوصف الحركة وتوقيت الطبقات في مشروع Remotion الخاص بك.','Download the project JSON and prompt from Export and use them to describe the timing and motion in your Remotion project.')]
  ].map(([name,description])=>'<article class="card"><h2>'+name+'</h2><p>'+description+'</p></article>').join('')+'</div>');
}
async function render(){
  if(rendering){pending=true;return;}
  rendering=true;
  try{
    dispose?.();dispose=null;
    document.documentElement.lang=language();document.documentElement.dir=tr('rtl','ltr');
    document.documentElement.dataset.theme=localStorage.getItem('arena-theme')??'dark';
    const [page,part,scene]=route().split('/');
    $('#header').hidden=page==='broadcast';
    if(page!=='broadcast')header(page);
    if(page==='')dispose=home();
    else if(page==='templates'){root.innerHTML=section(tr('قوالب الحركة','Motion templates'),'<div class="section">'+cards()+'</div>');bindCards();}
    else if(page==='studio')dispose=await editor(root,part?decodeURIComponent(part):null);
    else if(page==='projects')await projects();
    else if(page==='learn')learn();
    else if(['challenges','gallery','leaderboard','admin','broadcast'].includes(page)){
      root.innerHTML=section(tr('جارٍ التحميل…','Loading…'),'');dispose=await competition(root,page,part,scene,render);
    } else root.innerHTML=section(tr('الصفحة غير موجودة','Page not found'),'<a href="#/">'+tr('الرئيسية','Home')+'</a>');
  }catch(error){
    root.innerHTML=section(tr('تعذّر تحميل الصفحة','The page could not load'),'<p>'+e(error.message)+'</p><a href="#/">'+tr('الرئيسية','Home')+'</a>');
  }finally{
    rendering=false;
    if(pending){pending=false;queueMicrotask(render);}
  }
}
const routeChanged=()=>{render();root.focus({preventScroll:true});window.scrollTo(0,0);};
window.addEventListener('hashchange',routeChanged);
if(location.search.includes('arena_auth=1')){
  import('./competition.mjs').then(async m=>{
    const client=await m.client();const {data,error}=await client.auth.getSession();
    const candidate=localStorage.getItem('arena-auth-return');
    localStorage.removeItem('arena-auth-return');
    const destination=/^#\/(admin|challenges)\/[a-z][a-z0-9-]{2,50}$/.test(candidate)?candidate:'#/challenges';
    history.replaceState(null,'',location.pathname+destination);
    if(error||!data.session)toast(tr('تعذّر تسجيل الدخول. اطلب رابطًا جديدًا.','Sign-in failed. Request a new link.'));
    render();
  }).catch(error=>{err(error);render();});
}else render();
