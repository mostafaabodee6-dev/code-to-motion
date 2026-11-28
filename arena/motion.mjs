export const templates = [
  {id:'kinetic', en:'Kinetic Typography', ar:'تايبوغرافي حركي', subtitle:'WORDS IN MOTION', colors:['#15102a','#a78bfa','#6ee7f9']},
  {id:'cinematic', en:'Cinematic Reveal', ar:'كشف سينمائي', subtitle:'A TITLE REVEAL', colors:['#11121b','#f0cd99','#717b9f']},
  {id:'future', en:'Future Tech', ar:'تقنية المستقبل', subtitle:'SYSTEM ONLINE', colors:['#071b23','#62f5da','#7df3ff']},
  {id:'minimal', en:'Minimal Motion', ar:'حركة بسيطة', subtitle:'MOTION STUDIES', colors:['#f5eee2','#211932','#f47657']},
  {id:'social', en:'Social Impact', ar:'أثر اجتماعي', subtitle:'MAKE IT MATTER', colors:['#20102e','#ff86bd','#f4d56d']},
  {id:'dimension', en:'Dimension', ar:'أبعاد', subtitle:'STUDIES IN DEPTH', colors:['#110d25','#beb0ff','#7a5aff']}
];
export const ratios={'16:9':[16,9],'9:16':[9,16],'1:1':[1,1]};
export const animations=['none','fade','slide','scale','bounce','rotate','reveal','pulse'];
const colors=/^#[0-9a-f]{6}$/i;
const uid=()=>crypto.randomUUID();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function layer(type, text, color='#ffffff', end=10) {
  return {id:uid(),type,text,color,x:50,y:50,size:type==='shape'?25:12,rotation:0,opacity:100,start:0,end,animation:'slide',hidden:false,locked:false};
}
export function project(id='kinetic',lang='ar') {
  const template=templates.find(item=>item.id===id)??templates[0];
  const [background,accent,detail]=template.colors;
  const headline=layer('text',lang==='ar'?'ريل ستوديو':'REAL STUDIO',accent);
  const caption=layer('text',lang==='ar'?'صمّم. حرّك. نافس.':template.subtitle,detail);
  Object.assign(caption,{size:4,y:68,start:.24,animation:'fade'});
  headline.animation={kinetic:'slide',cinematic:'fade',future:'reveal',minimal:'scale',social:'bounce',dimension:'rotate'}[template.id];
  return {schemaVersion:1,id:uid(),name:lang==='ar'?template.ar:template.en,template:template.id,ratio:'16:9',
    fps:30, duration:10, background, accent, layers:[headline,caption], updated:Date.now()};
}
export function dimensions(ratio,quality) {
  const [w,h]=ratios[ratio];
  const even=value=>Math.round(value/2)*2;
  return w>=h?[even(quality*w/h),quality]:[quality,even(quality*h/w)];
}
export function validate(value) {
  const n=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;
  const str=(v,max)=>typeof v==='string'&&v.length<=max;
  if(!value||value.schemaVersion!==1||!str(value.id,80)||!str(value.name,120)||
    !Object.hasOwn(ratios,value.ratio)||!templates.some(t=>t.id===value.template)||
    ![24,30,60].includes(value.fps)||!n(value.duration,3,30)||!colors.test(value.background)||
    !colors.test(value.accent)||!Array.isArray(value.layers)||value.layers.length>24) throw Error('Invalid Real Studio project');
  const layers=value.layers.map(item=>{
    if(!item||!str(item.id,80)||!['text','shape','image'].includes(item.type)||!str(item.text,240)||
      !colors.test(item.color)||!n(item.x,-100,200)||!n(item.y,-100,200)||!n(item.size,1,150)||
      !n(item.rotation,-360,360)||!n(item.opacity,0,100)||!n(item.start,0,value.duration)||
      !n(item.end,item.start,value.duration)||!animations.includes(item.animation)||
      typeof item.hidden!=='boolean'||typeof item.locked!=='boolean') throw Error('Invalid layer');
    if(item.type==='image'&&(!str(item.asset,3_000_000)||!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/]+=*$/i.test(item.asset))) throw Error('Invalid image');
    return {id:item.id,type:item.type,text:item.text,color:item.color,x:item.x,y:item.y,size:item.size,rotation:item.rotation,
      opacity:item.opacity,start:item.start,end:item.end,animation:item.animation,hidden:item.hidden,locked:item.locked,asset:item.type==='image'?item.asset:undefined};
  });
  if(new Set(layers.map(item=>item.id)).size!==layers.length) throw Error('Duplicate layer');
  return {schemaVersion:1,id:value.id,name:value.name,template:value.template,ratio:value.ratio,fps:value.fps,
    duration:value.duration,background:value.background,accent:value.accent,layers,updated:Date.now()};
}
function decoration(ctx,id,w,h,t,accent) {
  const u=Math.min(w,h);
  ctx.save();ctx.translate(w/2,h/2);ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=Math.max(1,u*.003);
  if(id==='future'){
    ctx.globalAlpha=.18;
    for(let x=-w/2;x<w/2;x+=u*.073){ctx.beginPath();ctx.moveTo(x,-h/2);ctx.lineTo(x,h/2);ctx.stroke();}
    for(let y=-h/2+(t*u*.03)%(u*.073);y<h/2;y+=u*.073){ctx.beginPath();ctx.moveTo(-w/2,y);ctx.lineTo(w/2,y);ctx.stroke();}
    ctx.globalAlpha=.8;ctx.strokeRect(-w*.41,-h*.35,w*.82,h*.7);
  } else if(id==='cinematic'){
    const g=ctx.createRadialGradient(Math.sin(t)*w*.15,-h*.2,0,0,0,w*.72);g.addColorStop(0,accent+'52');g.addColorStop(1,accent+'00');
    ctx.fillStyle=g;ctx.fillRect(-w/2,-h/2,w,h);ctx.globalAlpha=.45;ctx.fillStyle=accent;ctx.fillRect(-w*.11,h*.25,w*.22,1);
  } else if(id==='minimal'){
    ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(w*.27,-h*.15,u*.29+Math.sin(t)*u*.013,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.35;ctx.strokeRect(-w*.42,-h*.34,w*.84,h*.68);
  } else if(id==='social'){
    ctx.rotate(-.28);ctx.globalAlpha=.23;ctx.fillRect(-w*.61,-h*.47+Math.sin(t)*u*.035,w*1.22,h*.18);ctx.fillRect(-w*.61,h*.28,w*1.22,h*.19);
  } else {
    ctx.rotate(t*(id==='dimension'?.22:.08)-.25);
    for(let i=0;i<9;i++){const s=u*(.29+i*.06);ctx.globalAlpha=.13-i*.009;
      if(id==='dimension')ctx.strokeRect(-s/2+i*u*.021,-s/2+i*u*.013,s,s);
      else {ctx.beginPath();ctx.ellipse(0,0,s,s*.62,0,0,Math.PI*2);ctx.stroke();}
    }
  }
  ctx.restore();
}
export function draw(ctx,p,frame,images=new Map()) {
  const {width:w,height:h}=ctx.canvas;
  const t=frame/p.fps;
  ctx.fillStyle=p.background;ctx.fillRect(0,0,w,h);
  decoration(ctx,p.template,w,h,t,p.accent);
  for(const l of p.layers){
    if(l.hidden||t<l.start||t>=l.end)continue;
    const u=Math.min(w,h);
    const entry=clamp((t-l.start)/.65,0,1);
    const ease=1-(1-entry)**3;
    let x=l.x*w/100,y=l.y*h/100,scale=1,a=l.opacity/100,angle=l.rotation;
    if(l.animation==='fade')a*=ease;
    if(l.animation==='slide'){x-=(1-ease)*u*.35;a*=ease;}
    if(l.animation==='scale')scale=.55+.45*ease;
    if(l.animation==='bounce')y-=Math.sin(entry*Math.PI*2.5)*Math.exp(-entry*4)*u*.25;
    if(l.animation==='rotate'){angle-=(1-ease)*25;a*=ease;}
    if(l.animation==='pulse')scale=1+Math.sin(t*4)*.035;
    ctx.save();ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);ctx.scale(scale,scale);ctx.globalAlpha=a;ctx.fillStyle=l.color;
    if(l.animation==='reveal'){ctx.beginPath();ctx.rect(-w,-h,w*2*ease,h*2);ctx.clip();}
    const size=u*l.size/100;
    if(l.type==='shape'){
      ctx.beginPath();
      if(l.text==='circle')ctx.arc(0,0,size/2,0,Math.PI*2);
      else if(l.text==='triangle'){ctx.moveTo(0,-size/2);ctx.lineTo(size/2,size/2);ctx.lineTo(-size/2,size/2);ctx.closePath();}
      else ctx.rect(-size/2,-size/3,size,size*2/3);
      ctx.fill();
    }
    if(l.type==='text'){
      ctx.font='800 '+size+'px "Cairo", "Segoe UI", sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.direction=/[\u0600-\u06ff]/.test(l.text)?'rtl':'ltr';
      const lines=l.text.split('\n').slice(0,6);
      lines.forEach((line,i)=>ctx.fillText(line,0,(i-(lines.length-1)/2)*size*1.23,w*.93));
    }
    if(l.type==='image'&&images.has(l.asset)){
      const image=images.get(l.asset);const height=size*image.height/image.width;ctx.drawImage(image,-size/2,-height/2,size,height);
    }
    ctx.restore();
  }
}
