// بيانات الموقع: كل عنصر في المكتبة، والدروس، والأسئلة الشائعة
// لإضافة عنصر جديد: انسخ أي سطر وعدّله
window.CTM = (() => {
const A = 'anthropics/skills';
const sk = (n, cat, d, more = {}) => ({type: 'skill', id: n, n, cat, src: A, d, cmd: `npx skills add ${A} --skill ${n}`, ...more});

const SKILLS = [
  {type:'skill', id:'remotion-best-practices', n:'remotion-best-practices', cat:'video', src:'remotion-dev/skills', star:1,
   d:'أهم Skill للورشة. تعلّم الوكيل قواعد Remotion: الحركة، المشاهد، الصوت، الترجمة، والتصدير.',
   long:'الحزمة الرسمية من فريق Remotion. فيها كل القواعد اللي يحتاجها وكيل البرمجة عشان يكتب كود فيديو صحيح: interpolate و spring و Sequence، إضافة الصوت والتعليق الصوتي، الترجمة على الشاشة، وجعل الفيديو قالب بـ Zod. تشتغل مع Claude Code و Codex و Cursor.',
   use:['قبل ما تطلب من الوكيل أي فيديو Remotion','لما يطلع لك كود فيه أخطاء في التوقيت أو الحركة','لما تبغى تحوّل فيديو لقالب تغيّر نصوصه'],
   prompt:'Create a 10-second Remotion intro for my channel: logo bounce with spring, title words appearing one by one, soft background music. 1920x1080, 30fps.',
   cmd:'npx skills add remotion-dev/skills'},
  {type:'skill', id:'remotion-in-project', n:'remotion skills (داخل المشروع)', cat:'video', src:'remotion-dev/skills',
   d:'نفس Skills الرسمية، تثبّتها من أداة Remotion نفسها داخل مشروعك، وتحدّثها بأمر واحد.',
   long:'إذا عندك مشروع Remotion جاهز، شغّل الأمر داخل مجلده. تنحفظ الـ Skills في مجلد .claude/skills داخل المشروع. وفيها /remotion-docs اللي يجيب التوثيق المحدّث بدل خادم MCP القديم.',
   use:['عندك مشروع Remotion جاهز','تبغى تحدّث الـ Skills: npx remotion skills update'],
   prompt:'Use /remotion-docs to check how TransitionSeries works, then add a slide transition between my two scenes.',
   cmd:'npx remotion skills add'},
  sk('frontend-design','design','تخلّي الوكيل يصمم صفحات وواجهات مميزة بقرارات جريئة في الألوان والخطوط، بدل الشكل المكرر.',{star:1,
   long:'تعطي الوكيل منهج تصميم: يختار اتجاه بصري واضح، وخطوط مميزة، وألوان جريئة، ويهتم بالتفاصيل. ممتازة لصفحات الهبوط ولتصميم مشاهد Remotion نفسها لأنها مكتوبة بـ React.',
   use:['صفحة هبوط لمنتج أو ورشة','تصميم مشاهد الفيديو بشكل احترافي','واجهة تطبيق'],
   prompt:'Design a bold landing page for my motion graphics workshop. Arabic RTL, Cairo font, gradient purple-pink palette.'}),
  sk('canvas-design','design','تصاميم بصرية وبوسترات بصيغة PNG و PDF، مبنية على فلسفة تصميم واضحة.',{
   long:'الوكيل يكتب فلسفة تصميم قصيرة، وبعدين يرسم العمل بالكود ويصدّره صورة أو PDF. مفيدة للبوسترات وأغلفة الفيديو والصور المصغّرة.',
   use:['بوستر ورشة أو فعالية','صورة مصغّرة لفيديو','خلفيات لمشاهد Remotion'],
   prompt:'Create a minimalist poster for "CODE TO MOTION" workshop as a PNG, 1080x1350.'}),
  sk('algorithmic-art','design','فن توليدي بـ p5.js: جزيئات وحقول حركة وأنماط. ممتاز لخلفيات الموشن.',{
   long:'يولّد أعمال فنية بالكود بعشوائية محسوبة (seed)، فتقدر تعيد نفس النتيجة. فكرة حلوة لخلفيات متحركة داخل فيديوهاتك.',
   use:['خلفيات متحركة','هوية بصرية فنية','تجارب إبداعية'],
   prompt:'Make a flow-field particle animation in purple and cyan that I can use as a video background.'}),
  sk('theme-factory','design','ثيمات ألوان وخطوط جاهزة تطبقها على العروض والصفحات، أو يولّد لك ثيم جديد.',{
   long:'فيها 10 ثيمات جاهزة، أو تطلب ثيم جديد بوصف. تطبّقها على العروض والصفحات والمستندات فيصير شغلك كله بنفس الهوية.',
   use:['توحيد شكل كل مخرجاتك','تجربة أكثر من ستايل بسرعة'],
   prompt:'Apply a dark neon theme to my presentation and landing page.'}),
  sk('brand-guidelines','design','مثال على Skill تفرض هويتك البصرية (ألوان وخطوط) على كل شغل الوكيل. عدّلها بهويتك.',{
   long:'هذي مثال من Anthropic بهويتهم. الفكرة إنك تنسخها وتغيّر الألوان والخطوط لهويتك، فكل شي يسويه الوكيل يطلع بنفس هويتك تلقائيًا.',
   use:['هوية شخصية أو لشركة','فريق يبغى شكل موحّد'],
   prompt:'Use skill-creator to turn my brand colors (#14063F, #FF2E9A, #4FF0FF) and Cairo font into a brand-guidelines skill.'}),
  sk('slack-gif-creator','design','صور GIF متحركة بحجم صغير ومناسب للمشاركة.',{
   long:'يسوي GIF قصير وخفيف بحدود الحجم المناسبة للمشاركة. حلو للملصقات المتحركة والردود.',
   use:['ملصق متحرك لقناتك','إعلان صغير متحرك'],prompt:'Make a small animated GIF of my logo bouncing, under 2MB.'}),
  sk('web-artifacts-builder','design','يبني صفحات وأدوات تفاعلية كاملة بـ React و Tailwind.',{
   long:'للصفحات التفاعلية الأكبر: حاسبات، لوحات، أدوات صغيرة. يرتّب المكوّنات ويبنيها صفحة وحدة.',
   use:['أداة تفاعلية','لوحة معلومات','نموذج تجريبي لفكرة'],prompt:'Build an interactive timeline editor for planning video scenes.'}),
  sk('pptx','docs','ينشئ ويعدّل عروض PowerPoint: شرائح وقوالب وملاحظات المتحدث.',{star:1,
   long:'يسوي عروض PowerPoint حقيقية تقدر تعدّلها: تخطيطات، رسوم بيانية، ملاحظات للمتحدث، ويقرأ ويعدّل عروضك الموجودة.',
   use:['عرض ورشة أو محاضرة','تحويل محتوى لشرائح','تعديل عرض موجود'],prompt:'Create a 12-slide Arabic RTL deck explaining Remotion basics with speaker notes.'}),
  sk('docx','docs','ملفات Word: إنشاء وتعديل وتتبّع التغييرات والتعليقات.',{
   long:'ينشئ مستندات Word بتنسيق مرتب، ويعدّل الموجود مع تتبّع التغييرات والتعليقات.',use:['سكريبت ورشة','عقد أو عرض سعر','دليل استخدام'],prompt:'Write a Word document with the full workshop script, one heading per slide.'}),
  sk('pdf','docs','يقرأ ويدمج ويقسم ملفات PDF، ويعبّي النماذج، ويستخرج الجداول.',{
   long:'كل شغل PDF: استخراج نص وجداول، دمج وتقسيم، تعبئة نماذج، وإنشاء PDF جديد.',use:['شهادات حضور','دمج ملفات','استخراج بيانات'],prompt:'Generate attendance certificates as PDF from this list of names.'}),
  sk('xlsx','docs','جداول Excel مع معادلات وتنسيق وتحليل بيانات.',{
   long:'جداول Excel فيها معادلات حقيقية وتنسيق ورسوم، ويحلل البيانات الموجودة.',use:['قائمة الحضور','ميزانية','تحليل نتائج استبيان'],prompt:'Create an attendance tracker spreadsheet with a summary sheet.'}),
  sk('doc-coauthoring','docs','طريقة منظمة لكتابة المستندات مع الوكيل: خطة، مسودة، مراجعة.',{
   long:'بدل ما يكتب الوكيل كل شي مرة وحدة، يمشي معك خطوة خطوة: يسأل، يخطط، يكتب، وبعدين يراجع.',use:['مستندات طويلة','سكريبتات','محتوى كتاب'],prompt:'Help me co-author an article about learning motion graphics with code.'}),
  sk('skill-creator','dev','يساعدك تكتب Skill خاصة فيك، تحفظ طريقتك في الشغل وتكررها.',{star:1,
   long:'أهم Skill لو تبغى تبني مكتبتك الخاصة. توصف له طريقتك في الشغل، وهو يحوّلها لـ Skill كاملة ويختبرها.',use:['تحفظ طريقة شغلك','تشارك Skills مع فريقك'],prompt:'Create a skill that turns my workshop scripts into Remotion scene plans.'}),
  sk('webapp-testing','dev','يختبر مواقعك وتطبيقاتك المحلية بـ Playwright ويصوّرها.',{
   long:'يفتح موقعك في متصفح، يضغط ويعبّي، ويصوّر الشاشة عشان يتأكد إن كل شي شغال.',use:['اختبار موقع قبل النشر','التأكد من الجوال'],prompt:'Test my local site on mobile size and screenshot every page.'}),
  sk('mcp-builder','dev','دليل لبناء MCP Server يربط الوكيل بأي خدمة أو API.',{
   long:'يعلّم الوكيل يبني خادم MCP صحيح، عشان تربط Claude بأي خدمة عندك.',use:['ربط الوكيل بمنصتك','أتمتة خدمة تستخدمها'],prompt:'Build an MCP server that lists my YouTube videos.'}),
];

// ── وكلاء فرعيين (Subagents) — ملفات تحطها في .claude/agents/
const agent = (id, cat, d, file, use) => ({type:'agent', id, n:id, cat, src:'CODE TO MOTION', d, file, path:`.claude/agents/${id}.md`, use});
const AGENTS = [
  agent('motion-designer','video','مصمم موشن متخصص في Remotion: يحوّل أي فكرة لمشاهد بحركة احترافية.',
`---
name: motion-designer
description: Remotion motion designer. Use when the user asks for a new video, scene or animation.
tools: Read, Write, Edit, Bash
---
You are a senior motion designer who builds videos with Remotion.

When asked for a video:
1. Plan the scenes first: for each scene write its purpose, duration in frames (30fps) and the main motion.
2. Use spring() for entrances, interpolate() with clamp for fades and slides.
3. Put shared colors and fonts in src/theme.ts and reuse them.
4. Register every composition in src/Root.tsx with width, height, fps and durationInFrames.
5. For Arabic text always set direction: 'rtl'.
6. Run npx tsc --noEmit and fix every error.
7. Render one still per scene with npx remotion still to check the layout.

Keep motion purposeful: one main movement per scene, no random shaking.`,
  ['تبغى فيديو جديد من فكرة','تبغى مشهد بحركة احترافية']),
  agent('video-reviewer','video','مراجع جودة: يصوّر فريمات من الفيديو ويطلع لك قائمة مشاكل قبل التصدير.',
`---
name: video-reviewer
description: Reviews a Remotion composition before export. Use after a video is built or changed.
tools: Read, Bash
---
You review Remotion videos before export. Do not change code; report.

Steps:
1. Read src/Root.tsx and find the composition and its duration.
2. Render stills at the start, middle and end of every scene:
   npx remotion still <Id> out/check-<frame>.png --frame=<frame>
3. Check each still for: text cut off, text outside safe margins (5%),
   wrong RTL order in Arabic, low contrast, overlapping elements.
4. Check timing: transitions length, scene durations, audio start frames.
5. Report a short numbered list: problem, frame, file, suggested fix.`,
  ['قبل ما تصدّر الفيديو النهائي','بعد أي تعديل كبير']),
  agent('script-to-scenes','video','يحوّل السكريبت أو التعليق الصوتي لخطة مشاهد بالفريمات، جاهزة للتنفيذ.',
`---
name: script-to-scenes
description: Turns a voice-over script or audio file into a scene plan with exact frame timings.
tools: Read, Write, Bash
---
You turn scripts into Remotion scene plans.

If there is an audio file in public/:
1. Find the pauses: ffmpeg -i <file> -af silencedetect=noise=-30dB:d=0.2 -f null -
2. Each pause marks the start of a new phrase. Convert seconds to frames (x30).

Then write scenes.md with a table:
scene | from (frame) | duration | spoken text | what appears on screen | motion

Rules: a scene lasts at least 45 frames; on-screen text appears 2-4 frames
before it is spoken; keep a 15-frame tail at the end.`,
  ['عندك تعليق صوتي وتبغى تزامن المشاهد معه','تبغى تخطط فيديو قبل البرمجة']),
  agent('arabic-typography','design','خبير خط عربي: يضبط اتجاه النص RTL والخطوط والمسافات في الفيديو والصفحات.',
`---
name: arabic-typography
description: Fixes Arabic text layout (RTL, fonts, mixed Arabic/English) in Remotion videos and web pages.
tools: Read, Edit, Bash
---
You fix Arabic typography.

Checklist:
- Every element with Arabic text has direction: 'rtl'.
- Mixed text: wrap English words or code in a span with direction: 'ltr'.
- Use a font that supports Arabic well (Cairo, Tajawal, IBM Plex Sans Arabic).
  Load it locally from public/fonts with @remotion/fonts so renders work offline.
- Line height 1.2-1.4 for Arabic headings, 1.6+ for body.
- Never use letter-spacing on Arabic text (it breaks letter joining).
- Numbers: keep one style (Western 1 2 3 or Arabic ١ ٢ ٣) per video.
Render a still after each fix to confirm.`,
  ['نصك العربي طالع مقلوب أو مقطّع','تخلط عربي وإنجليزي في نفس السطر']),
];

// ── أوامر مختصرة (Slash Commands) — ملفات تحطها في .claude/commands/
const command = (id, cat, d, file, use) => ({type:'command', id:'/'+id, n:'/'+id, cat, src:'CODE TO MOTION', d, file, path:`.claude/commands/${id}.md`, use});
const COMMANDS = [
  command('new-scene','video','أمر واحد ينشئ مشهد Remotion جديد بالوصف اللي تكتبه بعده.',
`---
description: Create a new Remotion scene from a short description
argument-hint: <scene description>
---
Create a new Remotion scene: $ARGUMENTS

- Put it in src/scenes/<PascalCaseName>.tsx
- Use colors and fonts from src/theme.ts
- Entrances with spring(), fades with interpolate() + clamp
- Arabic text: direction 'rtl'
- Register a preview composition in src/Root.tsx (1920x1080, 30fps)
- Run npx tsc --noEmit and render one still to check it.`,
  ['/new-scene عنوان يدخل كلمة كلمة وتحته شعار ينط']),
  command('add-voiceover','video','يضيف ملف صوت للفيديو ويزامن المشاهد مع الوقفات اللي فيه.',
`---
description: Add a voice-over file and sync scenes to its pauses
argument-hint: <audio file in public/>
---
Add the voice-over $ARGUMENTS to the main composition.

1. Detect pauses with ffmpeg silencedetect (noise=-30dB, d=0.2).
2. Map each spoken phrase to a scene; convert seconds to frames (x30).
3. Add <Audio src={staticFile(...)} /> and lower background music to 0.15.
4. Make each scene start 2-4 frames before its phrase.
5. Update durationInFrames to the audio length + 1 second.
6. Show me a table of scene, start frame and phrase.`,
  ['/add-voiceover voice/intro.mp3']),
  command('render','video','يصدّر الفيديو MP4 ويتأكد من المدة والصوت.',
`---
description: Render a composition to MP4 and verify the output
argument-hint: <CompositionId>
---
Render $ARGUMENTS:
npx remotion render $ARGUMENTS out/$ARGUMENTS.mp4

Then check with ffprobe that the duration matches durationInFrames / fps
and that there is an audio stream. Report the file size and duration.`,
  ['/render FinalProject']),
  command('make-template','video','يحوّل أي فيديو لقالب: النصوص والألوان تتغير من لوحة Props.',
`---
description: Turn a composition into an editable template with a Zod schema
argument-hint: <CompositionId>
---
Make $ARGUMENTS a template:
1. Find every hard-coded text, color and image in it.
2. Add a Zod schema (zColor for colors) and pass them as props.
3. Register schema and defaultProps on the <Composition>.
4. Keep the current values as defaults so the video looks the same.
5. Run npx tsc --noEmit.`,
  ['/make-template Intro']),
  command('captions','video','يضيف ترجمة على الشاشة تظهر كلمة كلمة مع الصوت.',
`---
description: Add word-by-word captions synced to the audio
argument-hint: <audio file>
---
Add captions for $ARGUMENTS.
Use @remotion/captions. If there is no transcript, ask me for the text,
then time each word between the detected pauses.
Style: bottom center, 5% safe margin, white text with dark background,
current word highlighted in the accent color from src/theme.ts.`,
  ['/captions voice/intro.mp3']),
];

// ── خوادم MCP
const MCPS = [
  {type:'mcp', id:'context7', n:'Context7', cat:'dev', src:'upstash/context7', star:1,
   d:'يجيب للوكيل توثيق محدّث لأي مكتبة برمجية، بدل ما يعتمد على معلومات قديمة.',
   long:'خادم MCP مستضاف (ما تحتاج تثبّت شي محليًا). أول مرة تتصل يفتح لك المتصفح تسجّل دخول. بعدها قل للوكيل "use context7" لما تبغى توثيق محدّث.',
   use:['مكتبة تحدّثت ومعلومات الوكيل قديمة','تبغى أمثلة كود من التوثيق الرسمي'],
   cmd:'claude mcp add --transport http context7 https://mcp.context7.com/mcp'},
  {type:'mcp', id:'playwright', n:'Playwright', cat:'dev', src:'microsoft/playwright-mcp',
   d:'يخلّي الوكيل يتحكم بمتصفح: يفتح صفحات، يضغط، يعبّي، ويصوّر.',
   long:'الخادم الرسمي من مايكروسوفت. مفيد لاختبار المواقع، أو لتصوير صفحة تستخدمها في فيديو. يشتغل مع Claude Code و Codex.',
   use:['اختبار موقعك','تصوير صفحات لاستخدامها في الفيديو'],
   cmd:'claude mcp add playwright npx @playwright/mcp@latest'},
  {type:'mcp', id:'elevenlabs', n:'ElevenLabs', cat:'video', src:'elevenlabs (hosted)',
   d:'تعليق صوتي واستنساخ أصوات وتحويل صوت لنص، من داخل الوكيل.',
   long:'ElevenLabs صارت توفر خادم MCP مستضاف بتسجيل دخول OAuth بدل مفتاح API. الخادم المحلي القديم (elevenlabs-mcp) صار غير مدعوم. تحتاج حساب ElevenLabs.',
   use:['تعليق صوتي لفيديو Remotion','تحويل تسجيل لنص للترجمة'],
   cmd:'claude mcp add --transport http elevenlabs https://api.elevenlabs.io/v1/mcp'},
];

// ── برومبتات جاهزة
const prompt = (id, n, cat, d, text) => ({type:'prompt', id, n, cat, src:'CODE TO MOTION', d, text});
const PROMPTS = [
  prompt('intro','افتتاحية قناة 10 ثواني','video','شعار ينط واسم القناة يدخل كلمة كلمة.',
'Create a 10-second Remotion intro (1920x1080, 30fps) for my channel "<NAME>".\nScene 1 (0-3s): logo from public/logo.png bounces in with spring (damping 10).\nScene 2 (3-7s): channel name appears word by word, Arabic RTL, Cairo font.\nScene 3 (7-10s): tagline fades in, soft glow behind the logo.\nAdd public/sfx/whoosh.wav on scene changes. Use colors from src/theme.ts.'),
  prompt('promo','إعلان منتج 15 ثانية','video','مشكلة، حل، مميزات، ودعوة للتسجيل.',
'Make a 15-second promo video for "<PRODUCT>" in Remotion.\n4 scenes with TransitionSeries (slide and fade, 20 frames):\n1. The problem in one bold sentence.\n2. The product name with spring entrance.\n3. Three features as cards popping in one by one.\n4. Call to action with the website URL.\nMake all texts and the accent color editable props with a Zod schema.'),
  prompt('quote','اقتباس متحرك (Kinetic)','design','نص يظهر كلمة كلمة مع إبراز كلمة مهمة.',
'Create a kinetic typography video of this quote: "<QUOTE>".\nWords appear one by one with spring, highlight the word "<WORD>" in yellow.\nArabic RTL, Cairo 900, centered. Duration: 2 seconds per 5 words + 1 second hold.'),
  prompt('stats','عداد أرقام وإحصائيات','design','ثلاث أرقام تعد من صفر مع كروت.',
'Build a 6-second Remotion composition "Stats": three cards with numbers that count up from 0 using interpolate (clamp), labels under each number in Arabic. Cards enter with spring, 8 frames apart.'),
  prompt('shorts','فيديو Shorts عمودي مع ترجمة','video','مقاس 1080×1920 مع كابشن كلمة كلمة.',
'Create a vertical 1080x1920 Remotion video for YouTube Shorts using the voice-over public/voice/clip.mp3.\nAdd word-by-word captions in the lower third, current word highlighted.\nBackground: animated gradient. Duration = audio length.'),
  prompt('about','فيديو "عن نفسي" (التحدي)','video','الاسم، الوصف، والمهارات في 10 ثواني.',
'Open the AboutMe composition in this project and change the props to:\nname: "<YOUR NAME>", role: "<WHAT YOU DO>", skills: ["...", "...", "..."], accent: "<COLOR>".\nThen render it: npx remotion render AboutMe out/about-me.mp4'),
];

const LESSONS = [
  {id:'l1', t:'useCurrentFrame', s:'رقم الفريم يحرّك كل شي', img:'img/l1.jpg', file:'src/lessons/L01_FirstAnimation.tsx',
   p:['الفيديو صور ورا بعض. بـ 30 فريم في الثانية، كل ثانية فيها 30 صورة.','useCurrentFrame() يعطيك رقم الصورة الحالية، ومنه تحسب شكل كل شي في الشاشة.'],
   code:'const frame = useCurrentFrame();\nconst opacity = Math.min(1, frame / 30);\n\n<h1 style={{opacity}}>Hello Remotion</h1>', ex:'غيّر 30 إلى 90 وشوف الظهور كيف صار أبطأ.'},
  {id:'l2', t:'interpolate', s:'حوّل الفريم لأي قيمة', img:'img/l2.jpg', file:'src/lessons/L02_Interpolate.tsx',
   p:['interpolate تاخذ رقم الفريم ومجالين: من فريم إلى فريم، ومن قيمة إلى قيمة.','clamp يوقّف الحركة عند آخر قيمة، و Easing يخلّيها تبطّئ بنعومة.'],
   code:"interpolate(frame, [0, 30], [0, 1], {\n  extrapolateRight: 'clamp',\n});", ex:'خلّ الكرت يدخل من فوق بدل الجنب: translateY بدل translateX.'},
  {id:'l3', t:'spring', s:'حركة طبيعية فيها نطّة', img:'img/l3.jpg', file:'src/lessons/L03_Spring.tsx',
   p:['spring تعطي حركة زي الواقع، فيها نطّة خفيفة.','damping يتحكم بالنطّة: 4 نطّ قوي، 12 متوازن، 200 بدون نطّ.'],
   code:'const scale = spring({\n  frame, fps,\n  config: {damping: 12},\n});', ex:'جرّب damping بين 3 و 30، واختار اللي يعجبك.'},
  {id:'l4', t:'Sequence', s:'قسّم الفيديو لمشاهد', img:'img/l4.jpg', file:'src/lessons/L04_Sequence.tsx',
   p:['Sequence تحدد متى يبدأ المشهد (from) وكم يطوّل (durationInFrames).','داخل كل مشهد، رقم الفريم يبدأ من صفر من جديد.'],
   code:'<Sequence from={60} durationInFrames={60}>\n  <Scene title="Scene 2" />\n</Sequence>', ex:'أضف مشهد رابع يبدأ عند الفريم 180.'},
  {id:'l5', t:'Transitions', s:'انتقالات بين المشاهد', img:'img/l5.jpg', file:'src/lessons/L05_Transitions.tsx',
   p:['TransitionSeries تشغّل المشاهد ورا بعض وبينها انتقال: fade أو slide أو wipe.','الانتقال ياكل من مدة المشاهد: مشهدين 50 فريم مع انتقال 15 = 85 فريم.'],
   code:'<TransitionSeries.Transition\n  presentation={fade()}\n  timing={linearTiming({durationInFrames: 15})}\n/>', ex:'بدّل كل الانتقالات لـ slide من اتجاهات مختلفة.'},
  {id:'l6', t:'صور وخطوط وصوت', s:'كل شي من مجلد public', img:'img/l6.jpg', file:'src/lessons/L06_Media.tsx',
   p:['أي ملف في public تستدعيه بـ staticFile.','الصوت داخل Sequence يبدأ بالضبط في الفريم اللي تحدده.'],
   code:"<Sequence from={10}>\n  <Audio src={staticFile('sfx/pop.wav')} />\n</Sequence>", ex:'أضف صوت "ووش" مع دخول النص.'},
  {id:'final', t:'المشروع النهائي', s:'12 ثانية، 4 مشاهد', img:'img/f4.jpg', file:'src/final/', video:'final.mp4',
   p:['يجمع كل الدروس: كلمات تظهر بـ spring، كروت تطير، كود ينكتب حرف حرف، وشعار ينط مع ضربة صوت.','75 + 105 + 135 + 105 − (3 × 20) = 360 فريم = 12 ثانية.'],
   code:'// غيّر النصوص واللون من لوحة Props\n// في Remotion Studio بدون ما تلمس الكود', ex:'غيّر العنوان واللون من Props وصدّر نسختك.'},
];

const FAQ = [
  ['أحتاج أعرف برمجة قبل؟','لا. يكفي تعرف تفتح Terminal وتنسخ أوامر. الورشة تشرح كل سطر، والذكاء الاصطناعي يساعدك تكتب الباقي.'],
  ['Remotion مجاني؟','مجاني للأفراد والفرق الصغيرة. الشركات الأكبر تحتاج رخصة، وتفاصيلها في موقع remotion.dev.'],
  ['يشتغل على Windows؟','نعم. لو PowerShell منع أمر npx أو npm، استخدم npx.cmd و npm.cmd.'],
  ['وش الفرق بين Skill و Agent و Command؟','الـ Skill معرفة يقراها الوكيل وقت الحاجة. الـ Agent وكيل فرعي متخصص بمهمة. الـ Command اختصار تكتبه بـ / عشان تشغّل خطوات جاهزة.'],
  ['وين أحط ملفات Agents و Commands؟','داخل مجلد مشروعك: .claude/agents للوكلاء و .claude/commands للأوامر. أنشئ المجلد لو مو موجود.'],
  ['التصدير بطيء عندي، وش أسوي؟','صدّر مقطع أقصر للتجربة، أو قلّل الجودة مؤقتًا. والجهاز الأقوى يصدّر أسرع لأن Remotion يستخدم كل المعالجات.'],
  ['كيف أشارك فيديو التحدي؟','انشره على حساباتك مع منشن @mostafaabodee8، والأعمال المختارة تنضاف لمعرض الأعمال هنا.'],
];

return {SKILLS, AGENTS, COMMANDS, MCPS, PROMPTS, LESSONS, FAQ};
})();
