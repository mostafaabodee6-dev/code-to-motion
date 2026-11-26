// ═════ «اصنع فيديوك» + «تحدي الموشن» + شاشة النتائج للبث ═════
// يعتمد على app.js (lang, $, $$, esc, toast, saveFile, M, B)
window.CTM_STUDIO = (() => {
  const A = window.CTM_APP, {$, esc, toast, saveFile, M, B} = A;
  const L = (ar, en) => (A.lang === 'en' ? en : ar);
  const FPS = 30, DUR = 180;
  const PALETTES = [
    ['#14063F', '#FF2E9A'], ['#0B1E3F', '#4FF0FF'], ['#1A1A1A', '#FFD84D'], ['#0E3B2E', '#7CFFB2'], ['#F5F2EA', '#7B2CFF'],
  ];
  const STYLES = [
    ['bounce', 'نطّاط', 'Bouncy'], ['smooth', 'ناعم', 'Smooth'], ['snappy', 'سريع', 'Snappy'], ['cinematic', 'سينمائي', 'Cinematic'],
  ];
  const SIZES = {'16:9': [1920, 1080], '9:16': [1080, 1920], '1:1': [1080, 1080]};
  const st = {name: '', role: '', bg: PALETTES[0][0], ac: PALETTES[0][1], style: 'bounce', size: '16:9', frame: 0, playing: true, recording: false, blob: null, ext: 'webm'};

  // ── الحركة
  const sp = (f, cfg) => M.spring({frame: f, fps: FPS, config: cfg});
  const clamp01 = v => Math.max(0, Math.min(1, v));
  function enter(f) {
    if (f < 0) return {a: 0, dx: 0, dy: 0, s: 1, blur: 0};
    if (st.style === 'bounce') { const p = sp(f, {damping: 8}); return {a: clamp01(p * 2), dx: 0, dy: 0, s: 0.3 + 0.7 * p, blur: 0}; }
    if (st.style === 'smooth') { const p = sp(f, {damping: 200}); return {a: p, dx: 0, dy: (1 - p) * 70, s: 1, blur: 0}; }
    if (st.style === 'snappy') { const p = sp(f, {damping: 20, stiffness: 300, mass: 0.5}); return {a: clamp01(p * 1.5), dx: (1 - p) * 260, dy: 0, s: 1, blur: 0}; }
    const p = 1 - Math.pow(1 - clamp01(f / 40), 3); return {a: p, dx: 0, dy: 0, s: 1.15 - 0.15 * p, blur: (1 - p) * 18};
  }
  const isAr = s => /[؀-ۿ]/.test(s);
  function lighten(hex, k) {
    const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const m = c => Math.round(c + (255 - c) * k);
    return `rgb(${m(r)},${m(g)},${m(b)})`;
  }
  const isLight = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) > 160; };

  function drawWords(x, W, f0, f, text, size, weight, color) {
    const words = text.trim().split(/\s+/).filter(Boolean); if (!words.length) return;
    const ar = isAr(text);
    x.font = `${weight} ${size}px Cairo`; x.textBaseline = 'middle';
    const gap = size * 0.28, ws = words.map(w => x.measureText(w).width), total = ws.reduce((a, b) => a + b, 0) + gap * (words.length - 1);
    let cx = ar ? (W + total) / 2 : (W - total) / 2;
    words.forEach((w, i) => {
      const e = enter(f - f0 - i * 6), wx = ar ? cx - ws[i] / 2 : cx + ws[i] / 2;
      x.save(); x.globalAlpha = e.a; x.filter = e.blur ? `blur(${e.blur}px)` : 'none';
      x.translate(wx + (ar ? e.dx : -e.dx), x._y + e.dy); x.scale(e.s, e.s);
      x.fillStyle = color; x.textAlign = 'center'; x.direction = ar ? 'rtl' : 'ltr'; x.fillText(w, 0, 0); x.restore();
      cx += ar ? -(ws[i] + gap) : ws[i] + gap;
    });
  }
  function fitSize(x, text, base, maxW, weight) {
    let s = base; x.font = `${weight} ${s}px Cairo`;
    while (s > 30 && x.measureText(text).width > maxW) { s -= 6; x.font = `${weight} ${s}px Cairo`; }
    return s;
  }
  function draw(cv, f) {
    const x = cv.getContext('2d'), [W, H] = SIZES[st.size], u = Math.min(W, H) / 1080;
    if (cv.width !== W) { cv.width = W; cv.height = H; }
    const fg = isLight(st.bg) ? '#14063F' : '#FFFFFF', mute = isLight(st.bg) ? 'rgba(20,6,63,.65)' : 'rgba(255,255,255,.7)';
    x.fillStyle = st.bg; x.fillRect(0, 0, W, H);
    // خلفية: دوائر ضوء تتحرك
    const blob = (bx, by, r, c) => { const g = x.createRadialGradient(bx, by, 0, bx, by, r); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, W, H); };
    x.globalAlpha = 0.55; blob(W * 0.85 + Math.sin(f / 40) * 60 * u, H * 0.15 + Math.cos(f / 50) * 40 * u, 700 * u, st.ac);
    x.globalAlpha = 0.35; blob(W * 0.12 + Math.cos(f / 45) * 60 * u, H * 0.88, 650 * u, lighten(st.ac, 0.45)); x.globalAlpha = 1;
    // دائرة انفجار عند ظهور الاسم والختام
    [[12, 1], [120, 1.3]].forEach(([s0, k]) => {
      const p = clamp01((f - s0) / 40); if (p <= 0 || p >= 1) return;
      x.strokeStyle = st.ac; x.globalAlpha = (1 - p) * 0.6; x.lineWidth = 6 * u;
      x.beginPath(); x.arc(W / 2, H / 2, (120 + p * 900 * k) * u, 0, Math.PI * 2); x.stroke(); x.globalAlpha = 1;
    });
    const name = st.name.trim() || L('اسمك هنا', 'Your name'), role = st.role.trim();
    const nameSize = fitSize(x, name, 190 * u, W * 0.86, 900);
    const cy = H / 2 - (role ? 40 * u : 0);
    // «أهلًا، أنا»
    const hi = enter(f - 2);
    x.save(); x.globalAlpha = hi.a; x.font = `700 ${54 * u}px Cairo`; x.fillStyle = mute; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.direction = isAr(name) ? 'rtl' : 'ltr'; x.fillText(isAr(name) ? 'أهلًا، أنا' : "Hi, I'm", W / 2, cy - nameSize * 0.85 + hi.dy); x.restore();
    x._y = cy; drawWords(x, W, 12, f, name, nameSize, 900, fg);
    // خط تحت الاسم
    const bar = sp(f - 55, {damping: 200}); x.fillStyle = st.ac;
    const bw = 260 * u * bar; x.fillRect(W / 2 - bw / 2, cy + nameSize * 0.72, bw, 10 * u);
    if (role) { x._y = cy + nameSize * 0.72 + 90 * u; drawWords(x, W, 70, f, role, fitSize(x, role, 64 * u, W * 0.85, 700), 700, st.ac); }
    // ختم الورشة
    const b = enter(f - 125);
    x.save(); x.globalAlpha = b.a * 0.9; x.font = `700 ${30 * u}px Cairo`; x.fillStyle = mute; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('CODE TO MOTION', W / 2, H - 80 * u + b.dy); x.restore();
  }

  // ── الواجهة
  let cv, raf, t0 = 0;
  function render() {
    const sec = $('#makeView'); if (!sec) return;
    $('#mkPal').innerHTML = PALETTES.map(([bg, ac], i) => `<button type="button" data-pal="${i}" aria-label="palette ${i + 1}" aria-pressed="${st.bg === bg && st.ac === ac}" style="background:linear-gradient(135deg,${bg} 50%,${ac} 50%)"></button>`).join('');
    $('#mkStyle').innerHTML = STYLES.map(([id, a, e]) => `<button type="button" data-style="${id}" aria-pressed="${st.style === id}">${L(a, e)}</button>`).join('');
    $('#mkSize').innerHTML = Object.keys(SIZES).map(k => `<button type="button" data-size="${k}" aria-pressed="${st.size === k}">${k}</button>`).join('');
    $('#mkBg').value = st.bg; $('#mkAc').value = st.ac;
    cv = $('#mkCanvas'); const [W, H] = SIZES[st.size]; cv.style.aspectRatio = `${W}/${H}`;
    renderChallenge();
  }
  function loop(now) {
    if (!t0) t0 = now;
    if (st.playing && !st.recording) { st.frame = Math.floor((now - t0) / 1000 * FPS) % (DUR + 30); }
    if (cv && !$('#makeView').hidden) draw(cv, Math.min(st.frame, DUR - 1));
    raf = requestAnimationFrame(loop);
  }
  function restart() { t0 = 0; st.frame = 0; }

  async function exportVideo() {
    if (st.recording) return;
    if (!cv.captureStream || !window.MediaRecorder) { toast(L('متصفحك ما يدعم التصدير، جرّب Chrome', 'Your browser can\'t export, try Chrome')); return; }
    await document.fonts.load('900 80px Cairo'); await document.fonts.load('700 40px Cairo');
    const types = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm'];
    const mime = types.find(m => MediaRecorder.isTypeSupported(m)) || '';
    st.ext = mime.includes('mp4') ? 'mp4' : 'webm';
    const stream = cv.captureStream(FPS), rec = new MediaRecorder(stream, mime ? {mimeType: mime, videoBitsPerSecond: 8e6} : undefined), chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    st.recording = true; $('#mkExport').disabled = true; $('#mkMsg').textContent = L('أسجّل الفيديو… 6 ثواني', 'Recording… 6 seconds');
    const done = new Promise(r => { rec.onstop = r; });
    rec.start();
    const start = performance.now();
    await new Promise(res => {
      const step = now => {
        const f = Math.floor((now - start) / 1000 * FPS);
        draw(cv, Math.min(f, DUR - 1));
        if (f >= DUR) { res(); return; }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
    rec.stop(); await done;
    st.blob = new Blob(chunks, {type: mime || 'video/webm'});
    st.recording = false; $('#mkExport').disabled = false; restart();
    const fname = `code-to-motion-${(st.name.trim() || 'video').replace(/[^\p{L}\p{N}]+/gu, '-')}.${st.ext}`;
    try { await saveFile(fname, st.blob); } catch (e) {}
    $('#mkMsg').textContent = L(`جاهز ✓ (${st.ext.toUpperCase()}). تقدر تشارك فيه في تحدي الموشن.`, `Done ✓ (${st.ext.toUpperCase()}). You can enter it in the Motion Challenge.`);
    $('#mkToChallenge').hidden = false;
  }

  // ── تحدي الموشن
  let settings = null, board = [];
  async function loadChallenge() {
    if (!B) return;
    try { settings = await B.getSettings(); } catch (e) { settings = null; }
    try { board = await B.approvedWorks(); } catch (e) { board = []; }
    renderChallenge(); renderLive();
  }
  const current = () => (settings && settings.challenge_title) || '';
  const ranked = () => board.filter(w => current() && w.challenge === current()).sort((a, b) => b.votes - a.votes || new Date(a.created_at) - new Date(b.created_at));
  function renderChallenge() {
    const box = $('#chInfo'); if (!box) return;
    if (!B) { box.innerHTML = `<p>${L('التحدي يشتغل على الموقع المنشور بس.', 'The challenge works on the published site only.')}</p>`; return; }
    if (!current()) { box.innerHTML = `<h3>${L('ما فيه تحدي مفتوح الحين', 'No open challenge right now')}</h3><p>${L('التحديات تنفتح وقت الورشة المباشرة. تابعنا!', 'Challenges open during the live workshop.')}</p>`; $('#chForm').hidden = true; $('#chBoard').innerHTML = ''; return; }
    const open = settings.challenge_open;
    box.innerHTML = `<span class="tag ${open ? 'on' : ''}">${open ? L('مفتوح الحين', 'Open now') : L('انقفل', 'Closed')}</span><h3>${esc(current())}</h3>${settings.challenge_text ? `<p>${esc(settings.challenge_text)}</p>` : ''}`;
    $('#chForm').hidden = !open;
    const list = ranked();
    $('#chBoard').innerHTML = list.length ? list.map((w, i) => `<li class="${i < 3 ? 'top' : ''}"><b class="rk">${['🥇', '🥈', '🥉'][i] || i + 1}</b>
      ${w.videoUrl ? `<video src="${esc(w.videoUrl)}" muted loop playsinline preload="metadata" controls></video>` : ''}
      <div class="who"><strong>${esc(w.title)}</strong><span>${esc(w.name)}</span></div>
      <button type="button" class="vote ${w.mine ? 'on' : ''}" data-chvote="${w.id}">♥ ${w.votes}</button></li>`).join('')
      : `<li class="none">${L('أول عمل معتمد بيظهر هنا. ارفع عملك!', 'The first approved entry shows up here. Submit yours!')}</li>`;
  }
  function renderLive() {
    const el = $('#liveBoard'); if (!el) return;
    $('#liveTitle').textContent = current() || L('تحدي الموشن', 'Motion Challenge');
    const list = ranked().slice(0, 6), max = Math.max(1, ...list.map(w => w.votes));
    el.innerHTML = list.length ? list.map((w, i) => `<li><b>${i + 1}</b><div class="lb"><div class="nm">${esc(w.title)} <small>${esc(w.name)}</small></div><div class="br"><i style="width:${Math.max(4, w.votes / max * 100)}%"></i></div></div><span>${w.votes}</span></li>`).join('')
      : `<li class="none">${L('بانتظار الأعمال…', 'Waiting for entries…')}</li>`;
  }
  let voting = false;
  async function vote(id) { if (voting || !B) return; voting = true; try { await B.toggleVote(id); await loadChallenge(); } catch (e) { toast(L('ما قدرنا نسجّل صوتك', 'Could not save your vote')); } voting = false; }
  async function submit(e) {
    e.preventDefault(); if (!B || !current()) return;
    const btn = $('#chSave'); btn.disabled = true; $('#chMsg').textContent = L('أرفع…', 'Uploading…');
    try {
      await B.submitWork({name: $('#chName').value.trim(), title: $('#chTitle').value.trim(), link: '', file: $('#chFile').files[0] || null, challenge: current()});
      $('#chMsg').textContent = L('وصل عملك ✓ بيظهر في الترتيب بعد ما يعتمده عبدالرحمن.', 'Received ✓ It appears on the board once approved.');
      e.target.reset();
    } catch (err) { $('#chMsg').textContent = L('ما انرفع. تأكد إن الملف فيديو أقل من 50MB وإن التحدي مفتوح.', 'Upload failed. Use a video under 50MB while the challenge is open.'); }
    btn.disabled = false;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.pal !== undefined) { [st.bg, st.ac] = PALETTES[+d.pal]; render(); restart(); }
    else if (d.style) { st.style = d.style; render(); restart(); }
    else if (d.size) { st.size = d.size; render(); restart(); }
    else if (d.chvote) vote(d.chvote);
    else if (b.id === 'mkPlay') restart();
    else if (b.id === 'mkExport') exportVideo();
    else if (b.id === 'mkToChallenge') {
      location.hash = '#challenge';
      if (st.blob) setTimeout(() => { try { const dt = new DataTransfer(); dt.items.add(new File([st.blob], `my-video.${st.ext}`, {type: st.blob.type})); $('#chFile').files = dt.files; if (!$('#chName').value) $('#chName').value = st.name; } catch (er) {} }, 200);
    }
  });
  document.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'mkName') { st.name = e.target.value; restart(); }
    else if (id === 'mkRole') { st.role = e.target.value; restart(); }
    else if (id === 'mkBg') { st.bg = e.target.value; render(); }
    else if (id === 'mkAc') { st.ac = e.target.value; render(); }
  });
  document.addEventListener('submit', e => { if (e.target.id === 'chForm') submit(e); });
  let poll = null;
  function onRoute(v) {
    clearInterval(poll);
    document.body.classList.toggle('livemode', v === 'live');
    if (v === 'challenge' || v === 'live') { renderChallenge(); renderLive(); loadChallenge(); poll = setInterval(loadChallenge, v === 'live' ? 8000 : 20000); }
    if (v === 'make') { document.fonts.load('900 80px Cairo').then(restart); }
  }
  render(); requestAnimationFrame(loop); setTimeout(() => onRoute(location.hash.slice(1)), 0);
  return {render, onRoute};
})();
