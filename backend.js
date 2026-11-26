// الاتصال بـ Supabase — المفتاح هنا عام وآمن، والحماية في قاعدة البيانات نفسها (RLS)
window.CTM_BACKEND = (() => {
  const URL = 'https://jymqwpfiecacwzpkjmjc.supabase.co';
  const KEY = 'sb_publishable_O88OJ8myJEClZWvWmV_R2Q_XrDRrn-S';
  if (!window.supabase) return null;
  const sb = window.supabase.createClient(URL, KEY);
  const BUCKET = 'submissions';

  // مفتاح سري لكل زائر عشان التصويت (ينحفظ في متصفحه بس)
  function voterKey() {
    try {
      let k = localStorage.getItem('ctm-voter');
      if (!k) { k = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().slice(0, 8); localStorage.setItem('ctm-voter', k); }
      return k;
    } catch (e) { return null; }
  }

  async function getSettings() {
    const {data, error} = await sb.from('site_settings').select('next_title,next_date,next_link,challenge_title,challenge_text,challenge_open').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data;
  }
  async function subscribe(email, lang) {
    const {error} = await sb.from('subscribers').insert({email: email.trim().toLowerCase(), lang});
    if (error && error.code !== '23505') throw error; // 23505 = مسجّل من قبل، نعتبرها نجاح
  }
  async function submitWork({name, title, link, file, challenge}) {
    let video_path = null;
    if (file) {
      if (file.size > 50 * 1024 * 1024) throw new Error('size');
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace('quicktime', 'mov');
      if (!['mp4', 'webm', 'mov'].includes(ext)) throw new Error('type');
      video_path = `pending/${crypto.randomUUID()}.${ext}`;
      const up = await sb.storage.from(BUCKET).upload(video_path, file, {contentType: file.type || 'video/mp4', upsert: false});
      if (up.error) throw up.error;
    }
    const {error} = await sb.from('submissions').insert({name, title, link: link || null, video_path, challenge: challenge || null});
    if (error) throw error;
  }
  async function signedUrls(paths) {
    const list = paths.filter(Boolean);
    if (!list.length) return {};
    const {data} = await sb.storage.from(BUCKET).createSignedUrls(list, 60 * 60 * 6);
    const out = {}; (data || []).forEach(d => { if (d.signedUrl) out[d.path] = d.signedUrl; });
    return out;
  }
  async function approvedWorks() {
    const {data, error} = await sb.from('submissions').select('id,name,title,link,video_path,created_at,challenge').eq('status', 'approved').order('created_at', {ascending: false});
    if (error) throw error;
    const urls = await signedUrls(data.map(w => w.video_path));
    const counts = await sb.rpc('vote_counts', {p_voter: voterKey()});
    const map = {}; (counts.data || []).forEach(c => { map[c.submission_id] = c; });
    return data.map(w => ({...w, videoUrl: urls[w.video_path] || '', votes: Number((map[w.id] || {}).votes || 0), mine: !!(map[w.id] || {}).mine}));
  }
  async function toggleVote(id) {
    const k = voterKey(); if (!k) throw new Error('storage');
    const {data, error} = await sb.rpc('toggle_vote', {p_submission: id, p_voter: k});
    if (error) throw error;
    return data;
  }
  return {sb, BUCKET, getSettings, subscribe, submitWork, approvedWorks, toggleVote, signedUrls};
})();
