// لوحة الإدارة — كل العمليات محمية في قاعدة البيانات: غير المشرف ما يقدر يقرأ أو يعدّل حتى لو عدّل الكود
{
const B = window.CTM_BACKEND, sb = B.sb;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d).toLocaleString('ar-SA-u-nu-latn', {day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit'});

let status = 'pending', subs = [];

// ── الدخول بكلمة مرور (ورابط إيميل لأول مرة أو لو نسيت)
const show2 = id => ['login', 'denied', 'panel', 'setpw'].forEach(x => $('#' + x).hidden = x !== id);
$('#pwForm').addEventListener('submit', async e => {
  e.preventDefault(); $('#loginMsg').textContent = '…';
  const {error} = await sb.auth.signInWithPassword({email: $('#email').value.trim(), password: $('#pw').value});
  $('#loginMsg').textContent = error ? (error.message.includes('Invalid') ? 'الإيميل أو كلمة المرور غلط' : 'ما قدرت أدخلك: ' + error.message) : '';
});
$('#linkBtn').addEventListener('click', async () => {
  const email = $('#email').value.trim(); if (!email) { $('#loginMsg').textContent = 'اكتب إيميلك فوق أول'; return; }
  const {error} = await sb.auth.signInWithOtp({email, options: {emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true}});
  $('#loginMsg').textContent = error ? 'ما انرسل: ' + error.message : 'أرسلت لك رابط على إيميلك ✓ افتحه من نفس الجهاز.';
});
async function setPassword(p1, p2, msgEl) {
  if (p1 !== p2) { msgEl.textContent = 'الكلمتين مو متطابقتين'; return false; }
  const {error} = await sb.auth.updateUser({password: p1});
  msgEl.textContent = error ? 'ما انحفظت: ' + error.message : 'انحفظت ✓ من الحين تدخل بالإيميل وكلمة المرور.';
  return !error;
}
$('#newPwForm').addEventListener('submit', async e => { e.preventDefault(); if (await setPassword($('#np1').value, $('#np2').value, $('#npMsg'))) setTimeout(() => location.reload(), 1200); });
$('#acctForm').addEventListener('submit', async e => { e.preventDefault(); if (await setPassword($('#ap1').value, $('#ap2').value, $('#apMsg'))) e.target.reset(); });
$('#out').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });

async function start(session) {
  if (!session) { show2('login'); $('#out').hidden = true; $('#me').textContent = ''; return; }
  $('#me').textContent = session.user.email; $('#out').hidden = false;
  const {data: ok} = await sb.rpc('is_admin');
  if (!ok) { show2('denied'); return; }
  show2('panel'); loadWorks(); loadSubs(); loadNext(); loadCh(); counts();
}
sb.auth.onAuthStateChange((ev, session) => { if (ev === 'PASSWORD_RECOVERY') { show2('setpw'); return; } start(session); });

// ── التبويبات
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tab) { document.querySelectorAll('#tabs button').forEach(x => x.setAttribute('aria-pressed', x === b)); document.querySelectorAll('[data-panel]').forEach(p => p.hidden = p.dataset.panel !== b.dataset.tab); }
  if (b.dataset.status) { status = b.dataset.status; document.querySelectorAll('#seg button').forEach(x => x.setAttribute('aria-pressed', x === b)); loadWorks(); }
  if (b.dataset.act) act(b);
  if (b.dataset.delsub) delSub(b);
});

async function counts() {
  const p = await sb.from('submissions').select('id', {count: 'exact', head: true}).eq('status', 'pending');
  $('#cPending').textContent = p.count ? p.count : '';
}

// ── الأعمال
async function loadWorks() {
  const box = $('#works'); box.innerHTML = '<div class="empty">أحمّل…</div>';
  const {data, error} = await sb.from('submissions').select('*').eq('status', status).order('created_at', {ascending: false});
  if (error) { box.innerHTML = `<div class="empty">ما قدرت أحمّل: ${esc(error.message)}</div>`; return; }
  if (!data.length) { box.innerHTML = `<div class="empty">${status === 'pending' ? 'ما فيه أعمال تنتظر المراجعة 🎉' : 'ما فيه شي هنا'}</div>`; return; }
  const urls = await B.signedUrls(data.map(w => w.video_path));
  box.innerHTML = data.map(w => {
    const url = urls[w.video_path] || '', link = /^https:\/\//.test(w.link || '') ? w.link : '';
    return `<article class="work">${url ? `<video src="${esc(url)}" controls playsinline preload="metadata"></video>` : '<div class="ph">بدون فيديو</div>'}
      <div class="in"><span class="badge ${w.status}">${{pending: 'تنتظر', approved: 'معتمد', rejected: 'مرفوض'}[w.status]}</span>
      <h3>${esc(w.title)}</h3><div class="mute">${esc(w.name)} · ${fmt(w.created_at)}${w.challenge ? ` · 🏆 ${esc(w.challenge)}` : ''}</div>
      ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">فتح المنشور ↗</a>` : ''}
      <div class="acts">
        ${w.status !== 'approved' ? `<button class="btn ok sm" data-act="approve" data-id="${w.id}">اعتماد ✓</button>` : `<button class="btn sm" data-act="hide" data-id="${w.id}">إخفاء من المعرض</button>`}
        ${w.status === 'pending' ? `<button class="btn sm" data-act="reject" data-id="${w.id}">رفض</button>` : ''}
        <button class="btn bad sm" data-act="delete" data-id="${w.id}" data-path="${esc(w.video_path || '')}">حذف نهائي</button>
      </div></div></article>`;
  }).join('');
}
async function act(b) {
  const id = b.dataset.id, a = b.dataset.act;
  if (a === 'delete' && b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟ اضغط مرة ثانية'; setTimeout(() => { b.dataset.sure = ''; b.textContent = 'حذف نهائي'; }, 4000); return; }
  b.disabled = true;
  let error;
  if (a === 'delete') {
    if (b.dataset.path) await sb.storage.from(B.BUCKET).remove([b.dataset.path]);
    ({error} = await sb.from('submissions').delete().eq('id', id));
  } else {
    const st = {approve: 'approved', reject: 'rejected', hide: 'pending'}[a];
    ({error} = await sb.from('submissions').update({status: st}).eq('id', id));
  }
  if (error) { alertMsg(error.message); b.disabled = false; return; }
  loadWorks(); counts();
}
function alertMsg(m) { const el = document.createElement('p'); el.className = 'msg'; el.textContent = 'صار خطأ: ' + m; $('#works').prepend(el); }

// ── المشتركين
async function loadSubs() {
  const {data, error} = await sb.from('subscribers').select('id,email,lang,created_at').order('created_at', {ascending: false});
  if (error) { $('#subs').innerHTML = `<div class="empty">${esc(error.message)}</div>`; return; }
  subs = data;
  $('#cSubs').textContent = subs.length || ''; $('#subsCount').textContent = `عدد المشتركين: ${subs.length}`;
  $('#subs').innerHTML = subs.length ? `<table><thead><tr><th>الإيميل</th><th>اللغة</th><th>التاريخ</th><th></th></tr></thead><tbody>${subs.map(s => `<tr><td class="mono">${esc(s.email)}</td><td>${s.lang === 'en' ? 'EN' : 'ع'}</td><td>${fmt(s.created_at)}</td><td><button class="btn bad sm" data-delsub="${s.id}">حذف</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty">ما فيه مشتركين للحين</div>';
}
async function delSub(b) {
  if (b.dataset.sure !== '1') { b.dataset.sure = '1'; b.textContent = 'متأكد؟'; return; }
  await sb.from('subscribers').delete().eq('id', b.dataset.delsub); loadSubs();
}
$('#copyEmails').addEventListener('click', async () => { try { await navigator.clipboard.writeText(subs.map(s => s.email).join(', ')); $('#subsCount').textContent = 'تم النسخ ✓'; } catch (e) {} });
$('#csv').addEventListener('click', () => {
  const rows = [['email', 'lang', 'created_at'], ...subs.map(s => [s.email, s.lang, s.created_at])].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + rows.join('\n')], {type: 'text/csv'})); a.download = 'subscribers.csv'; a.click();
});

// ── الورشة الجاية
const toLocal = iso => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
async function loadNext() {
  const d = await B.getSettings().catch(() => null); if (!d) return;
  $('#nTitle').value = d.next_title || ''; $('#nLink').value = d.next_link || ''; $('#nDate').value = toLocal(d.next_date);
}
async function saveNext(clear) {
  const link = $('#nLink').value.trim();
  if (link && !/^https:\/\//.test(link)) { $('#nMsg').textContent = 'الرابط لازم يبدأ بـ https://'; return; }
  const next_date = clear || !$('#nDate').value ? null : new Date($('#nDate').value).toISOString();
  const {error} = await sb.from('site_settings').update({next_title: $('#nTitle').value.trim() || null, next_date, next_link: link || null, updated_at: new Date().toISOString()}).eq('id', 1);
  $('#nMsg').textContent = error ? 'ما انحفظ: ' + error.message : 'انحفظ ✓ يظهر في الموقع على طول.';
  if (clear && !error) $('#nDate').value = '';
}
$('#nextForm').addEventListener('submit', e => { e.preventDefault(); saveNext(false); });

// ── تحدي الموشن
async function loadCh() {
  const d = await B.getSettings().catch(() => null); if (!d) return;
  $('#cTitle').value = d.challenge_title || ''; $('#cText').value = d.challenge_text || ''; $('#cOpen').checked = !!d.challenge_open;
}
$('#chAdmin').addEventListener('submit', async e => {
  e.preventDefault();
  const title = $('#cTitle').value.trim();
  if ($('#cOpen').checked && !title) { $('#cMsg').textContent = 'اكتب عنوان التحدي قبل ما تفتحه'; return; }
  const {error} = await sb.from('site_settings').update({challenge_title: title || null, challenge_text: $('#cText').value.trim() || null, challenge_open: $('#cOpen').checked, updated_at: new Date().toISOString()}).eq('id', 1);
  $('#cMsg').textContent = error ? 'ما انحفظ: ' + error.message : 'انحفظ ✓ يظهر في صفحة التحدي خلال ثواني.';
});
$('#nClear').addEventListener('click', () => saveNext(true));
}
