import {$,$$,tr,escape as e,section,action,label,clock,err,toast} from './ui.mjs';
const DEFAULT_EVENT='code-to-motion';
const scenes=['countdown','gallery','leaderboard','winners','break'];
const states=()=>({draft:tr('����','Draft'),active:tr('�颥�� ����','Challenge open'),paused:tr('���� ���','Paused'),review:tr('�� ��꩟��','In review'),voting:tr('�颭�� ����','Voting open'),complete:tr('����� ��뢟��','Results published'),cancelled:tr('����','Cancelled')});
const sceneName=s=>({countdown:tr('��� ��럪��','Countdown'),gallery:tr('�����','Gallery'),leaderboard:tr('�颩��','Leaderboard'),winners:tr('��埞���','Winners'),break:tr('�������','Break')})[s];
let loadingClient;
function load(url){
  return new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src=url;script.onload=resolve;
    script.onerror=()=>{script.remove();reject(Error(tr('�㨑� �韢��� ���꟢ ������','Unable to load the workshop services')));};
    document.head.append(script);
  });
}
export function client(){
  loadingClient??=(async()=>{
    if(!window.supabase)await load('../vendor/supabase-2.119.0.js');
    if(!window.CTM_BACKEND?.sb)await load('../backend.js');
    if(!window.CTM_BACKEND?.sb)throw Error('Workshop Supabase client unavailable');
    return window.CTM_BACKEND.sb;
  })().catch(error=>{loadingClient=undefined;throw error;});
  return loadingClient;
}
async function unwrap(promise){
  const {data,error}=await promise;
  if(error)throw Error(error.message);
  return data;
}
const title=event=>tr(event.title_ar,event.title_en);
const empty=message=>'<div class="card empty">'+e(message)+'</div>';
const broadcastLink=(slug,scene='')=>'#/broadcast/'+encodeURIComponent(slug)+(scene?'/'+scene:'');
const listLink=(page,slug)=>'#/'+page+'/'+encodeURIComponent(slug);
const clipTitle=s=>'<h3>'+e(s.title)+'</h3><p>'+e(s.alias)+'</p>';
function ranks(submissions,limit=100){
  const ranked=submissions.filter(s=>s.status==='approved'&&s.votes!==null).sort((a,b)=>b.votes-a.votes).slice(0,limit);
  let lastScore,rank;
  return ranked.map((s,i)=>{
    if(s.votes!==lastScore)rank=i+1;
    lastScore=s.votes;
    return '<div class="rank"><strong>'+rank+'</strong><span>'+e(s.alias)+' � '+e(s.title)+'</span><span>'+s.votes+'</span></div>';
  }).join('');
}
function authForm(){
  return '<form id="arena-login" class="card compact stack"><h2>'+tr('���� �����','Sign in')+'</h2>'+
    label(tr('�頩� ���袩���','Email'),'<input name="email" type="email" required autocomplete="email" maxlength="254">')+
    '<p>'+tr('�멫� �� ���� �駦��. ���� ��� ����.','We will email you a sign-in link. Your email stays private.')+'</p><div><button class="primary">'+tr('����� �驟��','Send sign-in link')+'</button></div></form>';
}
function formAction(id,act){
  const form=$('#'+id);
  if(form)form.onsubmit=async event=>{
    event.preventDefault();
    const button=$('button:not([type=button])',form);
    button.disabled=true;
    try{await act(new FormData(form));}
    catch(error){err(error);}
    finally{button.disabled=false;}
  };
}
export async function competition(root,page,slug=DEFAULT_EVENT,scene,rerender){
  if(!/^[a-z][a-z0-9-]{2,50}$/.test(slug))throw Error('Invalid event slug');
  const sb=await client();
  const rpc=(name,args)=>unwrap(sb.rpc('arena_'+name,args));
  const session=page==='broadcast'?null:(await unwrap(sb.auth.getSession())).session;
  const state=()=>rpc('state',{p_slug:slug,p_public:page==='broadcast'});
  let current=await state(), offset=0, stopped=false, poll,tick, cacheKey='';
  const signed=new Map();
  const localTime=()=>Date.now()+offset;
  let disableAtDeadline=false;
  const updateClock=()=>{
    const c=current?.challenge;
    for(const el of $$('[data-deadline]',root)){
      el.textContent=c?.deadline?clock((Date.parse(c.deadline)-localTime())/1000):c?.paused_seconds?clock(c.paused_seconds):'?';
    }
    if(c?.deadline&&Date.parse(c.deadline)<=localTime()&&!disableAtDeadline){
      disableAtDeadline=true;
      for(const b of $$('[data-deadline-action]',root))b.disabled=true;
    }
  };
  const refresh=async()=>{
    const next=await state();
    if(stopped)return;
    const previous=current;
    current=next;
    if(current)offset=Date.parse(current.server_now)-Date.now();
    const stable=x=>x?JSON.stringify([x.event,x.challenge,x.alias,x.submissions,x.admin,x.has_voted]):'';
    const key=stable(current);
    if(key!==cacheKey){cacheKey=key;paint(previous);}
    $('#sync-status',root)?.replaceChildren();
    updateClock();
  };
  const clear=()=>{stopped=true;clearInterval(poll);clearInterval(tick);};
  function start(){
    offset=current?Date.parse(current.server_now)-Date.now():0;
    cacheKey=current?JSON.stringify([current.event,current.challenge,current.alias,current.submissions,current.admin,current.has_voted]):'';
    paint();updateClock();tick=setInterval(updateClock,250);
    let syncing=false;
    poll=setInterval(async()=>{
      if(syncing||(document.hidden&&page!=='broadcast'))return;
      syncing=true;
      try{await refresh();}catch(error){if(!stopped)$('#sync-status',root)?.replaceChildren(tr('�㨑�� ��ꪟ��. ���� �㟧� ��꥟��?','Sync interrupted. Retrying?'));}
      finally{syncing=false;}
    },5000);
  }
  function attachCommon(){
    formAction('arena-login',async data=>{
      const url=new URL(location.pathname+'?arena_auth=1',location.origin);
      localStorage.setItem('arena-auth-return',page==='admin'?'#/admin/'+slug:'#/challenges/'+slug);
      await unwrap(sb.auth.signInWithOtp({email:data.get('email').trim(),options:{emailRedirectTo:url.href}}));
      toast(tr('���� �� ���� �墥 ���� �駦��','Check your inbox for the sign-in link'));
    });
    const signout=$('#signout',root);
    if(signout)signout.onclick=async()=>{try{await unwrap(sb.auth.signOut());rerender();}catch(e){err(e);}};
  }
  const controls=(...items)=>'<div class="row">'+items.join('')+'</div>';
  const manage=(name,caption,id='')=>'<button type="button" data-control="'+name+'" data-target="'+e(id)+'">'+e(caption)+'</button>';
  const identity=()=>session?action('signout',tr('����� �馩��','Sign out')):'';
  const note=()=>'<p id="sync-status" role="status"></p>';
  function paint(){
    if(!current){
      if(page==='broadcast'){
        root.innerHTML='<section class="broadcast"><h2>'+tr('���⟩ ��� ������','Waiting for the event')+'</h2>'+note()+'</section>';
        return;
      }
      root.innerHTML=section(tr('��� ������','Motion events'),empty(tr('� ���� ���� ����� �����. ����� ������� �韫����� �� �� ��.','There is no published event yet. The studio is always available.'))+
        '<div class="section">'+(session?identity():authForm())+'</div>');
      attachCommon();return;
    }
    const {event,challenge:c,admin,alias,submissions}=current;
    const status=states()[c?.state]??tr('���⟩ �颥��','Waiting for a challenge');
    const visible=submissions.filter(s=>s.status==='approved');
    const voting=alias&&c?.state==='voting'&&Date.parse(c.deadline)>localTime();
    const canSubmit=alias&&c?.state==='active'&&Date.parse(c.deadline)>localTime()&&!submissions.some(s=>s.own);
    disableAtDeadline=false;
    const nav=controls(
      '<a class="button" href="'+listLink('challenges',slug)+'">'+tr('�颥��','Challenge')+'</a>',
      '<a class="button" href="'+listLink('gallery',slug)+'">'+tr('�����','Gallery')+'</a>',
      '<a class="button" href="'+listLink('leaderboard',slug)+'">'+tr('�颩��','Leaderboard')+'</a>',identity()
    );
    if(page==='broadcast'){
      const active=scenes.includes(scene)?scene:event.scene;
        let body;
      if(active==='countdown')body='<h2>'+e(c?.title??title(event))+'</h2><h1 dir="ltr" data-deadline>?</h1><p>'+e(status)+'</p>';
      else if(active==='break')body='<h1>'+tr('�������','Break')+'</h1><p>'+e(title(event))+'</p>';
      else if(active==='gallery')body='<h2>'+tr('��� �����','Gallery')+'</h2><div class="grid">'+visible.slice(0,6).map(s=>'<article class="card"><video muted loop autoplay playsinline data-video="'+e(s.video_path)+'"></video>'+clipTitle(s)+'</article>').join('')+'</div>';
      else body='<h2>'+sceneName(active)+'</h2>'+((c?.state==='complete'&&ranks(visible,active==='winners'?3:8))||'<p>'+tr('���⟩ ���� ��뢟��','Waiting for results')+'</p>');
      root.innerHTML='<section class="broadcast"><span class="eyebrow">MOTION ARENA � CODE TO MOTION</span>'+body+note()+'</section>';
    } else if(page==='gallery'){
      root.innerHTML=section(tr('��� �����','Gallery'),nav+'<div class="section grid">'+(visible.map(s=>'<article class="card stack"><video controls preload="metadata" playsinline data-video="'+e(s.video_path)+'"></video>'+clipTitle(s)+
        (voting&&!s.own&&(!current.has_voted||s.voted)?'<button class="primary" data-vote="'+e(s.id)+'" data-deadline-action '+(s.voted?'disabled':'')+'>'+tr(s.voted?'�� �颭��':'�푢',s.voted?'Voted':'Vote')+'</button>':'')+'</article>').join('')||empty(tr('����� ����ꧡ ���� ��.','Approved work will appear here.')))+'</div>'+note());
    } else if(page==='leaderboard'){
      root.innerHTML=section(tr('���� �颩��','Leaderboard'),nav+'<div class="card section stack">'+((c?.state==='complete'&&ranks(visible))||tr('��� ��뢟�� �� ��쟘 �颭�� ��꟧�.','Results appear when voting is closed and results are published.'))+'</div>'+note());
    } else if(page==='admin'){
      if(!admin){
        root.innerHTML=section(tr('����� ������','Event administration'),session?empty(tr('�� ��奡 饫���� ��ꬩ���.','This page is for workshop administrators.'))+identity():authForm());
      }else{
        const transitions={draft:['start','cancel'],active:['pause','extend','review','cancel'],paused:['resume','review','cancel'],review:['voting','cancel'],voting:['extend','complete','cancel'],complete:[],cancelled:[]};
        const names={start:tr('����','Start'),pause:tr('���� ��','Pause'),resume:tr('������','Resume'),extend:tr('���','Extend'),review:tr('���� �颫���','Close submissions'),voting:tr('�墥 �颭��','Open voting'),complete:tr('��� ��뢟��','Publish results'),cancel:tr('��䟘 �颥��','Cancel challenge')};
        root.innerHTML=section(tr('����� ������','Event administration'),'<div class="stack section">'+
          '<div class="card stack"><h2>'+e(title(event))+'</h2>'+controls(event.published?'<span class="status">'+tr('�����','Published')+'</span>':manage('publish',tr('�묩 ������','Publish event')),identity(),
            '<a class="button" target="_blank" rel="noopener" href="'+broadcastLink(slug)+'">'+tr('�墥 ���� �頣','Open broadcast')+'</a>')+'</div>'+
          '<article class="card stack"><h2>'+tr('�� OBS','OBS scene')+'</h2><p>'+e(sceneName(event.scene))+'</p>'+controls(...scenes.map(s=>manage('scene',sceneName(s),s)))+'</article>'+
          (c?'<article class="card stack"><h2>'+e(c.title)+'</h2><p>'+e(status)+'</p><output class="time" data-deadline></output>'+
            label(tr('��ꧡ �� ���� ������','Duration or extension in seconds'),'<input id="seconds" type="number" min="15" max="14400" value="300">')+
            controls(...transitions[c.state].map(s=>manage(s,names[s],c.id)))+'</article>':'')+
          (!c||['complete','cancelled'].includes(c.state)?'<form id="new-challenge" class="card stack"><h2>'+tr('���� ���','New challenge')+'</h2>'+
            label(tr('������','Title'),'<input name="title" required minlength="2" maxlength="120">')+label(tr('�����','Rules'),'<textarea name="rules" required maxlength="2500"></textarea>')+
            '<div><button class="primary">'+tr('�묞 ������','Create draft')+'</button></div></form>':'')+
          '<h2>'+tr('꩟�� �����','Review submissions')+'</h2><div class="grid">'+(submissions.map(s=>'<article class="card stack"><video controls preload="none" data-video="'+e(s.video_path)+'"></video>'+clipTitle(s)+
            '<p class="muted">'+e(({pending:tr('�� ��꩟��','Pending'),approved:tr('���','Approved'),rejected:tr('����','Rejected')})[s.status])+'</p>'+
            (['active','paused','review'].includes(c?.state)?controls(manage('approve',tr('��꟧','Approve'),s.id),manage('reject',tr('���','Reject'),s.id)):'')+'</article>').join('')||empty(tr('� ���� ���� ��꩟��.','There is no work to review.')))+'</div>'+note()+'</div>');
      }
    } else {
      root.innerHTML=section(title(event),nav+'<div class="compact section stack">'+
        '<article class="card stack"><span class="status">'+e(status)+'</span><h2>'+e(c?.title??tr('��� ������','Workshop challenges'))+'</h2>'+
        (c?.rules?'<p style="white-space:pre-wrap">'+e(c.rules)+'</p>':'')+(c?'<output data-deadline class="time" dir="ltr">?</output>':'')+'</article>'+
        (!session?authForm():!alias?'<form id="join" class="card stack"><h2>'+tr('���� ��� ������','Join event')+'</h2>'+
          label(tr('��� ���� ����','Public display name'),'<input name="alias" required minlength="2" maxlength="40" autocomplete="off">')+'<div><button class="primary">'+tr('����','Join')+'</button></div></form>':
          '<p>'+tr('ꬢ�� ���� ','Joined as ')+e(alias)+'</p>')+
        (canSubmit?'<form id="submit-clip" class="card stack"><h2>'+tr('��� ������','Submit your video')+'</h2>'+
          label(tr('���� �����','Work title'),'<input name="title" required minlength="2" maxlength="100">')+
          label(tr('���� MP4 �� WebM ��� 20 �蘭���','MP4 or WebM up to 20 MB'),'<input type="file" name="clip" required accept="video/mp4,video/webm">')+
          '<label><input type="checkbox" required>'+tr('���� ��� �� ����� �韫� ��ꫢ㟩 �� ���꟧? ���� �� ������� ���ퟧ ���.','I agree to publish this work and my display name after approval and have permission to use the materials.')+'</label>'+
          '<div><button class="primary" data-deadline-action>'+tr('����� ��꩟��','Send for review')+'</button></div></form>':'')+
        (submissions.some(s=>s.own)?'<article class="card">'+submissions.filter(s=>s.own).map(s=>'<p>'+e(s.title)+' � '+e(({pending:tr('�� ��꩟��','Pending'),approved:tr('���','Approved'),rejected:tr('����','Rejected')})[s.status])+'</p>').join('')+'</article>':'')+note()+'</div>');
    }
    attachCommon();
    if(!stopped)attachActions(event,c);
    attachVideos().catch(err);
  }
  async function attachVideos(){
    const videos=$$('[data-video]',root);
    const paths=[...new Set(videos.map(x=>x.dataset.video))].filter(x=>!signed.has(x)||signed.get(x).expires<Date.now());
    if(paths.length){
      const data=await unwrap(sb.storage.from('arena-clips').createSignedUrls(paths,1800));
      for(const item of data??[])if(item.signedUrl)signed.set(item.path,{url:item.signedUrl,expires:Date.now()+1740000});
    }
    for(const video of videos){
      if(!video.isConnected)continue;
      const url=signed.get(video.dataset.video)?.url;
      if(url)video.src=url;
    }
  }
  function attachActions(event,c){
    formAction('join',async data=>{await rpc('join',{p_event:event.id,p_alias:data.get('alias')});await refresh();});
    formAction('new-challenge',async data=>{
      await rpc('control',{p_event:event.id,p_action:'create',p_title:data.get('title'),p_rules:data.get('rules')});await refresh();
    });
    formAction('submit-clip',async data=>{
      const file=data.get('clip');
      const extension=({'video/mp4':'mp4','video/webm':'webm'})[file.type];
      if(!extension||!file.size||file.size>20*1024*1024)throw Error(tr('���� ���� MP4 �� WebM � ��� 20 �蘭���','Attach MP4 or WebM video up to 20 MB'));
      const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
      const valid=extension==='mp4'?String.fromCharCode(...header.slice(4,8))==='ftyp':header[0]===26&&header[1]===69&&header[2]===223&&header[3]===163;
      if(!valid)throw Error(tr('ꥢ�� ����� � �០� ��� ������','File contents do not match the video format'));
      const path=c.id+'/'+crypto.randomUUID()+'.'+extension;
      await unwrap(sb.storage.from('arena-clips').upload(path,file,{contentType:file.type,upsert:false}));
      try{await rpc('submit',{p_challenge:c.id,p_title:data.get('title'),p_path:path});}
      catch(error){await sb.storage.from('arena-clips').remove([path]);throw error;}
      await refresh();toast(tr('��� ���� ��꩟��','Your work was submitted for review'));
    });
    for(const button of $$('[data-vote]',root))button.onclick=async()=>{
      button.disabled=true;try{await rpc('vote',{p_submission:button.dataset.vote});await refresh();}
      catch(error){button.disabled=false;err(error);}
    };
    for(const button of $$('[data-control]',root))button.onclick=async()=>{
      const {control,target}=button.dataset;
      if(['cancel','complete'].includes(control)&&!confirm(tr('�� ��� 쨟 �靤���?','Confirm this action?')))return;
      button.disabled=true;
      try{
        await rpc('control',{p_event:event.id,p_action:control,p_target:target&&control!=='scene'?target:null,
          p_title:control==='scene'?target:null,p_seconds:Number($('#seconds',root)?.value??300)});
        await refresh();
      }catch(error){err(error);}
      finally{button.disabled=false;}
    };
  }
  start();return clear;
}
