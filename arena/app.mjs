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
  const entries=[['',tr('�驞��','Home')],['templates',tr('�����','Templates')],['projects',tr('꬟����','My projects')],['challenges',tr('�颥�','Challenges')],['gallery',tr('�����','Gallery')],['learn',tr('����','Learn')]];
  $('#header').innerHTML='<div class="bar"><a class="logo" href="#/"><span aria-hidden="true">?</span> MOTION ARENA</a>'+
    '<nav class="nav" aria-label="'+tr('����� �驞��','Main navigation')+'">'+entries.map(([path,title])=>'<a href="'+href(path)+'"'+(page===path?' aria-current="page"':'')+'>'+title+'</a>').join('')+'</nav><div class="row">'+
    action('language',tr('English','��㩠�'))+action('theme',tr('�����','Theme'))+'</div></div>';
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
  root.innerHTML='<section class="wrap"><div class="hero"><div><span class="eyebrow">CODE TO MOTION</span><h1>'+tr('���� ������','Motion Arena')+'</h1><p>'+tr('���. ����. ��. �墥 ���? ���� ��� ���� ��� �� ������ �� ��� ������.','Create. Animate. Compete. Make a motion piece, export your video, and enter a workshop challenge.')+'</p>'+
    '<div class="row"><a class="button primary" href="#/templates">'+tr('���� �颭���','Start creating')+'</a><a class="button" href="#/challenges">'+tr('���� ��� �颥��','Join a challenge')+'</a></div></div>'+
    '<div class="hero-art"><canvas id="hero-preview" width="960" height="540" aria-label="'+tr('�� ���� �� �� ��㟧','Animated Dimension template preview')+'"></canvas></div></div>'+
    '<section><h2>'+tr('���� ��� �頧��','Pick a starting point')+'</h2>'+cards()+'</section>'+
    '<footer class="section row"><a href="../">'+tr('������ ��� ���� ������','Back to the workshop')+'</a><a href="#/learn">'+tr('���� �韫�����','Studio guide')+'</a><a href="#/admin">'+tr('����� ������','Event administration')+'</a></footer></section>';
  bindCards();
  const context=$('#hero-preview').getContext('2d'),p=project('dimension',language());
  let tick;const start=performance.now();
  function animate(now){draw(context,p,25+Math.floor((now-start)/40)%200);tick=requestAnimationFrame(animate);}
  if(reduced())draw(context,p,45);else animate(start);
  return ()=>cancelAnimationFrame(tick);
}
async function projects(){
  const saved=(await all()).sort((a,b)=>b.updated-a.updated);
  root.innerHTML=section(tr('꬟����','My projects'),'<div class="row"><a class="button primary" href="#/templates">'+tr('ꬩ�� ���','New project')+'</a>'+action('import',tr('���著� JSON','Import JSON'))+
    '<input id="import-file" type="file" accept=".json,application/json" hidden></div><div class="section">'+
    (saved.length?'<div class="grid">'+saved.map(p=>'<article class="card stack"><h3>'+e(p.name)+'</h3><p dir="ltr">'+e(p.ratio)+' � '+p.duration+' s</p><div class="row">'+
    '<a class="button" href="#/studio/'+encodeURIComponent(p.id)+'">'+tr('����','Edit')+'</a><button type="button" data-copy="'+e(p.id)+'">'+tr('뫦','Duplicate')+'</button>'+
    '<button type="button" data-remove="'+e(p.id)+'">'+tr('���','Delete')+'</button></div></article>').join('')+'</div>':'<div class="card empty">'+tr('꬟���� ������ ���� ��.','Your saved projects will appear here.')+'</div>')+'</div>');
  $('#import').onclick=()=>$('#import-file').click();
  $('#import-file').onchange=async event=>{
    try{
      const file=event.target.files[0];if(!file)return;
      if(file.size>32_000_000)throw Error(tr('����� �蠩 �� 32 �蘭���','Project file exceeds 32 MB'));
      const p=validate(JSON.parse(await file.text()));p.id=crypto.randomUUID();await save(p);go('studio/'+p.id);
    }catch(e){err(e);}
  };
  for(const b of $$('[data-copy]'))b.onclick=async()=>{
    try{const p=saved.find(x=>x.id===b.dataset.copy);await save({...p,id:crypto.randomUUID(),updated:Date.now()});render();}catch(e){err(e);}
  };
  for(const b of $$('[data-remove]'))b.onclick=async()=>{
    if(!confirm(tr('�� ���� ��ꬩ�� �� 쨟 ��ꢭ�?','Delete this project from this browser?')))return;
    try{await remove(b.dataset.remove);render();}catch(e){err(e);}
  };
}
function learn(){
  root.innerHTML=section(tr('���� ������','Learn motion'),'<div class="compact stack section">'+[
    [tr('���� ���','Start with a template'),tr('���� ��� ����� �髢�. ��� �� � �� ��� �� ���� ��� ����� �����.','Pick one of six templates. Add text, a shape or an image and adjust its position and color.')],
    [tr('���� ���矢','Animate the layers'),tr('���� ��� �� ����� ����. ������ �頧�� ����� �颥�� �� �� ������ �� �奭 ���嵐 ��� ��� �����.','Choose a layer animation. Set its start and end times, then scrub the timeline to check the result.')],
    [tr('���� �����','Export and share'),tr('몑� ������ �� �韫�����. ��� �� ��� ꫟�� �����? ���� ����� ퟩ�� ����� ��꩟��.','Download the video from the studio. If a competition is open, sign in and upload your work for review.')],
    [tr('��� �� Codex �Remotion','Continue in Codex and Remotion'),tr('몑� JSON �頩�ꠢ �� �娡 �颭��? ퟫ������ ���� �饩� ����� ���矢 �� ꬩ�� Remotion �馟� ��.','Download the project JSON and prompt from Export and use them to describe the timing and motion in your Remotion project.')]
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
    else if(page==='templates'){root.innerHTML=section(tr('��� �饩�','Motion templates'),'<div class="section">'+cards()+'</div>');bindCards();}
    else if(page==='studio')dispose=await editor(root,part?decodeURIComponent(part):null);
    else if(page==='projects')await projects();
    else if(page==='learn')learn();
    else if(['challenges','gallery','leaderboard','admin','broadcast'].includes(page)){
      root.innerHTML=section(tr('���� �颥���?','Loading?'),'');dispose=await competition(root,page,part,scene,render);
    } else root.innerHTML=section(tr('��奡 �� ������','Page not found'),'<a href="#/">'+tr('�驞��','Home')+'</a>');
  }catch(error){
    root.innerHTML=section(tr('�㨑� ����� ��奡','The page could not load'),'<p>'+e(error.message)+'</p><a href="#/">'+tr('�驞��','Home')+'</a>');
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
    if(error||!data.session)toast(tr('�㨑� ����� �駦��. ��� ����� ����.','Sign-in failed. Request a new link.'));
    render();
  }).catch(error=>{err(error);render();});
}else render();
