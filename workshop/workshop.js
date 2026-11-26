(() => {
  const KEY = 'ctm-ws-code';
  const NAME_KEY = 'ctm-ws-name';
  const BUCKET = 'workshop-images';
  const MAX_IMG = 5 * 1024 * 1024;
  const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const $ = (id) => document.getElementById(id);
  const sb = window.CTM_BACKEND && window.CTM_BACKEND.sb;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const fmt = (iso) => new Date(iso).toLocaleString('ar-SA', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Riyadh'});
  const imgUrl = (path) => sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  function setMsg(el, text, ok) {
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'bad');
  }

  // العد التنازلي — السبت 28 نوفمبر 2026 الساعة 6 مساءً بتوقيت الرياض
  const WORKSHOP_AT = new Date('2026-11-28T18:00:00+03:00').getTime();
  function tick() {
    const diff = WORKSHOP_AT - Date.now();
    const el = $('countdown');
    if (diff <= 0) { el.textContent = 'الورشة بدأت الآن أو انتهت'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.textContent = `يبدأ بعد ${d} يوم · ${h} ساعة · ${m} دقيقة`;
  }
  tick();
  setInterval(tick, 30000);

  // ---------- الأسئلة ----------
  function renderList(rows) {
    const list = $('list');
    if (!rows.length) { list.innerHTML = '<div class="card empty">لا توجد أسئلة بعد. كن أول من يسأل.</div>'; return; }
    list.innerHTML = rows.map((r) =>
      `<article class="card q">
         <header><strong>${esc(r.name)}</strong><time>${esc(fmt(r.created_at))}</time></header>
         <p>${esc(r.question)}</p>
         ${r.image_path ? `<img class="qimg" src="${esc(imgUrl(r.image_path))}" alt="صورة مرفقة مع السؤال" loading="lazy">` : ''}
       </article>`
    ).join('');
  }

  async function loadQuestions() {
    const code = sessionStorage.getItem(KEY);
    if (!code) return;
    const {data, error} = await sb.rpc('workshop_list_questions', {p_code: code});
    if (error) throw error;
    renderList(data || []);
  }

  // ---------- لوحة المتفاعلين ----------
  async function loadBoard() {
    const code = sessionStorage.getItem(KEY);
    if (!code) return;
    const {data, error} = await sb.rpc('workshop_leaderboard', {p_code: code});
    if (error) throw error;
    const board = $('board');
    if (!data || !data.length) { board.innerHTML = '<li class="card empty">لا يوجد متفاعلون بعد.</li>'; return; }
    board.innerHTML = data.map((r, i) =>
      `<li class="card rank"><span class="pos">${i + 1}</span><strong>${esc(r.name)}</strong>
         <span class="stat">${Number(r.questions_count)} سؤال${Number(r.images_count) ? ` · ${Number(r.images_count)} صورة` : ''}</span></li>`
    ).join('');
  }

  // ---------- التبويبات ----------
  function showTab(which) {
    const isQ = which === 'q';
    $('tab-q').setAttribute('aria-selected', String(isQ));
    $('tab-l').setAttribute('aria-selected', String(!isQ));
    $('tab-q').tabIndex = isQ ? 0 : -1;
    $('tab-l').tabIndex = isQ ? -1 : 0;
    $('panel-q').hidden = !isQ;
    $('panel-l').hidden = isQ;
    if (!isQ) loadBoard().catch(() => {});
  }
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));

  // ---------- الدخول والخروج ----------
  function unlock() {
    $('gate-section').hidden = true;
    $('qa').hidden = false;
    $('name').value = localStorage.getItem(NAME_KEY) || '';
    showTab('q');
    loadQuestions().catch(() => setMsg($('ask-msg'), 'تعذّر تحميل الأسئلة، حاول مرة ثانية.', false));
  }

  function lock() {
    sessionStorage.removeItem(KEY);
    $('qa').hidden = true;
    $('gate-section').hidden = false;
    $('gate-msg').textContent = '';
    $('code').value = '';
    clearImage();
  }

  if (!sb) {
    setMsg($('gate-msg'), 'تعذّر الاتصال بالخادم. أعد تحميل الصفحة.', false);
    return;
  }

  $('gate-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('code').value.trim();
    const msg = $('gate-msg');
    setMsg(msg, 'جارٍ التحقق…', true);
    const {data, error} = await sb.rpc('workshop_check_code', {p_code: code});
    if (error) { setMsg(msg, 'تعذّر التحقق، حاول مرة ثانية.', false); return; }
    if (data === true) {
      sessionStorage.setItem(KEY, code);
      unlock();
    } else {
      setMsg(msg, 'الرقم السري غير صحيح.', false);
    }
  });

  $('lock').addEventListener('click', lock);

  // ---------- الصورة ----------
  function clearImage() {
    $('image').value = '';
    $('preview').hidden = true;
    $('preview-img').removeAttribute('src');
  }
  $('image').addEventListener('change', () => {
    const file = $('image').files[0];
    if (!file) return clearImage();
    if (!TYPES.includes(file.type)) { setMsg($('ask-msg'), 'الصيغة المسموحة: JPG أو PNG أو WebP.', false); return clearImage(); }
    if (file.size > MAX_IMG) { setMsg($('ask-msg'), 'الصورة أكبر من 5 ميجابايت.', false); return clearImage(); }
    $('preview-img').src = URL.createObjectURL(file);
    $('preview').hidden = false;
  });
  $('remove-img').addEventListener('click', clearImage);

  $('question').addEventListener('input', () => {
    $('count').textContent = `${$('question').value.length} / 500`;
  });

  // ---------- إرسال السؤال ----------
  $('ask-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('name').value.trim();
    const question = $('question').value.trim();
    const file = $('image').files[0] || null;
    const msg = $('ask-msg');
    const code = sessionStorage.getItem(KEY);
    if (!code) { lock(); return; }
    if (name.length < 2 || question.length < 3) { setMsg(msg, 'اكتب اسمك وسؤالك.', false); return; }

    $('send').disabled = true;
    try {
      let imagePath = null;
      if (file) {
        const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
        imagePath = `q/${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from(BUCKET).upload(imagePath, file, {contentType: file.type, upsert: false});
        if (up.error) throw up.error;
      }
      const {error} = await sb.rpc('workshop_ask', {p_code: code, p_name: name, p_question: question, p_image_path: imagePath});
      if (error) {
        if (String(error.message).includes('invalid_code')) { lock(); return; }
        throw error;
      }
      localStorage.setItem(NAME_KEY, name);
      $('question').value = '';
      $('count').textContent = '0 / 500';
      clearImage();
      setMsg(msg, 'تم إرسال سؤالك.', true);
      loadQuestions().catch(() => {});
    } catch (err) {
      setMsg(msg, 'تعذّر إرسال السؤال، حاول مرة ثانية.', false);
    } finally {
      $('send').disabled = false;
    }
  });

  // إذا كان الحاضر دخل من قبل في نفس الجلسة
  if (sessionStorage.getItem(KEY)) unlock();
})();
