// CODE TO MOTION — منطق الموقع
{
const C = window.CTM, EN = window.CTM_EN, M = window.CTM_MOTION;
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
const store = {get(k, d) { try { return JSON.parse(localStorage.getItem('ctm-' + k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('ctm-' + k, JSON.stringify(v)); } catch (e) {} }};

// ═════ اللغة ═════
let lang = store.get('lang', 'ar');
const T = {
  ar: {
    'nav.glossary':'المصطلحات','nav.mytools':'أدواتي','try.h':'جرّب تطلب','try.p':'اضغط على أي فكرة، وخذ برومبت جاهز تلصقه لوكيلك.','try.s1':'افتح الـ Terminal داخل مجلد مشروعك','try.s2':'اكتب claude (أو شغّل Codex)','try.s3':'الصق البرومبت واضغط Enter، وراجع النتيجة في Studio',
    'glo.h':'قاموس المصطلحات','glo.p':'كل كلمة تسمعها في الموشن والذكاء الاصطناعي، بشرح بسيط بجملتين.','glo.search':'ابحث عن مصطلح…','gc.all':'الكل','gc.motion':'موشن','gc.ai':'ذكاء اصطناعي','gc.dev':'برمجة','glo.eg':'مثال: ',
    'mt.h':'الأدوات اللي أستخدمها','mt.p':'الأدوات اللي نشتغل فيها في الورشة، وش تسوي كل وحدة، ومتى تحتاجها.','mt.op':'رأيي: ','mt.visit':'الموقع الرسمي ←','tc.motion':'موشن','tc.ai':'ذكاء اصطناعي','tc.dev':'برمجة ونشر','tc.audio':'صوت','tc.video':'فيديو',
    'sr.h':'ابحث في الموقع','sr.ph':'دروس، Skills، مصطلحات، أدوات…','sr.none':'ما لقيت شي. جرّب كلمة ثانية.','sr.hint':'اكتب كلمة، مثل spring أو صوت أو prompt.','sr.les':'الدروس','sr.lib':'المكتبة','sr.glo':'المصطلحات','sr.tools':'أدواتي','sr.sc':'مشاهد جاهزة',
    'foot.about':'من أنا','foot.contact':'تواصل','foot.privacy':'الخصوصية','theme':'تبديل الوضع',
    'nav.home':'الرئيسية','nav.library':'المكتبة','nav.tools':'المختبر','nav.lessons':'الدروس','nav.gallery':'معرض الأعمال','nav.project':'ملفات الورشة',
    'home.h1':'كل اللي تحتاجه عشان تصنع موشن جرافيك بالكود والذكاء الاصطناعي','home.p':'Skills ووكلاء وأوامر وبرومبتات جاهزة لـ Claude Code و Codex و Cursor، وأدوات تجربة لايف، ودروس الورشة كاملة.',
    'home.cta1':'تصفّح المكتبة','home.cta2':'جرّب الحركة لايف','home.start':'من وين تبدأ؟','home.startp':'أربع طرق تختصر عليك الطريق، حسب وين أنت الحين.',
    'st.skills':'Skill','st.agents':'وكيل وأمر','st.prompts':'برومبت جاهز','st.scenes':'مشهد جاهز',
    'tile1.h':'أول مرة؟','tile1.p':'ابدأ بالدروس بالترتيب، كل درس 10 دقايق.','tile1.b':'ابدأ الدروس',
    'tile2.h':'جرّب لايف','tile2.p':'حرّك الأرقام وشوف spring و interpolate يتغيرون قدامك.','tile2.b':'ملعب الحركة',
    'tile3.h':'جهّز وكيلك','tile3.p':'ثبّت Skill حق Remotion عشان يكتب كود صحيح.','tile3.b':'افتح المكتبة',
    'tile4.h':'عندك فكرة؟','tile4.p':'اكتب فكرتك وخذ برومبت كامل لوكيلك.','tile4.b':'مولّد البرومبت',
    'next.soon':'الورشة الجاية… قريبًا','next.follow':'تابع حساباتي عشان يوصلك موعدها أول بأول.','next.cta':'صفحة الورشة على Luma','next.reg':'سجّل الحين','next.admin':'تعديل الورشة الجاية (تظهر لك بس)','next.f.title':'عنوان الورشة','next.started':'بدأت الورشة! 🎬',
    'cd.d':'يوم','cd.h':'ساعة','cd.m':'دقيقة','cd.s':'ثانية','save':'احفظ','saved':'انحفظ ✓','saveFail':'ما انحفظ، جرّب مرة ثانية',
    'news.h':'جديد المكتبة يوصلك','news.p':'كل ما نضيف Skill أو درس أو ورشة جديدة، نرسل لك إيميل قصير. بدون إزعاج.','news.btn':'اشترك','news.ok':'تم الاشتراك ✓ شكرًا لك','news.no':'الاشتراك من هنا متاح للأعضاء المسجلين. تقدر تتابعني على @mostafaabodee8 أو تراسلني على mostafaabodee9@gmail.com','news.count':'عدد المشتركين: ','news.copy':'انسخ الإيميلات','pub.h':'ارفع عملك','pub.p':'يوصلني عملك، وبعد المراجعة ينضاف للمعرض.','pub.need':'حط رابط المنشور أو ارفع الفيديو','pub.big':'الفيديو أكبر من 50MB','pub.type':'الصيغ المقبولة: MP4 أو WebM أو MOV','pub.ok':'وصلنا عملك ✓ بيظهر في المعرض بعد المراجعة','pub.ok2':'أوافق على نشر عملي واسمي في المعرض','pub.btn':'أرسل عملي','pub.file':'ملف الفيديو (اختياري، أقل من 50MB)','news.mail':'فتحنا لك رسالة إيميل جاهزة، اضغط إرسال وتنضاف للقائمة ✓',
    'lib.h':'المكتبة','lib.p':'اضغط + عشان تضيف للسلة، أو التفاصيل عشان تشوف الشرح والبرومبت والملف كامل.','lib.search':'ابحث في المكتبة…','lib.empty':'ما فيه نتائج هنا. جرّب تصنيف أو كلمة ثانية.',
    'type.skill':'Skills','type.agent':'وكلاء','type.command':'أوامر','type.mcp':'MCP','type.prompt':'برومبتات',
    'cat.all':'الكل','cat.video':'فيديو وموشن','cat.design':'تصميم','cat.docs':'عروض ومستندات','cat.dev':'تطوير','star':' · ننصح فيها',
    'copy':'نسخ','copyPrompt':'نسخ البرومبت','copyFile':'نسخ الملف','details':'التفاصيل ←','add':'أضف للسلة','remove':'شيل من السلة',
    'stack.h':'سلة التثبيت','stack.none':'اضغط + على أي Skill أو MCP عشان تجمع أوامر التثبيت هنا','stack.empty':'ما أضفت شي للحين','stack.n':' في السلة','stack.copy':'انسخ كل الأوامر','stack.zip':'حمّل كل الوكلاء والأوامر (ZIP)','stack.note':'فك الضغط داخل مجلد مشروعك، وتنحط الملفات في .claude تلقائيًا.',
    'md.use':'متى تستخدمه؟','md.install':'التثبيت','md.file':'الملف','md.saveTo':'احفظه في: ','md.prompt':'البرومبت','md.fill':'غيّر اللي بين < > قبل ما ترسله.','md.try':'جرّبه بهذا البرومبت','md.copyInstall':'انسخ أمر التثبيت','md.src':'المصدر','close':'إغلاق',
    'tools.h':'أدوات تجربة لايف','tools.p':'غيّر الأرقام وشوف الحركة تتغيّر قدامك، وانسخ كود Remotion جاهز.','tab.play':'ملعب الحركة','tab.scenes':'مشاهد جاهزة','tab.prompt':'مولّد البرومبت',
    'play.prop':'الخاصية','play.from':'من فريم','play.to':'إلى فريم','sc.text':'غيّر النص','sc.code':'انسخ الكود',
    'pg.type':'نوع الفيديو','pg.dur':'المدة (ثواني)','pg.size':'المقاس','pg.lang':'لغة النص','pg.text':'النص أو الفكرة الأساسية','pg.c1':'اللون الأساسي','pg.c2':'لون التمييز','pg.style':'الستايل','pg.audio':'الصوت','pg.extras':'إضافات','pg.tip':'البرومبت بالإنجليزي لأن الوكلاء يفهمونه أدق، والنص اللي في الفيديو يطلع باللغة اللي اخترتها.','pg.ph':'مثال: إعلان لورشة موشن جرافيك بالكود، يوم السبت',
    'les.h':'دروس الورشة','les.p':'كل درس فيه الفكرة والكود وتمرين قصير. علّم على الدرس لما تخلّصه، وفي الآخر تاخذ شهادتك.','les.file':'الملف في المشروع: ','les.ex':'✍️ تمرين: ','les.prev':'→ الدرس السابق','les.next':'الدرس التالي ←','les.share':'شارك عملك ←','les.done':'✓ خلّصت الدرس','les.mark':'علّمه كمخلّص','les.prog':'تقدّمك: ',
    'cert.h':'شهادة إتمام الدروس','cert.lockP':'خلّص الدروس السبعة وتنفتح لك الشهادة.','cert.openP':'مبروك! خلّصت كل الدروس. اكتب اسمك واصنع شهادتك.','cert.name':'اكتب اسمك كما تبغاه في الشهادة','cert.make':'اصنع الشهادة','cert.save':'حمّل الشهادة','cert.needName':'اكتب اسمك أول','cert.lock':'🔒 باقي ','cert.lock2':' دروس','cert.ok':'تم ✓','cert.dlno':'اضغط على الصورة بالزر اليمين واحفظها',
    'faq.h':'أسئلة شائعة','gal.h':'معرض أعمال الحضور','gal.p':'فيديوهات سوّاها الحضور في تحدي الورشة. صوّت لأحلى عمل.','gal.share':'شارك عملك','gal.how':'سوّ فيديو «عن نفسي» من قالب AboutMe، وانشره على حساباتك مع منشن @mostafaabodee8. الأعمال المختارة تنضاف هنا.',
    'gal.add':'إضافة عمل (تظهر لك بس)','gal.f.name':'اسم صاحب العمل','gal.f.title':'عنوان العمل','gal.f.link':'رابط المنشور (اختياري، يبدأ بـ https://)','gal.f.file':'ملف الفيديو (اختياري، أقل من 20MB)','gal.f.save':'أضف للمعرض',
    'gal.loading':'أجهّز المعرض…','gal.empty':'المعرض ينتظر أول عمل. كن أول واحد يشارك!','gal.out':'المعرض يشتغل لما تفتح الصفحة من رابطها على claude.ai.','gal.signin':'سجّل دخولك في claude.ai عشان تشوف المعرض.','gal.fail':'ما قدرت أحمّل المعرض حاليًا.','gal.watch':'شاهد المنشور ←','gal.voteNo':'التصويت متاح للحضور المسجلين بس','gal.https':'الرابط لازم يبدأ بـ https://','gal.big':'الفيديو أكبر من 20MB','gal.up':'أرفع الفيديو…','gal.ok':'انضاف ✓',
    'proj.h':'ملفات ورشة CODE TO MOTION','proj.p':'المشروع كامل جاهز للتشغيل: كل الدروس، والمشروع النهائي اللي في الفيديو، وقالب التحدي.','proj.dl':'حمّل المشروع (ZIP)','proj.prep':'أجهّز الملف…','proj.ok':'تم ✓ فك الضغط وشغّل الأوامر اللي تحت.','proj.alt':'لو ما بدأ التحميل، افتح الصفحة في تبويب جديد وجرّب.','proj.fail':'ما اكتمل التحميل. جرّب مرة ثانية.',
    'in1':'6 دروس|من useCurrentFrame إلى الصوت','in2':'المشروع النهائي|فيديو 12 ثانية بـ 4 مشاهد','in3':'قالب AboutMe|فيديو 10 ثواني عن نفسك','in4':'خطوط ومؤثرات|Cairo وأصوات جاهزة',
    'foot.by':'إعداد: عبدالرحمن مصطفى','foot.src':'المصادر:','copied':'تم النسخ ✓','copyFail':'ما قدرت أنسخ، حدّد النص وانسخه يدوي','langBtn':'English',
  },
  en: {
    'nav.glossary':'Glossary','nav.mytools':'My tools','try.h':'Try asking','try.p':'Tap any idea and get a ready prompt to paste into your agent.','try.s1':'Open the Terminal inside your project folder','try.s2':'Type claude (or start Codex)','try.s3':'Paste the prompt, press Enter, and check the result in Studio',
    'glo.h':'Glossary','glo.p':'Every word you hear in motion and AI, explained simply in two sentences.','glo.search':'Search a term…','gc.all':'All','gc.motion':'Motion','gc.ai':'AI','gc.dev':'Coding','glo.eg':'Example: ',
    'mt.h':'Tools I use','mt.p':'The tools we use in the workshop, what each one does, and when you need it.','mt.op':'My take: ','mt.visit':'Official site →','tc.motion':'Motion','tc.ai':'AI','tc.dev':'Code & publishing','tc.audio':'Audio','tc.video':'Video',
    'sr.h':'Search the site','sr.ph':'Lessons, skills, terms, tools…','sr.none':'Nothing found. Try another word.','sr.hint':'Type a word, like spring, audio or prompt.','sr.les':'Lessons','sr.lib':'Library','sr.glo':'Glossary','sr.tools':'My tools','sr.sc':'Ready scenes',
    'foot.about':'About','foot.contact':'Contact','foot.privacy':'Privacy','theme':'Toggle theme',
    'nav.home':'Home','nav.library':'Library','nav.tools':'Lab','nav.lessons':'Lessons','nav.gallery':'Gallery','nav.project':'Workshop files',
    'home.h1':'Everything you need to make motion graphics with code and AI','home.p':'Ready-made skills, agents, commands and prompts for Claude Code, Codex and Cursor, live playgrounds, and the full workshop lessons.',
    'home.cta1':'Browse the library','home.cta2':'Try motion live','home.start':'Where to start?','home.startp':'Four shortcuts, depending on where you are now.',
    'st.skills':'Skills','st.agents':'Agents & commands','st.prompts':'Ready prompts','st.scenes':'Ready scenes',
    'tile1.h':'First time?','tile1.p':'Take the lessons in order, about 10 minutes each.','tile1.b':'Start the lessons',
    'tile2.h':'Try it live','tile2.p':'Move the sliders and watch spring and interpolate change.','tile2.b':'Motion playground',
    'tile3.h':'Set up your agent','tile3.p':'Install the Remotion skill so it writes correct code.','tile3.b':'Open the library',
    'tile4.h':'Got an idea?','tile4.p':'Describe it and get a complete prompt for your agent.','tile4.b':'Prompt generator',
    'next.soon':'Next workshop… coming soon','next.follow':'Follow my accounts to hear the date first.','next.cta':'Workshop page on Luma','next.reg':'Register now','next.admin':'Edit the next workshop (only you see this)','next.f.title':'Workshop title','next.started':'The workshop has started! 🎬',
    'cd.d':'days','cd.h':'hours','cd.m':'minutes','cd.s':'seconds','save':'Save','saved':'Saved ✓','saveFail':'Not saved, try again',
    'news.h':'Get library updates','news.p':'When we add a skill, lesson or workshop, we send you a short email. No spam.','news.btn':'Subscribe','news.ok':'Subscribed ✓ Thank you','news.no':'Subscribing here is open to signed-in members. Follow @mostafaabodee8 or email mostafaabodee9@gmail.com','news.count':'Subscribers: ','news.copy':'Copy emails','pub.h':'Submit your work','pub.p':'Your work reaches me and appears in the gallery after review.','pub.need':'Add a post link or upload the video','pub.big':'The video is larger than 50MB','pub.type':'Accepted formats: MP4, WebM or MOV','pub.ok':'Received ✓ It will appear in the gallery after review','pub.ok2':'I agree to show my work and name in the gallery','pub.btn':'Send my work','pub.file':'Video file (optional, under 50MB)','news.mail':'We opened a ready email for you. Press send and you are on the list ✓',
    'lib.h':'Library','lib.p':'Press + to add to your install stack, or Details for the full explanation, prompt and file.','lib.search':'Search the library…','lib.empty':'Nothing here. Try another category or word.',
    'type.skill':'Skills','type.agent':'Agents','type.command':'Commands','type.mcp':'MCP','type.prompt':'Prompts',
    'cat.all':'All','cat.video':'Video & motion','cat.design':'Design','cat.docs':'Docs & decks','cat.dev':'Development','star':' · Recommended',
    'copy':'Copy','copyPrompt':'Copy prompt','copyFile':'Copy file','details':'Details →','add':'Add to stack','remove':'Remove from stack',
    'stack.h':'Install stack','stack.none':'Press + on any skill or MCP to collect install commands here','stack.empty':'Nothing added yet','stack.n':' in stack','stack.copy':'Copy all commands','stack.zip':'Download all agents & commands (ZIP)','stack.note':'Unzip inside your project folder and the files land in .claude automatically.',
    'md.use':'When to use it','md.install':'Install','md.file':'File','md.saveTo':'Save it to: ','md.prompt':'Prompt','md.fill':'Replace the parts in < > before sending.','md.try':'Try it with this prompt','md.copyInstall':'Copy install command','md.src':'Source','close':'Close',
    'tools.h':'Live playgrounds','tools.p':'Change the numbers, watch the motion change, and copy ready Remotion code.','tab.play':'Motion playground','tab.scenes':'Ready scenes','tab.prompt':'Prompt generator',
    'play.prop':'Property','play.from':'From frame','play.to':'To frame','sc.text':'Change the text','sc.code':'Copy code',
    'pg.type':'Video type','pg.dur':'Duration (seconds)','pg.size':'Size','pg.lang':'Text language','pg.text':'Main text or idea','pg.c1':'Main color','pg.c2':'Accent color','pg.style':'Style','pg.audio':'Audio','pg.extras':'Extras','pg.tip':'The prompt is in English because agents follow it more precisely; the on-screen text uses the language you chose.','pg.ph':'Example: an ad for a motion-graphics-with-code workshop on Saturday',
    'les.h':'Workshop lessons','les.p':'Each lesson has the idea, the code and a short exercise. Mark lessons as done and get your certificate at the end.','les.file':'File in the project: ','les.ex':'✍️ Exercise: ','les.prev':'← Previous lesson','les.next':'Next lesson →','les.share':'Share your work →','les.done':'✓ Lesson done','les.mark':'Mark as done','les.prog':'Your progress: ',
    'cert.h':'Lessons completion certificate','cert.lockP':'Finish all seven lessons to unlock your certificate.','cert.openP':'Congratulations! You finished every lesson. Type your name and make your certificate.','cert.name':'Your name as it should appear','cert.make':'Make certificate','cert.save':'Download certificate','cert.needName':'Type your name first','cert.lock':'🔒 ','cert.lock2':' lessons left','cert.ok':'Done ✓','cert.dlno':'Right-click the image to save it',
    'faq.h':'FAQ','gal.h':'Attendee gallery','gal.p':'Videos attendees made for the workshop challenge. Vote for your favorite.','gal.share':'Share your work','gal.how':'Make an "About me" video from the AboutMe template and post it with a mention of @mostafaabodee8. Selected works are added here.',
    'gal.add':'Add a work (only you see this)','gal.f.name':'Creator name','gal.f.title':'Work title','gal.f.link':'Post link (optional, starts with https://)','gal.f.file':'Video file (optional, under 20MB)','gal.f.save':'Add to gallery',
    'gal.loading':'Loading the gallery…','gal.empty':'The gallery is waiting for its first work. Be the first to share!','gal.out':'The gallery works when you open the page from its claude.ai link.','gal.signin':'Sign in to claude.ai to see the gallery.','gal.fail':'Could not load the gallery right now.','gal.watch':'Watch the post →','gal.voteNo':'Voting is open to registered attendees only','gal.https':'The link must start with https://','gal.big':'The video is larger than 20MB','gal.up':'Uploading video…','gal.ok':'Added ✓',
    'proj.h':'CODE TO MOTION workshop files','proj.p':'The full project, ready to run: every lesson, the final project from the video, and the challenge template.','proj.dl':'Download the project (ZIP)','proj.prep':'Preparing the file…','proj.ok':'Done ✓ Unzip and run the commands below.','proj.alt':'If the download did not start, open the page in a new tab and try again.','proj.fail':'The download did not finish. Try again.',
    'in1':'6 lessons|From useCurrentFrame to audio','in2':'Final project|A 12-second video in 4 scenes','in3':'AboutMe template|A 10-second video about you','in4':'Fonts & sounds|Cairo and ready sound effects',
    'foot.by':'By Abdulrahman Mostafa','foot.src':'Sources:','copied':'Copied ✓','copyFail':'Could not copy; select the text and copy it manually','langBtn':'عربي',
  },
};
const t = k => T[lang][k] ?? T.ar[k] ?? k;
const F = (item, field) => (lang === 'en' && EN.items[item.id] && EN.items[item.id][field]) || item[field];
const LF = (l, field) => (lang === 'en' && EN.lessons[l.id] && EN.lessons[l.id][field]) || l[field];

function applyLang() {
  document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-t]').forEach(el => { el.textContent = t(el.dataset.t); });
  $$('[data-tp]').forEach(el => { el.placeholder = t(el.dataset.tp); });
  $('#lang').textContent = t('langBtn');
  $('#g_text').placeholder = t('pg.ph');
  $('#inside').innerHTML = ['in1', 'in2', 'in3', 'in4'].map(k => { const [b, s] = t(k).split('|'); return `<li><b>${esc(b)}</b>${esc(s)}</li>`; }).join('');
  renderHome(); renderTypes(); renderLib(); renderLesson(); renderFaq(); renderScenes(); setupPromptForm(); renderCertPanel(); renderNext(); renderGallery(); drawPlay(); renderX();
}
$('#lang').addEventListener('click', () => { lang = lang === 'ar' ? 'en' : 'ar'; store.set('lang', lang); applyLang(); });

const toast = msg => { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1700); };
const copy = async text => { try { await navigator.clipboard.writeText(text); toast(t('copied')); } catch (e) { toast(t('copyFail')); } };
let downloads = null;
const capP = (window.claude && window.claude.use) ? Promise.resolve() : null;
if (capP) window.claude.use('downloads').then(d => { downloads = d; }).catch(() => {});
async function saveFile(filename, blob) {
  if (downloads) { await downloads.save({filename, data: blob}); return true; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); return false;
}

// ═════ البيانات ═════
const TYPES = [{id:'skill', list:C.SKILLS}, {id:'agent', list:C.AGENTS}, {id:'command', list:C.COMMANDS}, {id:'mcp', list:C.MCPS}, {id:'prompt', list:C.PROMPTS}];
const ALL = TYPES.flatMap(tp => tp.list.map(i => ({...i, key: tp.id + '-' + slug(i.id)})));
const CATS = [{id:'all'}, {id:'video', c:'#ff2e9a'}, {id:'design', c:'#7b2cff'}, {id:'docs', c:'#2f6bff'}, {id:'dev', c:'#00a37a'}];
const ICONS = {
  video:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
  design:'<path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.8 1.5-1.6 0-1.2-1-1.4-1-2.4 0-.9.7-1.5 1.6-1.5H16a5 5 0 0 0 5-5C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="11" cy="7.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/>',
  docs:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
  dev:'<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12"/>',
};
const icon = cat => { const c = CATS.find(x => x.id === cat) || CATS[1]; return `<div class="ico" style="background:${c.c}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[cat] || ICONS.dev}</svg></div>`; };
const latin = s => /^[a-z/]/i.test(String(s));

// ═════ الرئيسية ═════
function renderHome() {
  $('#stats').innerHTML = [[C.SKILLS.length, 'st.skills'], [C.AGENTS.length + C.COMMANDS.length, 'st.agents'], [C.PROMPTS.length, 'st.prompts'], [M.SCENES.length, 'st.scenes']].map(([n, k]) => `<div><b>${n}</b><span>${t(k)}</span></div>`).join('');
  $('#tiles').innerHTML = [['video', 1, '#lessons', ''], ['design', 2, '#tools', 'play'], ['dev', 3, '#library', ''], ['docs', 4, '#tools', 'prompt']]
    .map(([c, n, href, tab]) => `<a class="tile" href="${href}" data-tab-go="${tab}">${icon(c)}<h3>${t('tile' + n + '.h')}</h3><p>${t('tile' + n + '.p')}</p><b>${t('tile' + n + '.b')}</b></a>`).join('');
}

// ═════ المكتبة ═════
let type = 'skill', cat = 'all', q = '', stack = store.get('stack2', []).filter(k => ALL.some(i => i.key === k && i.cmd));
function renderTypes() {
  $('#types').innerHTML = TYPES.map(tp => `<button type="button" data-type="${tp.id}" aria-pressed="${tp.id === type}">${t('type.' + tp.id)}<small>${tp.list.length}</small></button>`).join('');
  $('#filters').innerHTML = CATS.map(c => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === cat}">${t('cat.' + c.id)}</button>`).join('');
}
function card(i) {
  const on = stack.includes(i.key), name = F(i, 'n');
  const snippet = i.cmd || i.path ? `<div class="cmd"><code>${esc(i.cmd || i.path)}</code></div>` : '';
  return `<article class="card">
    <div class="top">${icon(i.cat)}<div><h3 class="lt" ${latin(name) ? 'dir="ltr"' : ''}>${esc(name)}</h3><div class="src mono">${esc(i.src)}</div></div></div>
    <span class="tag">${t('cat.' + i.cat)}${i.star ? t('star') : ''}</span>
    <p>${esc(F(i, 'd'))}</p>${snippet}
    <div class="row">
      <button class="ib" type="button" data-copyitem="${i.key}">${t(i.cmd ? 'copy' : i.text ? 'copyPrompt' : 'copyFile')}</button>
      ${i.cmd ? `<button class="ib ${on ? 'on' : ''}" type="button" data-add="${i.key}" aria-pressed="${on}" aria-label="${t(on ? 'remove' : 'add')}">${on ? '✓' : '+'}</button>` : ''}
      <button class="more" type="button" data-open="${i.key}">${t('details')}</button>
    </div></article>`;
}
function renderLib() {
  const list = ALL.filter(i => i.type === type && (cat === 'all' || i.cat === cat) && (!q || [i.n, i.d, i.src, i.long, i.text, F(i, 'd'), F(i, 'n')].join(' ').toLowerCase().includes(q)));
  list.sort((a, b) => (b.star || 0) - (a.star || 0));
  $('#grid').innerHTML = list.length ? list.map(card).join('') : `<div class="empty">${t('lib.empty')}</div>`;
  const items = stack.map(k => ALL.find(i => i.key === k));
  $('#stackCount').textContent = items.length ? items.length + t('stack.n') : t('stack.empty');
  $('#stackBody').innerHTML = items.length
    ? `<ul>${items.map(i => `<li><span>${esc(i.n)}</span><button type="button" data-del="${i.key}" aria-label="${t('remove')}">×</button></li>`).join('')}</ul><pre>${esc([...new Set(items.map(i => i.cmd))].join('\n'))}</pre>`
    : `<div class="none">${t('stack.none')}</div>`;
  $('#copyAll').disabled = !items.length;
}
const copyText = i => i.cmd || i.text || i.file || '';

// نافذة التفاصيل
const dlg = $('#dlg');
function openItem(key, push = true) {
  const i = ALL.find(x => x.key === key); if (!i) return;
  const name = F(i, 'n'), use = F(i, 'use');
  $('#md').innerHTML = `
    <header>${icon(i.cat)}<div><h3 id="dTitle" class="lt" ${latin(name) ? 'dir="ltr"' : ''}>${esc(name)}</h3><div class="src mono" style="color:var(--mute);font-size:14px">${t('type.' + i.type)} · ${t('cat.' + i.cat)} · ${esc(i.src)}</div></div><button class="x" type="button" data-close aria-label="${t('close')}">×</button></header>
    <p>${esc(F(i, 'long') || F(i, 'd'))}</p>
    ${use ? `<h4>${t('md.use')}</h4><ul>${use.map(u => `<li>${esc(u)}</li>`).join('')}</ul>` : ''}
    ${i.cmd ? `<h4>${t('md.install')}</h4><pre>${esc(i.cmd)}</pre>` : ''}
    ${i.file ? `<h4>${t('md.file')}</h4><p class="path">${t('md.saveTo')}<code>${esc(i.path)}</code></p><pre>${esc(i.file)}</pre>` : ''}
    ${i.text ? `<h4>${t('md.prompt')}</h4><p class="path">${esc(t('md.fill'))}</p><pre>${esc(i.text)}</pre>` : ''}
    ${i.prompt ? `<h4>${t('md.try')}</h4><pre>${esc(i.prompt)}</pre>` : ''}
    <div class="acts">
      <button class="btn p" type="button" data-copyitem="${i.key}">${t(i.cmd ? 'md.copyInstall' : i.text ? 'copyPrompt' : 'copyFile')}</button>
      ${i.prompt ? `<button class="btn o" type="button" data-copy="${esc(i.prompt)}">${t('copyPrompt')}</button>` : ''}
      ${i.src.includes('/') ? `<a class="btn o" href="https://github.com/${esc(i.src.split(' ')[0])}">${t('md.src')}</a>` : ''}
    </div>`;
  if (!dlg.open) dlg.showModal();
  if (push && location.hash !== '#' + key) history.replaceState(null, '', '#' + key);
}
dlg.addEventListener('close', () => { if (ALL.some(i => '#' + i.key === location.hash)) history.replaceState(null, '', '#library'); });
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

// كل الوكلاء والأوامر في ملف ZIP
$('#zipAgents').addEventListener('click', async () => {
  const zip = new JSZip();
  [...C.AGENTS, ...C.COMMANDS].forEach(i => zip.file(i.path, i.file));
  zip.file('.claude/README.txt', 'CODE TO MOTION — agents & commands\nUnzip in your project root.\nAgents: .claude/agents  ·  Commands: .claude/commands (type / in Claude Code)\n');
  try { const ok = await saveFile('code-to-motion-agents.zip', await zip.generateAsync({type: 'blob'})); toast(ok ? t('proj.ok').split(' ')[0] + ' ✓' : t('proj.alt')); } catch (e) { toast(t('proj.fail')); }
});

// ═════ ملعب الحركة ═════
const PRESETS = [['bouncy', {damping: 4, stiffness: 100, mass: 1}], ['balanced', {damping: 12, stiffness: 100, mass: 1}], ['smooth', {damping: 200, stiffness: 100, mass: 1}], ['snappy', {damping: 20, stiffness: 300, mass: .5}], ['heavy', {damping: 15, stiffness: 80, mass: 3}]];
let pMode = 'spring', pFrame = 0, pPlaying = true;
const pv = id => +$('#' + id).value;
$('#presets').innerHTML = PRESETS.map(([n]) => `<button type="button" data-preset="${n}">${n}</button>`).join('');
function pValue(f) {
  if (pMode === 'spring') return M.spring({frame: f - pv('delay'), config: {damping: pv('damping'), stiffness: pv('stiffness'), mass: pv('mass')}});
  let a = pv('f0'), b = pv('f1'); if (b <= a) b = a + 1;
  return M.interpolate(f, [a, b], [0, 1], {clamp: $('#clamp').checked, easing: $('#easing').value});
}
const PROPS = {
  scale: v => `scale(${v})`, y: v => `translateY(${(1 - v) * 180}px)`, x: v => `translateX(${(1 - v) * -320}px)`, rotate: v => `rotate(${(1 - v) * -180}deg) scale(${Math.max(.2, Math.min(v, 1.4))})`, opacity: () => 'none',
};
function drawPlay() {
  ['damping', 'stiffness', 'mass', 'delay', 'f0', 'f1'].forEach(id => { const o = $('#o_' + id); if (o) o.textContent = $('#' + id).value; });
  $('#springCtl').hidden = pMode !== 'spring'; $('#interpCtl').hidden = pMode === 'spring';
  $$('#mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === pMode));
  const v = pValue(pFrame), prop = $('#prop').value, o = $('#pObj');
  o.style.transform = PROPS[prop](v); o.style.opacity = prop === 'opacity' ? Math.max(0, Math.min(1, v)) : 1;
  $('#pFrame').value = pFrame; $('#pFr').textContent = `frame ${pFrame} · ${v.toFixed(2)}`;
  // الرسم البياني
  const svg = $('#pSvg'), W = svg.clientWidth || 600, H = svg.clientHeight || 190, pad = 18;
  const vals = Array.from({length: 91}, (_, f) => pValue(f)), mx = Math.max(1.05, ...vals), mn = Math.min(0, ...vals);
  const X = f => pad + (W - 2 * pad) * (f / 90), Y = val => H - pad - (H - 2 * pad) * ((val - mn) / (mx - mn));
  const rtl = document.documentElement.dir === 'rtl';
  svg.innerHTML = `<line x1="${pad}" x2="${W - pad}" y1="${Y(1)}" y2="${Y(1)}" stroke="currentColor" stroke-opacity=".25" stroke-dasharray="4 4"/><line x1="${pad}" x2="${W - pad}" y1="${Y(0)}" y2="${Y(0)}" stroke="currentColor" stroke-opacity=".25"/>
    <polyline fill="none" stroke="#ff2e9a" stroke-width="3" stroke-linejoin="round" points="${vals.map((val, f) => X(f).toFixed(1) + ',' + Y(val).toFixed(1)).join(' ')}"/>
    <line x1="${X(pFrame)}" x2="${X(pFrame)}" y1="${pad / 2}" y2="${H - pad / 2}" stroke="#4ff0ff" stroke-width="2"/><circle cx="${X(pFrame)}" cy="${Y(v)}" r="6" fill="#4ff0ff"/>
    <text x="${W - pad}" y="${Y(1) - 6}" text-anchor="end" font-size="12" fill="currentColor" opacity=".6" font-family="JetBrains Mono">1</text>`;
  svg.style.color = 'var(--ink)'; svg.style.direction = 'ltr'; void rtl;
  // الكود
  const propCode = {scale: '`scale(${v})`', y: '`translateY(${(1 - v) * 180}px)`', x: '`translateX(${(1 - v) * -320}px)`', rotate: '`rotate(${(1 - v) * -180}deg)`', opacity: null}[prop];
  const style = prop === 'opacity' ? '{opacity: v}' : `{transform: ${propCode}}`;
  const calc = pMode === 'spring'
    ? `const {fps} = useVideoConfig();\nconst v = spring({\n  frame: frame - ${pv('delay')},\n  fps,\n  config: {damping: ${pv('damping')}, stiffness: ${pv('stiffness')}, mass: ${pv('mass')}},\n});`
    : `const v = interpolate(frame, [${pv('f0')}, ${Math.max(pv('f1'), pv('f0') + 1)}], [0, 1], {\n  ${$('#clamp').checked ? "extrapolateLeft: 'clamp',\n  extrapolateRight: 'clamp',\n  " : ''}easing: ${{'linear': 'Easing.linear', 'out(cubic)': 'Easing.out(Easing.cubic)', 'in(cubic)': 'Easing.in(Easing.cubic)', 'inOut(cubic)': 'Easing.inOut(Easing.cubic)', 'out(back)': 'Easing.out(Easing.back(1.7))'}[$('#easing').value]},\n});`;
  const imp = pMode === 'spring' ? 'AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig' : 'AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame';
  $('#pCode').textContent = `import {${imp}} from 'remotion';\n\nexport const MyMotion: React.FC = () => {\n  const frame = useCurrentFrame();\n  ${calc.split('\n').join('\n  ')}\n\n  return (\n    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>\n      <Img src={staticFile('logo.png')} style={${style}} />\n    </AbsoluteFill>\n  );\n};`;
}
$$('.ctl input, .ctl select').forEach(el => el.addEventListener('input', () => { if (!pPlaying) drawPlay(); }));
$('#pFrame').addEventListener('input', e => { pPlaying = false; $('#pPlay').textContent = '▶'; pFrame = +e.target.value; drawPlay(); });
$('#pPlay').addEventListener('click', () => { pPlaying = !pPlaying; $('#pPlay').textContent = pPlaying ? '❚❚' : '▶'; if (pPlaying && pFrame >= 90) pFrame = 0; });
$('#pCopy').addEventListener('click', () => copy($('#pCode').textContent));

// مسارح المعاينة تتكبّر حسب العرض
const fit = new ResizeObserver(es => es.forEach(e => e.target.style.setProperty('--s', e.contentRect.width / 960)));
const observeStages = () => $$('.stage').forEach(s => fit.observe(s));

// ═════ مشاهد جاهزة ═════
const scText = {};
function renderScenes() {
  $('#scgrid').innerHTML = M.SCENES.map(s => `<article class="sc"><div class="stage" data-scene="${s.id}"><div class="inner"></div></div>
    <div class="in"><h3>${esc(s[lang] || s.ar)}</h3><p>${esc(lang === 'en' ? s.den : s.dar)}</p>
    ${s.id !== 'bars' ? `<input class="field" data-sctext="${s.id}" maxlength="60" placeholder="${t('sc.text')}" value="${esc(scText[s.id] || '')}">` : ''}
    <div class="row"><button class="ib" type="button" data-sccode="${s.id}">${t('sc.code')}</button></div></div></article>`).join('');
  observeStages();
}
document.addEventListener('input', e => { if (e.target.dataset.sctext) scText[e.target.dataset.sctext] = e.target.value; });

// ═════ مولّد البرومبت ═════
const G = {
  type: [['intro', 'افتتاحية قناة', 'Channel intro'], ['promo', 'إعلان منتج أو خدمة', 'Product / service promo'], ['explainer', 'فيديو شرح', 'Explainer'], ['quote', 'اقتباس متحرك', 'Kinetic quote'], ['event', 'إعلان فعالية أو ورشة', 'Event / workshop announcement'], ['stats', 'أرقام وإحصائيات', 'Stats & numbers']],
  style: [['bold', 'جريء وملوّن', 'bold and colorful'], ['minimal', 'هادي وبسيط', 'calm and minimal'], ['cinematic', 'سينمائي', 'cinematic'], ['playful', 'مرح', 'playful']],
  audio: [['music', 'موسيقى خلفية', 'background music'], ['voice', 'تعليق صوتي (ملف جاهز)', 'voice-over file'], ['sfx', 'مؤثرات بس', 'sound effects only'], ['none', 'بدون صوت', 'no audio']],
  extras: [['logo', 'شعاري', 'my logo'], ['captions', 'ترجمة كلمة كلمة', 'word captions'], ['cta', 'دعوة للتسجيل', 'call to action'], ['template', 'قالب قابل للتعديل', 'editable template'], ['transitions', 'انتقالات بين المشاهد', 'scene transitions']],
};
const pick = (arr, v) => arr.find(x => x[0] === v);
function setupPromptForm() {
  const keep = {type: $('#g_type').value, style: $('#g_style').value, audio: $('#g_audio').value, ex: [...$$('#g_extras input:checked')].map(i => i.value)};
  const opts = (arr, cur) => arr.map(([v, a, e]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${lang === 'en' ? e : a}</option>`).join('');
  $('#g_type').innerHTML = opts(G.type, keep.type || 'event'); $('#g_style').innerHTML = opts(G.style, keep.style || 'bold'); $('#g_audio').innerHTML = opts(G.audio, keep.audio || 'music');
  const ex = keep.ex.length || $('#g_extras').dataset.init ? keep.ex : ['logo', 'transitions', 'template'];
  $('#g_extras').dataset.init = 1;
  $('#g_extras').innerHTML = G.extras.map(([v, a, e]) => `<label><input type="checkbox" value="${v}" ${ex.includes(v) ? 'checked' : ''}>${lang === 'en' ? e : a}</label>`).join('');
  genPrompt();
}
function genPrompt() {
  const ty = pick(G.type, $('#g_type').value), st = pick(G.style, $('#g_style').value), au = pick(G.audio, $('#g_audio').value);
  const dur = Math.max(3, Math.min(120, +$('#g_dur').value || 15)), [w, h] = $('#g_size').value.split('x'), frames = dur * 30;
  const ar = $('#g_lang').value === 'ar', ex = [...$$('#g_extras input:checked')].map(i => i.value);
  const text = $('#g_text').value.trim() || (ar ? 'ورشة موشن جرافيك بالكود' : 'Motion graphics with code workshop');
  const scenes = Math.max(2, Math.min(6, Math.round(dur / 4)));
  const L = [];
  L.push(`Create a ${dur}-second Remotion video (${w}x${h}, 30fps, durationInFrames: ${frames}).`);
  L.push(`Type: ${ty[2]}. Style: ${st[2]}.`, '');
  L.push(`Main message:\n"${text}"`, '');
  L.push(`Plan ${scenes} scenes first (purpose, frames, main motion), then build them:`);
  L.push(`- Scene 1: hook — the key idea in a few bold words, appearing word by word with spring().`);
  if (scenes > 2) L.push(`- Middle scenes: develop the message, one idea per scene, one main movement each.`);
  L.push(`- Last scene: ${ex.includes('cta') ? 'call to action with the link/date, clear and big' : 'strong closing line'}${ex.includes('logo') ? ' and the logo from public/logo.png bouncing in' : ''}.`, '');
  L.push(`Design:`);
  L.push(`- Colors: main ${$('#g_c1').value}, accent ${$('#g_c2').value}, dark background.`);
  L.push(ar ? `- All on-screen text in Arabic, direction 'rtl', Cairo font loaded locally from public/fonts.` : `- All on-screen text in English, a clean bold sans-serif font.`);
  L.push(`- Keep text inside a 5% safe margin; entrances with spring(), fades with interpolate() + clamp.`);
  if (ex.includes('transitions')) L.push(`- Use TransitionSeries with fade and slide (15-20 frames) between scenes.`);
  if (ex.includes('captions')) L.push(`- Add word-by-word captions at the bottom, current word in the accent color.`);
  L.push('', 'Audio:');
  L.push({music: '- Background music from public/ at volume 0.3, fade in/out; whoosh on scene changes.', voice: '- Voice-over from public/voice.mp3. Detect its pauses with ffmpeg silencedetect and start each scene with its phrase. Music under it at 0.15.', sfx: '- Short sound effects on key moments (pop, whoosh, hit), no music.', none: '- No audio.'}[au[0]]);
  if (ex.includes('template')) L.push('', `Make all texts and colors editable props with a Zod schema (zColor for colors) and register defaultProps.`);
  L.push('', 'Register the composition in src/Root.tsx, run npx tsc --noEmit, then render one still per scene and fix any layout problem.');
  $('#g_out').textContent = L.join('\n');
}
$('#pform').addEventListener('input', genPrompt);
$('#g_copy').addEventListener('click', () => copy($('#g_out').textContent));

// ═════ الدروس والتقدّم والشهادة ═════
let li = Math.min(store.get('lesson', 0), C.LESSONS.length - 1), done = store.get('done', []);
function renderLesson() {
  const n = C.LESSONS.length, d = done.length;
  $('#progT').textContent = t('les.prog') + d + ' / ' + n; $('#progBar').style.width = (d / n * 100) + '%';
  $('#ltoc').innerHTML = C.LESSONS.map((l, k) => `<button type="button" role="tab" data-lesson="${k}" aria-current="${k === li}" class="${done.includes(l.id) ? 'done' : ''}"><span>${done.includes(l.id) ? '✓' : k < 6 ? k + 1 : '★'}</span>${esc(LF(l, 't'))}</button>`).join('');
  const l = C.LESSONS[li], isDone = done.includes(l.id);
  $('#lesson').innerHTML = `${l.video ? `<video src="${l.video}" controls playsinline preload="metadata" poster="${l.img}"></video>` : `<img src="${l.img}" alt="">`}
    <div class="in"><h3 class="lt" dir="auto">${esc(LF(l, 't'))}</h3><p class="sub">${esc(LF(l, 's'))}</p>${LF(l, 'p').map(p => `<p>${esc(p)}</p>`).join('')}
    <pre>${esc(l.code)}</pre><p style="color:var(--mute);font-size:14px">${t('les.file')}<code>${esc(l.file)}</code></p>
    <div class="ex">${t('les.ex')}${esc(LF(l, 'ex'))}</div>
    <div class="lnav"><button class="donebtn" type="button" data-done="${l.id}" aria-pressed="${isDone}">${t(isDone ? 'les.done' : 'les.mark')}</button>
    <span style="display:flex;gap:10px;flex-wrap:wrap">${li > 0 ? `<button class="btn o" type="button" data-lesson="${li - 1}">${t('les.prev')}</button>` : ''}${li < n - 1 ? `<button class="btn p" type="button" data-lesson="${li + 1}">${t('les.next')}</button>` : `<a class="btn p" href="#gallery">${t('les.share')}</a>`}</span></div></div>`;
  store.set('lesson', li); renderCertPanel();
}
function renderFaq() { const list = lang === 'en' ? EN.faq : C.FAQ; $('#faq').innerHTML = list.map(([qq, a]) => `<details><summary>${esc(qq)}</summary><p>${esc(a)}</p></details>`).join(''); }
let certBlob = null;
function renderCertPanel() {
  const left = C.LESSONS.length - done.length, open = left <= 0;
  $('#certP').textContent = t(open ? 'cert.openP' : 'cert.lockP');
  $('#certName').hidden = !open; $('#certMake').hidden = !open;
  if (!certBlob) $('#certView').innerHTML = `<div class="lock">${open ? '🎓' : t('cert.lock') + left + t('cert.lock2')}</div>`;
}
async function makeCert() {
  const name = $('#certName').value.trim(); if (!name) { $('#certMsg').textContent = t('cert.needName'); return; }
  await document.fonts.load('900 80px Cairo'); await document.fonts.load('700 40px Cairo');
  const cv = $('#certCanvas'), x = cv.getContext('2d'), W = cv.width, H = cv.height;
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#2a0a73'); g.addColorStop(.55, '#14063f'); g.addColorStop(1, '#3a0c5c'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  const blob = (cx, cy, r, c) => { const rg = x.createRadialGradient(cx, cy, 0, cx, cy, r); rg.addColorStop(0, c); rg.addColorStop(1, 'transparent'); x.fillStyle = rg; x.fillRect(0, 0, W, H); };
  blob(W * .9, H * .1, 600, '#ff2e9a66'); blob(W * .1, H * .95, 600, '#2f6bff77');
  x.strokeStyle = '#ffffff55'; x.lineWidth = 3; x.strokeRect(50, 50, W - 100, H - 100);
  x.strokeStyle = '#ffd84d'; x.lineWidth = 2; x.strokeRect(70, 70, W - 140, H - 140);
  const logo = new Image(); logo.src = 'logo.png'; await logo.decode().catch(() => {});
  if (logo.complete && logo.naturalWidth) { x.save(); x.beginPath(); x.roundRect(W / 2 - 80, 120, 160, 160, 34); x.clip(); x.drawImage(logo, W / 2 - 80, 120, 160, 160); x.restore(); }
  x.textAlign = 'center'; x.direction = 'rtl';
  x.fillStyle = '#4ff0ff'; x.font = '700 40px Cairo'; x.fillText('CODE TO MOTION', W / 2, 345);
  x.fillStyle = '#fff'; x.font = '900 76px Cairo'; x.fillText(lang === 'en' ? 'Certificate of Completion' : 'شهادة إتمام', W / 2, 450);
  x.fillStyle = '#d3caf2'; x.font = '400 34px Cairo'; x.fillText(lang === 'en' ? 'This certifies that' : 'تشهد ورشة CODE TO MOTION بأن', W / 2, 530);
  x.fillStyle = '#ffd84d'; x.font = '900 92px Cairo'; x.direction = /[؀-ۿ]/.test(name) ? 'rtl' : 'ltr'; x.fillText(name, W / 2, 650); x.direction = 'rtl';
  x.fillStyle = '#d3caf2'; x.font = '400 34px Cairo';
  x.fillText(lang === 'en' ? 'completed all lessons of the CODE TO MOTION workshop:' : 'أتم جميع دروس ورشة صناعة الموشن جرافيك بالكود باستخدام', W / 2, 740);
  x.fillStyle = '#fff'; x.font = '700 40px Cairo'; x.fillText(lang === 'en' ? 'Motion graphics with code using Remotion' : 'Remotion والذكاء الاصطناعي', W / 2, 800);
  const date = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-SA-u-nu-latn', {year: 'numeric', month: 'long', day: 'numeric'});
  x.font = '400 28px Cairo'; x.fillStyle = '#d3caf2';
  x.fillText(date, W * .27, 960); x.fillText(lang === 'en' ? 'Abdulrahman Mostafa' : 'عبدالرحمن مصطفى', W * .73, 960);
  x.strokeStyle = '#ffffff66'; x.lineWidth = 2; [W * .27, W * .73].forEach(cx => { x.beginPath(); x.moveTo(cx - 170, 910); x.lineTo(cx + 170, 910); x.stroke(); });
  x.font = '700 22px Cairo'; x.fillStyle = '#ffffff88'; x.fillText(lang === 'en' ? 'Date' : 'التاريخ', W * .27, 1000); x.fillText(lang === 'en' ? 'Instructor' : 'المدرب', W * .73, 1000);
  certBlob = await new Promise(r => cv.toBlob(r, 'image/png'));
  $('#certView').innerHTML = `<img alt="" src="${URL.createObjectURL(certBlob)}">`;
  $('#certSave').hidden = false; $('#certMsg').textContent = t('cert.ok');
}
$('#certMake').addEventListener('click', makeCert);
$('#certSave').addEventListener('click', async () => { if (!certBlob) return; try { const ok = await saveFile('certificate-code-to-motion.png', certBlob); if (!ok) $('#certMsg').textContent = t('cert.dlno'); } catch (e) { $('#certMsg').textContent = t('cert.dlno'); } });

// ═════ قاعدة البيانات: الورشة الجاية، النشرة، المعرض ═════
const B = window.CTM_BACKEND;
function loadWorks() { B.approvedWorks().then(list => { works = list; galState = 'ok'; renderGallery(); }).catch(() => { galState = 'fail'; renderGallery(); }); }
let STATIC = false, db = null, user = null, me = null, isEditor = false, nextData = null, works = [], votes = {}, subs = [], galState = 'loading';
async function initDb() {
  if (!(window.claude && window.claude.use)) { // موقع عادي (GitHub Pages): البيانات من مجلد data
    STATIC = true;
    if (B) {
      B.getSettings().then(d => { nextData = d && d.next_date ? {title: d.next_title, date: d.next_date, link: d.next_link} : null; renderNext(); }).catch(() => {});
      loadWorks(); $('#pubForm').hidden = false;
    } else {
      fetch('data/next.json').then(r => r.json()).then(d => { nextData = d && d.date ? d : null; renderNext(); }).catch(() => {});
      fetch('data/gallery.json').then(r => r.json()).then(d => { works = (d || []).map((w, k) => ({id: 'g' + k, ...w})); galState = 'ok'; renderGallery(); }).catch(() => { galState = 'fail'; renderGallery(); });
    }
    return;
  }
  const timer = setTimeout(() => { if (galState === 'loading') { galState = 'fail'; renderGallery(); } }, 10000);
  try {
    db = await window.claude.use('db'); user = await window.claude.use('user');
    if (!db) { clearTimeout(timer); galState = 'signin'; renderGallery(); return; }
    me = user ? await user.id() : null;
    isEditor = user ? !!(await user.canEdit()) : false;
    db.doc('site/next').onSnapshot(s => { nextData = s.exists ? s.data() : null; renderNext(); }, () => {});
    db.collection('works').onSnapshot(s => { clearTimeout(timer); galState = 'ok'; works = s.docs.map(d => ({id: d.id, ...d.data()})); renderGallery(); }, () => { clearTimeout(timer); galState = 'fail'; renderGallery(); });
    db.collection('votes').onSnapshot(s => { votes = {}; s.docs.forEach(d => votes[d.id] = d.data()); renderGallery(); }, () => {});
    if (isEditor) {
      $('#nextAdmin').hidden = false; setupGalleryAdmin();
      db.collection('subs').onSnapshot(s => { subs = s.docs.map(d => d.data().email).filter(Boolean); $('#newsAdmin').hidden = false; $('#newsCount').textContent = t('news.count') + subs.length; }, () => {});
    }
  } catch (e) { clearTimeout(timer); galState = 'fail'; renderGallery(); }
}

// الورشة الجاية + العد التنازلي
function renderNext() {
  const has = nextData && nextData.date;
  $('#nextTitle').textContent = has ? (nextData.title || t('next.soon')) : t('next.soon');
  if (has) { const d = new Date(nextData.date); $('#nextWhen').textContent = d.toLocaleString(lang === 'en' ? 'en-US' : 'ar-SA-u-nu-latn', {weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit'}); }
  else $('#nextWhen').textContent = t('next.follow');
  const link = has && /^https:\/\//.test(nextData.link || '') ? nextData.link : 'https://lu.ma/34qf5z1h';
  $('#nextLink').href = link; $('#nextLink').textContent = t(has ? 'next.reg' : 'next.cta');
  if (isEditor && nextData && !$('#nTitle').value) { $('#nTitle').value = nextData.title || ''; $('#nLink').value = nextData.link || ''; if (nextData.date) $('#nDate').value = nextData.date.slice(0, 16); }
  tickCd();
}
function tickCd() {
  const el = $('#cd');
  if (!(nextData && nextData.date)) { el.innerHTML = ['cd.d', 'cd.h', 'cd.m', 'cd.s'].map(k => `<div><b>--</b><span>${t(k)}</span></div>`).join(''); return; }
  let s = Math.max(0, Math.floor((new Date(nextData.date) - Date.now()) / 1000));
  if (s === 0) { el.innerHTML = `<div style="grid-column:1/-1"><b style="font-size:28px">${t('next.started')}</b></div>`; return; }
  const parts = [Math.floor(s / 86400), Math.floor(s % 86400 / 3600), Math.floor(s % 3600 / 60), s % 60];
  el.innerHTML = parts.map((v, k) => `<div><b>${String(v).padStart(2, '0')}</b><span>${t(['cd.d', 'cd.h', 'cd.m', 'cd.s'][k])}</span></div>`).join('');
}
setInterval(() => { if (!$('[data-view=home]').hidden && nextData && nextData.date) tickCd(); }, 1000);
$('#nextAdmin').addEventListener('submit', async e => {
  e.preventDefault(); const link = $('#nLink').value.trim(), msg = $('#nMsg');
  if (link && !/^https:\/\//.test(link)) { msg.textContent = t('gal.https'); return; }
  const date = $('#nDate').value ? new Date($('#nDate').value).toISOString() : '';
  try { await db.doc('site/next').set({title: $('#nTitle').value.trim(), date, link}); msg.textContent = t('saved'); } catch (err) { msg.textContent = t('saveFail'); }
});

// النشرة البريدية
$('#newsForm').addEventListener('submit', async e => {
  e.preventDefault(); const email = $('#newsEmail').value.trim(), msg = $('#newsMsg');
  if (STATIC && B) { try { await B.subscribe(email, lang); msg.textContent = t('news.ok'); $('#newsForm').reset(); } catch (err) { msg.textContent = t('saveFail'); } return; }
  if (STATIC) { location.href = 'mailto:mostafaabodee9@gmail.com?subject=' + encodeURIComponent('اشتراك في نشرة CODE TO MOTION') + '&body=' + encodeURIComponent(email); msg.textContent = t('news.mail'); return; }
  if (!db || !me) { msg.textContent = t('news.no'); return; }
  try { await db.doc('subs/' + me).set({email, at: Date.now()}); msg.textContent = t('news.ok'); $('#newsForm').reset(); } catch (err) { msg.textContent = t('news.no'); }
});
$('#newsCopy').addEventListener('click', () => copy(subs.join(', ')));

// المعرض
function renderGallery() {
  const el = $('#gal');
  if (galState !== 'ok') { el.innerHTML = `<div class="empty">${t({loading: 'gal.loading', out: 'gal.out', signin: 'gal.signin', fail: 'gal.fail'}[galState])}</div>`; return; }
  const vc = id => Object.values(votes).filter(v => (v.ids || []).includes(id)).length;
  const mineIds = (votes[me] && votes[me].ids) || [];
  const count = w => STATIC ? (w.votes || 0) : vc(w.id), isMine = w => STATIC ? !!w.mine : mineIds.includes(w.id);
  const list = [...works].sort((a, b) => count(b) - count(a));
  el.innerHTML = list.length ? list.map(w => {
    const link = /^https:\/\//.test(w.link || '') ? w.link : '';
    const media = /^https:\/\//.test(w.videoUrl || '') ? `<video src="${esc(w.videoUrl)}" controls playsinline preload="metadata"></video>` : w.video && /^[\w\-./]+$/.test(w.video) ? `<video src="${esc(w.video)}" controls playsinline preload="metadata"></video>` : w.asset ? `<video src="/_blob/${encodeURIComponent(w.asset)}" controls playsinline preload="metadata"></video>` : `<div class="ph">${esc((w.name || '?').slice(0, 1))}</div>`;
    return `<article class="work">${media}<div class="in"><h3>${esc(w.title)}</h3><div class="by">${esc(w.name)}</div>
      <div class="row">${STATIC && !B ? '' : `<button class="vote ${isMine(w) ? 'on' : ''}" type="button" data-vote="${esc(w.id)}" aria-pressed="${isMine(w)}">♥ ${count(w)}</button>`}${link ? `<a style="margin-inline-start:auto;color:var(--pink);font-weight:900" href="${esc(link)}">${t('gal.watch')}</a>` : ''}</div></div></article>`;
  }).join('') : `<div class="empty">${t('gal.empty')}</div>`;
}
let voting = false;
async function vote(id) {
  if (STATIC && B) { if (voting) return; voting = true; try { await B.toggleVote(id); loadWorks(); } catch (e) { toast(t('saveFail')); } voting = false; return; }
  if (!db || !me) { toast(t('gal.voteNo')); return; }
  if (voting) return; voting = true;
  const cur = (votes[me] && votes[me].ids) || [];
  try { await db.doc('votes/' + me).set({ids: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]}); } catch (e) { toast(t('gal.voteNo')); }
  voting = false;
}
async function setupGalleryAdmin() {
  const f = $('#admin'); f.hidden = false;
  const assets = await window.claude.use('assets');
  if (!assets) $('#wFile').closest('label').hidden = true;
  f.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('#wMsg'), btn = $('#wSave'), link = $('#wLink').value.trim();
    if (link && !/^https:\/\//.test(link)) { msg.textContent = t('gal.https'); return; }
    btn.disabled = true; msg.textContent = '…';
    try {
      let asset = ''; const file = $('#wFile').files[0];
      if (file && assets) { if (file.size > 20 * 1024 * 1024) throw new Error('size'); msg.textContent = t('gal.up'); asset = (await assets.upload(file)).id; }
      await db.doc('works/w' + Date.now().toString(36)).set({name: $('#wName').value.trim(), title: $('#wTitle').value.trim(), link, asset, at: Date.now()});
      f.reset(); msg.textContent = t('gal.ok');
    } catch (err) { msg.textContent = err.message === 'size' ? t('gal.big') : t('saveFail'); }
    btn.disabled = false;
  });
}

// نموذج رفع الأعمال للزوار (يظهر على الموقع العام)
$('#pubForm').addEventListener('submit', async e => {
  e.preventDefault();
  const msg = $('#pMsg'), btn = $('#pSave'), link = $('#pLink').value.trim(), file = $('#pFile').files[0];
  if (link && !/^https:\/\//.test(link)) { msg.textContent = t('gal.https'); return; }
  if (!link && !file) { msg.textContent = t('pub.need'); return; }
  if (file && file.size > 50 * 1024 * 1024) { msg.textContent = t('pub.big'); return; }
  btn.disabled = true; msg.textContent = file ? t('gal.up') : '…';
  try { await B.submitWork({name: $('#pName').value.trim(), title: $('#pTitle').value.trim(), link, file}); $('#pubForm').reset(); msg.textContent = t('pub.ok'); }
  catch (err) { msg.textContent = err.message === 'type' ? t('pub.type') : t('saveFail'); }
  btn.disabled = false;
});

// ═════ تحميل المشروع ═════
$('#dl').addEventListener('click', async () => {
  const btn = $('#dl'), msg = $('#dlMsg'); btn.disabled = true; msg.textContent = t('proj.prep');
  try {
    let ok;
    if (STATIC) { const a = document.createElement('a'); a.href = 'code-to-motion.zip'; a.download = 'code-to-motion.zip'; document.body.appendChild(a); a.click(); a.remove(); ok = true; }
    else { const files = await (await fetch('project.json')).json(); const zip = new JSZip();
      for (const [p, b64] of Object.entries(files)) zip.file(p, b64, {base64: true});
      ok = await saveFile('code-to-motion.zip', await zip.generateAsync({type: 'blob'})); }
    msg.textContent = t(ok ? 'proj.ok' : 'proj.alt');
  } catch (e) { msg.textContent = t('proj.fail'); }
  btn.disabled = false;
});

// ═════ التنقل ═════
const VIEWS = ['home', 'library', 'tools', 'lessons', 'gallery', 'project', 'glossary', 'mytools', 'search', 'about', 'contact', 'privacy'];
let toolTab = 'play';
function setTab(tab) { toolTab = tab; $$('#toolTabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab)); $$('.panel').forEach(p => p.hidden = p.dataset.panel !== tab); observeStages(); if (tab === 'play') drawPlay(); }
function route() {
  const h = location.hash.slice(1), item = ALL.find(i => i.key === h);
  const v = item ? 'library' : (VIEWS.includes(h) ? h : 'home');
  $$('.view').forEach(s => s.hidden = s.dataset.view !== v);
  $$('.nav nav a').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + v ? 'page' : 'false'));
  if (item) { if (type !== item.type) { type = item.type; cat = 'all'; renderTypes(); renderLib(); } openItem(h, false); }
  else { if (dlg.open) dlg.close(); window.scrollTo(0, 0); }
  if (v === 'tools') { observeStages(); drawPlay(); }
  if (v === 'search') setTimeout(() => $('#sq').focus(), 60);
  if (v === 'glossary' && gHL) setTimeout(() => { const el = document.getElementById('g-' + gHL); if (el) el.scrollIntoView({block: 'center'}); }, 60);
}
addEventListener('hashchange', route);

document.addEventListener('click', e => {
  const el = e.target.closest('button,a.tile'); if (!el) return;
  const d = el.dataset;
  if (el.matches('a.tile')) { if (d.tabGo) setTab(d.tabGo); return; }
  if (d.copy !== undefined) copy(d.copy);
  else if (d.copyitem) copy(copyText(ALL.find(i => i.key === d.copyitem)));
  else if (d.type) { type = d.type; cat = 'all'; renderTypes(); renderLib(); }
  else if (d.cat) { cat = d.cat; renderTypes(); renderLib(); }
  else if (d.add) { stack = stack.includes(d.add) ? stack.filter(x => x !== d.add) : [...stack, d.add]; store.set('stack2', stack); renderLib(); }
  else if (d.del) { stack = stack.filter(x => x !== d.del); store.set('stack2', stack); renderLib(); }
  else if (d.open) openItem(d.open);
  else if (d.close !== undefined) dlg.close();
  else if (d.lesson !== undefined) { li = +d.lesson; renderLesson(); $('#lesson').scrollIntoView({block: 'start'}); }
  else if (d.done) { done = done.includes(d.done) ? done.filter(x => x !== d.done) : [...done, d.done]; store.set('done', done); renderLesson(); }
  else if (d.vote) vote(d.vote);
  else if (d.tab) setTab(d.tab);
  else if (d.mode) { pMode = d.mode; pFrame = 0; drawPlay(); }
  else if (d.preset) { const p = PRESETS.find(x => x[0] === d.preset)[1]; Object.entries(p).forEach(([k, v]) => $('#' + k).value = v); pFrame = 0; drawPlay(); }
  else if (d.sccode) copy(M.SCENES.find(s => s.id === d.sccode).code);
});
$('#copyAll').addEventListener('click', () => { const items = stack.map(k => ALL.find(i => i.key === k)); if (items.length) copy([...new Set(items.map(i => i.cmd))].join('\n')); });
$('#q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); renderLib(); });
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); location.hash = 'library'; setTimeout(() => $('#q').focus(), 50); } });

// ═════ حلقة الرسم: الملعب والمشاهد ═════
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let last = 0, scFrame = 0;
function loop(ts) {
  if (ts - last >= 1000 / 30) {
    last = ts;
    const tools = !$('[data-view=tools]').hidden;
    if (tools && toolTab === 'play' && pPlaying) { pFrame = pFrame >= 90 ? 0 : pFrame + 1; drawPlay(); }
    if (tools && toolTab === 'scenes') {
      scFrame++;
      $$('.stage[data-scene]').forEach(st => { const s = M.SCENES.find(x => x.id === st.dataset.scene); const f = reduce ? s.frames - 1 : scFrame % (s.frames + 30); st.firstElementChild.innerHTML = s.render(Math.min(f, s.frames), scText[s.id]); });
    }
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// تيرمنال الرئيسية
const LINES = [['c', '$ npx skills add remotion-dev/skills'], ['g', '  ✓ remotion-best-practices installed'], ['c', '$ claude mcp add --transport http context7 https://mcp.context7.com/mcp'], ['g', '  ✓ Added MCP server context7'], ['c', '$ claude'], ['d', '  > /new-scene logo bounces in, title word by word']];
const pre = $('#typed');
if (reduce) pre.innerHTML = LINES.map(([k, s]) => `<span class="${k}">${esc(s)}</span>`).join('\n');
else { let l = 0, ci = 0, out = ''; const tick = () => {
  if (l >= LINES.length) { pre.innerHTML = out + '<span class="cur"></span>'; setTimeout(() => { l = 0; ci = 0; out = ''; tick(); }, 3500); return; }
  const [k, s] = LINES[l], fast = k !== 'c'; ci = fast ? s.length : ci + 1;
  pre.innerHTML = out + `<span class="${k}">${esc(s.slice(0, ci))}</span><span class="cur"></span>`;
  if (ci >= s.length) { out += `<span class="${k}">${esc(s)}</span>\n`; l++; ci = 0; setTimeout(tick, fast ? 380 : 500); } else setTimeout(tick, 34);
}; tick(); }


// ═════ الأقسام الجديدة: جرّب تطلب، المصطلحات، أدواتي، البحث، الصفحات، الوضع الداكن ═════
const X = window.CTM_X;
let tryI = 0, gcat = 'all', gq = '', gHL = '';
function renderTry() {
  $('#tryChips').innerHTML = X.tryAsk.map((x, i) => `<button type="button" data-try="${i}" aria-pressed="${i === tryI}">${esc(lang === 'en' ? x.en : x.ar)}</button>`).join('');
  $('#tryOut').textContent = X.tryAsk[tryI].p;
}
$('#tryCopy').addEventListener('click', () => copy($('#tryOut').textContent));
function renderGlossary() {
  $('#gfilters').innerHTML = ['all', 'motion', 'ai', 'dev'].map(c => `<button type="button" data-gcat="${c}" aria-pressed="${c === gcat}">${t('gc.' + c)}</button>`).join('');
  const list = X.glossary.filter(([n, c, a, e]) => (gcat === 'all' || c === gcat) && (!gq || (n + ' ' + a + ' ' + e).toLowerCase().includes(gq)));
  $('#glo').innerHTML = list.length ? list.map(([n, c, a, e, eg]) => `<article class="term-c ${slug(n) === gHL ? 'hl' : ''}" id="g-${slug(n)}"><h3>${esc(n)}</h3><p>${esc(lang === 'en' ? e : a)}</p>${eg && lang !== 'en' ? `<div class="eg">${t('glo.eg')}${esc(eg)}</div>` : ''}</article>`).join('') : `<div class="empty">${t('sr.none')}</div>`;
}
$('#gq').addEventListener('input', e => { gq = e.target.value.trim().toLowerCase(); gHL = ''; renderGlossary(); });
function renderMyTools() {
  $('#mytoolsGrid').innerHTML = X.tools.map(x => { const op = lang === 'en' ? x.opinionEn : x.opinion; return `<article class="card mt"><div class="top">${icon({motion: 'video', ai: 'dev', dev: 'docs', audio: 'video', video: 'design'}[x.cat] || 'dev')}<div><h3 class="lt" dir="ltr">${esc(x.n)}</h3><div class="src">${t('tc.' + x.cat)}</div></div></div><p>${esc(lang === 'en' ? x.den : x.d)}</p>${op ? `<div class="op">${t('mt.op')}${esc(op)}</div>` : ''}<div class="row"><a class="more" style="text-decoration:none" href="${esc(x.url)}" target="_blank" rel="noopener">${t('mt.visit')}</a></div></article>`; }).join('');
}
function renderSearch() {
  const q = ($('#sq').value || '').trim().toLowerCase(), box = $('#sres');
  if (q.length < 2) { box.innerHTML = `<p class="lead">${t('sr.hint')}</p>`; return; }
  const has = (...f) => f.join(' ').toLowerCase().includes(q);
  const groups = [
    ['sr.les', C.LESSONS.map((l, k) => [l, k]).filter(([l]) => has(l.t, l.s, l.p.join(' '), LF(l, 't'), LF(l, 's'), LF(l, 'p').join(' '), l.code)).map(([l, k]) => ({t: LF(l, 't'), d: LF(l, 's'), go: 'lesson:' + k}))],
    ['sr.lib', ALL.filter(i => has(i.n, i.d, F(i, 'd'), F(i, 'n'), i.src)).map(i => ({t: F(i, 'n'), d: F(i, 'd'), go: '#' + i.key}))],
    ['sr.glo', X.glossary.filter(([n, c, a, e]) => has(n, a, e)).map(([n, c, a, e]) => ({t: n, d: lang === 'en' ? e : a, go: 'term:' + slug(n)}))],
    ['sr.tools', X.tools.filter(x => has(x.n, x.d, x.den)).map(x => ({t: x.n, d: lang === 'en' ? x.den : x.d, go: '#mytools'}))],
    ['sr.sc', M.SCENES.filter(s => has(s.ar, s.en, s.dar, s.den)).map(s => ({t: lang === 'en' ? s.en : s.ar, d: lang === 'en' ? s.den : s.dar, go: 'scenes'}))],
  ].filter(g => g[1].length);
  box.innerHTML = groups.length ? groups.map(([k, items]) => `<div class="sres-g"><h3>${t(k)} · ${items.length}</h3>${items.slice(0, 8).map(r => `<button type="button" class="sres-i" data-go="${esc(r.go)}"><b ${latin(r.t) ? 'dir="ltr" class="lt"' : ''}>${esc(r.t)}</b><span>${esc(r.d)}</span></button>`).join('')}</div>`).join('') : `<div class="empty">${t('sr.none')}</div>`;
}
$('#sq').addEventListener('input', renderSearch);
function go(target) {
  if (target.startsWith('lesson:')) { li = +target.split(':')[1]; renderLesson(); location.hash = 'lessons'; }
  else if (target.startsWith('term:')) { gHL = target.split(':')[1]; gcat = 'all'; gq = ''; $('#gq').value = ''; renderGlossary(); location.hash = 'glossary'; route(); }
  else if (target === 'scenes') { location.hash = 'tools'; setTab('scenes'); }
  else location.hash = target.slice(1);
}
const PAGES = {
  ar: {
    about: `<h2>من أنا</h2><div class="cardx"><p>أنا <b>عبدالرحمن مصطفى</b>، مصمم جرافيك ومونتير، ومهتم بالذكاء الاصطناعي وريادة الأعمال والمشاريع الرقمية.</p><p>سويت ورشة <b>CODE TO MOTION</b> عشان أوري الناس كيف يصنعون موشن جرافيك احترافي بالكود وبمساعدة وكلاء الذكاء الاصطناعي، حتى لو ما عندهم خلفية برمجية.</p><p>وكاتب كتاب «قبل أن تبلغ العشرين».</p></div><h3>ليش هذا الموقع؟</h3><p>عشان يكون مرجع مجاني بالعربي: مكتبة أدوات جاهزة، ودروس، ومختبر تجرّب فيه الحركة لايف، ومكان تشارك فيه أعمالك.</p>`,
    contact: `<h2>تواصل معي</h2><div class="cardx"><p>📧 الإيميل: <a class="mono" href="mailto:mostafaabodee9@gmail.com">mostafaabodee9@gmail.com</a></p><p>𝕏 / Instagram / Threads: <span class="mono">@mostafaabodee8</span></p><p>▶️ YouTube: <span class="mono">@abdulrahmanmostafa-f7c</span></p></div><p>للتعاون أو ورش للجهات، راسلني على الإيميل.</p>`,
    privacy: `<h2>سياسة الخصوصية</h2><p>آخر تحديث: نوفمبر 2026</p><h3>وش نجمع؟</h3><ul><li><b>إيميلك</b> لو اشتركت في النشرة، عشان نرسل لك جديد الموقع بس.</li><li><b>اسمك وعملك</b> (فيديو أو رابط) لو رفعته في المعرض. يبقى مخفي لين أراجعه، ولا يظهر إلا لو اعتمدته.</li><li><b>مفتاح تصويت عشوائي</b> ينحفظ في متصفحك عشان ما يتكرر صوتك. ما فيه اسمك ولا أي معلومة عنك.</li></ul><h3>وش يبقى في جهازك بس؟</h3><p>تقدّمك في الدروس، وسلة التثبيت، واللغة والوضع اللي اخترته. هذي محفوظة في متصفحك، وما توصلنا.</p><h3>وين تنحفظ البيانات؟</h3><p>في Supabase، ومحمية بحيث ما يقرأ الإيميلات والأعمال غير المعتمدة إلا صاحب الموقع.</p><h3>ما نسوي</h3><p>ما نبيع بياناتك، ولا نشاركها مع أحد، ولا نستخدم إعلانات أو أدوات تتبّع.</p><h3>حذف بياناتك</h3><p>راسلني على <span class="mono">mostafaabodee9@gmail.com</span> وأحذف إيميلك أو عملك.</p>`,
  },
  en: {
    about: `<h2>About me</h2><div class="cardx"><p>I'm <b>Abdulrahman Mostafa</b>, a graphic designer and video editor interested in AI, entrepreneurship and digital projects.</p><p>I created the <b>CODE TO MOTION</b> workshop to show people how to make professional motion graphics with code and AI agents, even without a coding background.</p><p>I'm also the author of the book "Before You Turn Twenty" (قبل أن تبلغ العشرين).</p></div><h3>Why this site?</h3><p>To be a free Arabic-first reference: ready tools, lessons, a live lab to try motion, and a place to share your work.</p>`,
    contact: `<h2>Contact</h2><div class="cardx"><p>📧 Email: <a class="mono" href="mailto:mostafaabodee9@gmail.com">mostafaabodee9@gmail.com</a></p><p>𝕏 / Instagram / Threads: <span class="mono">@mostafaabodee8</span></p><p>▶️ YouTube: <span class="mono">@abdulrahmanmostafa-f7c</span></p></div><p>For collaborations or workshops for organizations, email me.</p>`,
    privacy: `<h2>Privacy policy</h2><p>Last updated: November 2026</p><h3>What we collect</h3><ul><li><b>Your email</b> if you subscribe, only to send site updates.</li><li><b>Your name and work</b> (video or link) if you submit to the gallery. It stays hidden until reviewed and is shown only if approved.</li><li><b>A random voting key</b> stored in your browser so your vote is not repeated. It contains no name or personal details.</li></ul><h3>What stays on your device</h3><p>Lesson progress, your install stack, and your language and theme choices. They live in your browser and never reach us.</p><h3>Where data is stored</h3><p>In Supabase, protected so that only the site owner can read emails and unapproved works.</p><h3>What we don't do</h3><p>We don't sell or share your data, and we use no ads or trackers.</p><h3>Deleting your data</h3><p>Email <span class="mono">mostafaabodee9@gmail.com</span> and I'll delete your email or work.</p>`,
  },
};
function renderPages() { const P = PAGES[lang] || PAGES.ar; $('#aboutPage').innerHTML = P.about; $('#contactPage').innerHTML = P.contact; $('#privacyPage').innerHTML = P.privacy; }
// الوضع الداكن
let theme = store.get('theme', '');
function applyTheme() { if (theme) document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme; const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; $('#theme').textContent = dark ? '☀️' : '🌙'; $('#theme').setAttribute('aria-label', t('theme')); }
$('#theme').addEventListener('click', () => { const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; theme = dark ? 'light' : 'dark'; store.set('theme', theme); applyTheme(); });
function renderX() { renderTry(); renderGlossary(); renderMyTools(); renderSearch(); renderPages(); applyTheme(); }
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.try !== undefined) { tryI = +b.dataset.try; renderTry(); }
  else if (b.dataset.gcat) { gcat = b.dataset.gcat; gHL = ''; renderGlossary(); }
  else if (b.dataset.go) go(b.dataset.go);
});

applyLang(); route(); initDb();
}
