(() => {
  const KEY = 'ctm-ws-code';
  const MOD_KEY = 'ctm-ws-mod';
  const NAME_KEY = 'ctm-ws-name';
  const VOTER_KEY = 'ctm-ws-voter';
  const BUCKET = 'workshop-images';
  const MAX_IMG = 5 * 1024 * 1024;
  const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const POLL_MS = 5000;
  const $ = (id) => document.getElementById(id);
  const sb = window.CTM_BACKEND && window.CTM_BACKEND.sb;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const fmt = (iso) => new Date(iso).toLocaleString('ar-SA', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Riyadh'});
  const imgUrl = (path) => sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

  function setMsg(el, text, ok) {
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'bad');
  }

  // مفتاح تصويت ثابت لكل متصفح
  function voterKey() {
    let k = localStorage.getItem(VOTER_KEY);
    if (!k) {
      k = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      localStorage.setItem(VOTER_KEY, k);
    }
    return k;
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
  let modCode = sessionStorage.getItem(MOD_KEY);

  function modButtons(r) {
    if (!modCode) return '';
    const b = (action, label) => `<button type="button" class="btn ghost small" data-act="${action}" data-id="${r.id}">${label}</button>`;
    return `<div class="mod-actions">${b(r.pinned ? 'unpin' : 'pin', r.pinned ? 'إلغاء التثبيت' : 'ثبّت')}
      ${b(r.answered ? 'unanswered' : 'answered', r.answered ? 'رجّعه' : 'تمت الإجابة')}
      ${b('hide', 'إخفاء')}</div>`;
  }

  function renderList(rows) {
    const list = $('list');
    if (!rows.length) { list.innerHTML = '<div class="card empty">لا توجد أسئلة بعد. كن أول من يسأل.</div>'; return; }
    list.innerHTML = rows.map((r) =>
      `<article class="card q ${r.pinned ? 'pinned' : ''} ${r.answered ? 'answered' : ''}">
         <header><strong>${esc(r.name)}</strong><time>${esc(fmt(r.created_at))}</time></header>
         <div class="badges">${r.pinned ? '<span class="badge">مثبّت</span>' : ''}${r.answered ? '<span class="badge ok">تمت الإجابة</span>' : ''}</div>
         <p>${esc(r.question)}</p>
         ${r.image_path ? `<img class="qimg" src="${esc(imgUrl(r.image_path))}" alt="صورة مرفقة مع السؤال" loading="lazy">` : ''}
         <div class="vote-row">
           <button type="button" class="vote ${r.voted ? 'on' : ''}" data-vote="${r.id}" aria-pressed="${r.voted}">▲ ${Number(r.votes)}</button>
         </div>
         ${modButtons(r)}
       </article>`
    ).join('');
  }

  let loading = false;
  async function loadQuestions() {
    const code = sessionStorage.getItem(KEY);
    if (!code || loading) return;
    loading = true;
    try {
      const {data, error} = await sb.rpc('workshop_list_questions', {p_code: code, p_voter: voterKey()});
      if (error) throw error;
      renderList(data || []);
    } finally {
      loading = false;
    }
  }

  // تحديث تلقائي كل بضع ثوانٍ، ويتوقف إذا الصفحة مو ظاهرة
  setInterval(() => {
    if (document.hidden || $('qa').hidden || $('panel-q').hidden) return;
    loadQuestions().catch(() => {});
  }, POLL_MS);

  $('list').addEventListener('click', async (e) => {
    const vote = e.target.closest('[data-vote]');
    const act = e.target.closest('[data-act]');
    const code = sessionStorage.getItem(KEY);
    if (!code) return lock();
    if (vote) {
      vote.disabled = true;
      const {error} = await sb.rpc('workshop_vote', {p_code: code, p_question: vote.dataset.vote, p_voter: voterKey()});
      if (error && String(error.message).includes('invalid_code')) return lock();
      loadQuestions().catch(() => {});
    }
    if (act) {
      if (!modCode) return;
      act.disabled = true;
      const {error} = await sb.rpc('workshop_mod_action', {p_mod: modCode, p_question: act.dataset.id, p_action: act.dataset.act});
      if (error) { setMsg($('mod-msg'), 'تعذّر تنفيذ الإجراء.', false); return; }
      loadQuestions().catch(() => {});
    }
  });

  // ---------- المشرف ----------
  function setModOn(on) {
    $('mod-hint').hidden = !on;
    $('mod-code').value = '';
    $('mod-box').open = on;
    if (!on) sessionStorage.removeItem(MOD_KEY);
  }
  if (modCode) setModOn(true);

  $('mod-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('mod-code').value.trim();
    const msg = $('mod-msg');
    const {data, error} = await sb.rpc('workshop_mod_check', {p_mod: code});
    if (error) { setMsg(msg, 'تعذّر التحقق.', false); return; }
    if (data === true) {
      modCode = code;
      sessionStorage.setItem(MOD_KEY, code);
      setMsg(msg, 'تم تفعيل وضع المشرف.', true);
      setModOn(true);
      loadQuestions().catch(() => {});
    } else {
      setMsg(msg, 'الرمز غير صحيح.', false);
    }
  });

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
    sessionStorage.removeItem(MOD_KEY);
    modCode = null;
    setModOn(false);
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
