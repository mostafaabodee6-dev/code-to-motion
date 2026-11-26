(() => {
  const KEY = 'ctm-ws-code';
  const NAME_KEY = 'ctm-ws-name';
  const $ = (id) => document.getElementById(id);
  const sb = window.CTM_BACKEND && window.CTM_BACKEND.sb;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

  function setMsg(el, text, ok) {
    el.textContent = text;
    el.className = 'msg ' + (ok ? 'ok' : 'bad');
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleString('ar-SA', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Riyadh'});
  }

  // العد التنازلي للورشة — السبت 28 نوفمبر 2026 الساعة 6 مساءً بتوقيت الرياض
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

  function renderList(rows) {
    const list = $('list');
    if (!rows.length) { list.innerHTML = '<div class="card empty">لا توجد أسئلة بعد. كن أول من يسأل.</div>'; return; }
    list.innerHTML = rows.map((r) =>
      `<article class="card q"><header><strong>${esc(r.name)}</strong><time>${esc(fmtDate(r.created_at))}</time></header><p>${esc(r.question)}</p></article>`
    ).join('');
  }

  async function loadQuestions() {
    const code = sessionStorage.getItem(KEY);
    if (!code) return;
    const {data, error} = await sb.rpc('workshop_list_questions', {p_code: code});
    if (error) throw error;
    renderList(data || []);
  }

  function unlock() {
    $('gate-section').hidden = true;
    $('qa').hidden = false;
    $('name').value = localStorage.getItem(NAME_KEY) || '';
    loadQuestions().catch(() => setMsg($('ask-msg'), 'تعذّر تحميل الأسئلة، حاول مرة ثانية.', false));
  }

  function lock() {
    sessionStorage.removeItem(KEY);
    $('qa').hidden = true;
    $('gate-section').hidden = false;
    $('gate-msg').textContent = '';
    $('code').value = '';
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

  $('question').addEventListener('input', () => {
    $('count').textContent = `${$('question').value.length} / 500`;
  });

  $('ask-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('name').value.trim();
    const question = $('question').value.trim();
    const msg = $('ask-msg');
    const code = sessionStorage.getItem(KEY);
    if (!code) { lock(); return; }
    if (name.length < 2 || question.length < 3) { setMsg(msg, 'اكتب اسمك وسؤالك.', false); return; }

    $('send').disabled = true;
    const {error} = await sb.rpc('workshop_ask', {p_code: code, p_name: name, p_question: question});
    $('send').disabled = false;
    if (error) {
      if (String(error.message).includes('invalid_code')) { lock(); return; }
      setMsg(msg, 'تعذّر إرسال السؤال، حاول مرة ثانية.', false);
      return;
    }
    localStorage.setItem(NAME_KEY, name);
    $('question').value = '';
    $('count').textContent = '0 / 500';
    setMsg(msg, 'تم إرسال سؤالك.', true);
    loadQuestions().catch(() => {});
  });

  // إذا كان الحاضر دخل من قبل في نفس الجلسة
  if (sessionStorage.getItem(KEY)) unlock();
})();
