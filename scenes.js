// مشاهد جاهزة: كل مشهد له معاينة (render) وكود Remotion حقيقي
// المعاينة ترسم على مسرح 960×540، والكود مكتوب لـ 1920×1080
window.CTM_MOTION = (() => {
// نفس فيزياء spring في Remotion (نابض بتخميد)
function spring({frame, fps = 30, config = {}}) {
  const {damping = 10, mass = 1, stiffness = 100} = config;
  if (frame <= 0) return 0;
  const t = frame / fps, w0 = Math.sqrt(stiffness / mass), z = damping / (2 * Math.sqrt(stiffness * mass));
  let x;
  if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); x = 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
  else if (z === 1) x = 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  else { const r1 = -w0 * (z - Math.sqrt(z * z - 1)), r2 = -w0 * (z + Math.sqrt(z * z - 1)); x = 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1); }
  return x;
}
const EASE = {
  linear: t => t,
  'out(cubic)': t => 1 - Math.pow(1 - t, 3),
  'in(cubic)': t => t * t * t,
  'inOut(cubic)': t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  'out(back)': t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
};
function interpolate(frame, [f0, f1], [v0, v1], {clamp = true, easing = 'linear'} = {}) {
  let p = (frame - f0) / (f1 - f0);
  if (clamp) p = Math.max(0, Math.min(1, p));
  return v0 + (v1 - v0) * EASE[easing](p);
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BG = 'background:radial-gradient(500px 300px at 85% 10%,#ff2e9a88,transparent 70%),radial-gradient(500px 320px at 10% 100%,#2f6bff99,transparent 70%),#14063f;';
const W = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:Cairo,sans-serif;color:#fff;';

const SCENES = [
  {id:'title-words', ar:'عنوان كلمة كلمة', en:'Word-by-word title', frames:90,
   dar:'كل كلمة تدخل بـ spring ورا اللي قبلها. أشهر حركة في فيديوهات المحتوى.', den:'Each word springs in after the previous one. The most common move in content videos.',
   render(f, txt) { const words = (txt || 'اصنع موشن جرافيك بالكود').split(' ');
     return `<div style="${W}${BG}"><div style="display:flex;gap:18px;flex-wrap:wrap;justify-content:center;direction:rtl;max-width:820px">${words.map((w, i) => { const p = spring({frame: f - i * 5, config: {damping: 13}}); return `<span style="font-size:64px;font-weight:900;display:inline-block;opacity:${Math.min(1, p * 1.5)};transform:translateY(${(1 - p) * 50}px) scale(${.7 + p * .3})">${esc(w)}</span>`; }).join('')}</div></div>`; },
   code:
`import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const TitleWords: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: '#14063F'}}>
      <div style={{display: 'flex', gap: 36, flexWrap: 'wrap', direction: 'rtl', maxWidth: 1600}}>
        {words.map((w, i) => {
          const p = spring({frame: frame - i * 5, fps, config: {damping: 13}});
          return (
            <span key={i} style={{
              fontSize: 128, fontWeight: 900, color: 'white', display: 'inline-block',
              opacity: Math.min(1, p * 1.5),
              transform: \`translateY(\${(1 - p) * 100}px) scale(\${0.7 + p * 0.3})\`,
            }}>{w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};`},
  {id:'counter', ar:'عداد أرقام', en:'Number counter', frames:90,
   dar:'رقم يعد من صفر لقيمة تحددها، مع Easing يبطّئ في الآخر. ممتاز للإحصائيات.', den:'A number counts from zero with easing that slows at the end. Great for stats.',
   render(f, txt) { const target = parseInt(String(txt).replace(/\D/g, '')) || 1250; const v = Math.round(interpolate(f, [5, 60], [0, target], {easing: 'out(cubic)'})); const s = spring({frame: f, config: {damping: 12}});
     return `<div style="${W}${BG}"><div style="transform:scale(${s});text-align:center"><div style="font-size:120px;font-weight:900;color:#ffd84d;line-height:1">${v.toLocaleString('en-US')}</div><div style="font-size:30px;color:#d3caf2">مشاهدة هذا الشهر</div></div></div>`; },
   code:
`import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Counter: React.FC<{value: number; label: string}> = ({value, label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const n = interpolate(frame, [5, 60], [0, value], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const pop = spring({frame, fps, config: {damping: 12}});

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: '#14063F'}}>
      <div style={{transform: \`scale(\${pop})\`, textAlign: 'center'}}>
        <div style={{fontSize: 240, fontWeight: 900, color: '#FFD84D'}}>
          {Math.round(n).toLocaleString('en-US')}
        </div>
        <div style={{fontSize: 60, color: '#D3CAF2', direction: 'rtl'}}>{label}</div>
      </div>
    </AbsoluteFill>
  );
};`},
  {id:'logo-reveal', ar:'كشف الشعار', en:'Logo reveal', frames:90,
   dar:'الشعار ينط بـ spring، ودائرة تكبر وتختفي حوله، وبعدها الاسم يطلع.', den:'The logo bounces in, a ring expands and fades around it, then the name appears.',
   render(f, txt) { const l = spring({frame: f - 4, config: {damping: 9}}); const r = interpolate(f, [4, 40], [0, 1]); const n = interpolate(f, [30, 45], [0, 1]);
     return `<div style="${W}${BG}"><div style="position:absolute;width:200px;height:200px;border-radius:50%;border:4px solid #4ff0ff;opacity:${1 - r};transform:scale(${.8 + r * 1.8});top:110px"></div><img src="logo.png" alt="" style="width:170px;height:170px;border-radius:36px;transform:scale(${l});margin-bottom:24px"><div style="font-size:44px;font-weight:900;opacity:${n};transform:translateY(${(1 - n) * 20}px)">${esc(txt || 'عبدالرحمن مصطفى')}</div></div>`; },
   code:
`import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const LogoReveal: React.FC<{name: string}> = ({name}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const logo = spring({frame: frame - 4, fps, config: {damping: 9}});
  const ring = interpolate(frame, [4, 40], [0, 1], clamp);
  const title = interpolate(frame, [30, 45], [0, 1], clamp);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: '#14063F'}}>
      <div style={{position: 'absolute', top: 220, width: 400, height: 400, borderRadius: '50%',
        border: '8px solid #4FF0FF', opacity: 1 - ring, transform: \`scale(\${0.8 + ring * 1.8})\`}} />
      <Img src={staticFile('logo.png')} style={{width: 340, height: 340, borderRadius: 72,
        transform: \`scale(\${logo})\`, marginBottom: 48}} />
      <div style={{fontSize: 88, fontWeight: 900, color: 'white', direction: 'rtl', opacity: title,
        transform: \`translateY(\${(1 - title) * 40}px)\`}}>{name}</div>
    </AbsoluteFill>
  );
};`},
  {id:'lower-third', ar:'شريط الاسم (Lower third)', en:'Lower third', frames:90,
   dar:'شريط يدخل من الجنب تحت الشاشة فيه الاسم والوصف. ينفع للمقابلات والشروحات.', den:'A name bar slides in at the bottom with a title. Perfect for interviews and tutorials.',
   render(f, txt) { const a = spring({frame: f, config: {damping: 200}}); const b = spring({frame: f - 8, config: {damping: 200}});
     return `<div style="position:absolute;inset:0;${BG}font-family:Cairo,sans-serif"><div style="position:absolute;bottom:60px;right:60px;direction:rtl"><div style="background:#ff2e9a;color:#fff;font-size:38px;font-weight:900;padding:6px 28px;border-radius:14px 14px 0 14px;transform:translateX(${(1 - a) * 500}px)">${esc(txt || 'عبدالرحمن مصطفى')}</div><div style="background:#fff;color:#14063f;font-size:22px;font-weight:700;padding:6px 28px;border-radius:0 0 14px 14px;display:inline-block;transform:translateX(${(1 - b) * 500}px)">مصمم جرافيك ومونتير</div></div></div>`; },
   code:
`import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const LowerThird: React.FC<{name: string; role: string}> = ({name, role}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 200}});
  const b = spring({frame: frame - 8, fps, config: {damping: 200}});

  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', bottom: 120, right: 120, direction: 'rtl'}}>
        <div style={{background: '#FF2E9A', color: 'white', fontSize: 76, fontWeight: 900,
          padding: '12px 56px', borderRadius: '28px 28px 0 28px',
          transform: \`translateX(\${(1 - a) * 1000}px)\`}}>{name}</div>
        <div style={{background: 'white', color: '#14063F', fontSize: 44, fontWeight: 700,
          padding: '12px 56px', borderRadius: '0 0 28px 28px', display: 'inline-block',
          transform: \`translateX(\${(1 - b) * 1000}px)\`}}>{role}</div>
      </div>
    </AbsoluteFill>
  );
};`},
  {id:'captions', ar:'ترجمة كلمة كلمة', en:'Word captions', frames:120,
   dar:'ترجمة تحت الشاشة، والكلمة اللي تنقال الحين تتلوّن. أساس فيديوهات Shorts.', den:'Bottom captions where the spoken word lights up. The core of Shorts videos.',
   render(f, txt) { const words = (txt || 'الكود يحرّك كل شي في الفيديو').split(' '); const per = 110 / words.length; const cur = Math.min(words.length - 1, Math.floor(f / per));
     return `<div style="position:absolute;inset:0;${BG}font-family:Cairo,sans-serif;display:flex;align-items:flex-end;justify-content:center;padding-bottom:70px"><div style="background:#000a;border-radius:18px;padding:10px 26px;display:flex;gap:12px;direction:rtl;flex-wrap:wrap;justify-content:center;max-width:800px">${words.map((w, i) => `<span style="font-size:40px;font-weight:900;color:${i === cur ? '#ffd84d' : '#fff'};transform:scale(${i === cur ? 1.12 : 1});display:inline-block">${esc(w)}</span>`).join('')}</div></div>`; },
   code:
`import {AbsoluteFill, useCurrentFrame} from 'remotion';

// كل كلمة ومتى تبدأ (بالفريم). طابقها مع التعليق الصوتي
type Word = {text: string; from: number};

export const Captions: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const current = words.findLastIndex((w) => w.from <= frame);

  return (
    <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 140}}>
      <div style={{background: 'rgba(0,0,0,0.65)', borderRadius: 36, padding: '20px 52px',
        display: 'flex', gap: 24, direction: 'rtl', flexWrap: 'wrap', maxWidth: 1600}}>
        {words.map((w, i) => (
          <span key={i} style={{fontSize: 80, fontWeight: 900,
            color: i === current ? '#FFD84D' : 'white',
            transform: \`scale(\${i === current ? 1.12 : 1})\`, display: 'inline-block'}}>
            {w.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};`},
  {id:'bars', ar:'أعمدة بيانات متحركة', en:'Animated bars', frames:90,
   dar:'أعمدة تكبر وحدة ورا الثانية مع أرقامها. لمقارنة سريعة وواضحة.', den:'Bars grow one after another with their values. A clear, quick comparison.',
   render(f) { const data = [['تصميم', 62], ['مونتاج', 85], ['موشن', 100], ['كود', 74]];
     return `<div style="position:absolute;inset:0;${BG}font-family:Cairo,sans-serif;display:flex;align-items:flex-end;justify-content:center;gap:40px;padding:60px 80px 70px;direction:rtl">${data.map(([l, v], i) => { const p = spring({frame: f - i * 6, config: {damping: 14}}); return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px;width:120px"><b style="font-size:26px;color:#ffd84d;opacity:${Math.min(1, p)}">${Math.round(v * Math.min(1, p))}%</b><div style="width:100%;height:${v * 3.2 * p}px;border-radius:16px 16px 6px 6px;background:linear-gradient(#4ff0ff,#7b2cff)"></div><span style="font-size:24px;font-weight:700;color:#fff">${l}</span></div>`; }).join('')}</div>`; },
   code:
`import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Bar = {label: string; value: number}; // value من 0 إلى 100

export const Bars: React.FC<{data: Bar[]}> = ({data}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
      gap: 80, padding: '120px 160px 140px', direction: 'rtl', background: '#14063F'}}>
      {data.map((d, i) => {
        const p = spring({frame: frame - i * 6, fps, config: {damping: 14}});
        return (
          <div key={d.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: 240}}>
            <b style={{fontSize: 52, color: '#FFD84D'}}>{Math.round(d.value * Math.min(1, p))}%</b>
            <div style={{width: '100%', height: d.value * 6.4 * p, borderRadius: '32px 32px 12px 12px',
              background: 'linear-gradient(#4FF0FF, #7B2CFF)'}} />
            <span style={{fontSize: 48, fontWeight: 700, color: 'white'}}>{d.label}</span>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};`},
];
return {spring, interpolate, EASE, SCENES};
})();
