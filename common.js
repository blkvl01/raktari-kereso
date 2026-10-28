// Kozos logika: adatbazis, adatbetoltes, gyorsitotar, kod ertelmezes. PDA es admin felulet is ezt hasznalja.
const SB_URL = 'https://pfqecgcsmswholidmadi.supabase.co';
const SB_KEY = 'sb_publishable_msFV8PSILVAVEmnAf7A4BQ_2-kv7oZU';
const sb = window.supabase.createClient(SB_URL, SB_KEY, {auth: {persistSession: false}});

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, m => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[m]));
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
const ICON = {
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
  box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  check: '<path pathLength="1" d="M20 6L9 17l-5-5"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  wifi: '<path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01"/>',
  off: '<path d="M2 2l20 20M8.5 16a5 5 0 0 1 7 0M5 12.5a10 10 0 0 1 4-2.4M12 20h.01"/>',
  undo: '<path d="M3 7v6h6M3 13a9 9 0 1 0 3-7"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/>',
  vol: '<path d="M11 5L6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5L6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
  print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v7H6z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M17 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-5-6.7"/>',
  dl: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
  up: '<path d="M12 15V3M7 8l5-5 5 5M4 21h16"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15M10 11v6M14 11v6"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chev: '<path d="M6 9l6 6 6-6"/>'
};
const ic = n => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${ICON[n]}</svg>`;
const short = c => c.slice(-6);
const fmtT = t => new Date(t).toLocaleTimeString('hu', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
const fmtDT = t => new Date(t).toLocaleString('hu', {month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});

// ---------- adat ----------
const D = {lines: [], byKey: new Map(), byCarton: new Map(), byId: new Map(), cartonByDigits: new Map(),
  awbs: new Map(), open: new Map(), lineDone: new Map(), claims: new Map(), parked: new Map(), parkInfo: new Map(), parkShared: true, sig: '', online: true, err: ''};

function indexLines() {
  D.byKey = new Map(); D.byCarton = new Map(); D.byId = new Map(); D.cartonByDigits = new Map();
  D.lines.forEach(l => {
    (D.byKey.get(l.key) || D.byKey.set(l.key, []).get(l.key)).push(l);
    (D.byCarton.get(l.carton) || D.byCarton.set(l.carton, []).get(l.carton)).push(l);
    D.byId.set(l.id, l);
    D.cartonByDigits.set(l.carton.replace(/\D/g, ''), l.carton);
  });
}
async function fetchAll(table, order) {
  let out = [], from = 0;
  for (;;) {
    const {data, error} = await sb.from(table).select('*').order(order).range(from, from + 999);
    if (error) throw error;
    out = out.concat(data);
    if (data.length < 1000) return out;
    from += 1000;
  }
}
function loadCache() {
  try {
    const c = JSON.parse(ls.get('rk_cache_v2') || 'null');
    if (!c) return false;
    D.awbs = new Map(c.awbs.map(a => [a.id, a]));
    D.lines = c.lines.map(r => ({id: r[0], awb: r[1], carton: r[2], sku: r[3], key: r[4], descr: r[5], mat: r[6], qty: r[7], gw: r[8]}));
    D.sig = c.sig; indexLines(); return true;
  } catch (e) { return false; }
}
function saveCache(awbs) {
  try { ls.set('rk_cache_v2', JSON.stringify({sig: D.sig, awbs, lines: D.lines.map(l => [l.id, l.awb, l.carton, l.sku, l.key, l.descr, l.mat, l.qty, l.gw])})); } catch (e) {}
}
async function loadLines() {
  const [awbs, lines] = await Promise.all([fetchAll('rk_awb', 'id'), fetchAll('rk_lines', 'id')]);
  D.awbs = new Map(awbs.map(a => [a.id, a]));
  D.lines = lines; D.sig = awbs.map(a => a.id + a.loaded_at).sort().join('|'); indexLines(); saveCache(awbs);
}
async function loadOpen() {
  const [o, s, k] = await Promise.all([sb.from('rk_open').select('*'), sb.from('rk_linestat').select('*'), sb.from('rk_claims').select('*')]);
  if (o.error) throw o.error;
  if (s.error) throw s.error;
  if (k.error) throw k.error;
  D.open = new Map(o.data.map(r => [r.carton, r]));
  D.lineDone = new Map(s.data.map(r => [r.line_id, r]));
  D.claims = new Map(k.data.map(r => [r.carton, r]));
  await loadParked();
}
// felretett polc: termek kulcs -> darab, minden eszkoz kozosen latja (rk_parked tabla).
// Amig a tabla nincs letrehozva (sql/v2.2_felretett_polc.sql), eszkozonkent helyben tarolodik.
async function loadParked() {
  const {data, error} = await sb.from('rk_parked').select('*');
  if (error && !/rk_parked|does not exist|schema cache/i.test(error.message || '')) throw error;
  D.parkShared = !error;
  if (error) { try { D.parked = new Map(JSON.parse(ls.get('rk_parked_local') || '[]')); } catch (e) { D.parked = new Map(); } }
  else { D.parked = new Map(data.filter(r => r.n > 0).map(r => [r.key, r.n])); D.parkInfo = new Map(data.map(r => [r.key, r])); }
}
// full=true: goodslist ujratoltese is; kulonben csak ha valtozott
async function refreshData(full) {
  try {
    if (full) await loadLines();
    else {
      const {data, error} = await sb.from('rk_awb').select('id,loaded_at');
      if (error) throw error;
      if (data.map(a => a.id + a.loaded_at).sort().join('|') !== D.sig) await loadLines();
    }
    await loadOpen();
    D.online = true; D.err = '';
  } catch (e) { D.online = false; D.err = String(e.message || e); }
}
function watch(cb) {
  sb.channel('rk_ch').on('postgres_changes', {event: '*', schema: 'public', table: 'rk_open'}, () => loadOpen().then(cb).catch(() => {}))
    .on('postgres_changes', {event: '*', schema: 'public', table: 'rk_linestat'}, () => loadOpen().then(cb).catch(() => {}))
    .on('postgres_changes', {event: '*', schema: 'public', table: 'rk_claims'}, () => loadOpen().then(cb).catch(() => {}))
    .on('postgres_changes', {event: '*', schema: 'public', table: 'rk_parked'}, () => loadParked().then(cb).catch(() => {})).subscribe();
}

// ---------- szamitott ertekek ----------
const cartonStatus = c => (D.open.get(c) || {}).status || null;       // null | 'open' | 'done'
// tetel allapot: nincs sor = 0 db, got=null (regi "kesz" jeloles) = teljes, kulonben a darabszam
function lineGot(l) { const r = D.lineDone.get(l.id); return r ? (r.got == null ? l.qty : Math.min(r.got, l.qty)) : 0; }
const isLineDone = l => { const r = D.lineDone.get(l.id); return !!r && (r.got == null || r.got >= l.qty); };
const CLAIM_TTL = 3 * 3600e3;                 // 3 ora utan a foglalas lejar
const claimOf = c => { const r = D.claims.get(c); return r && Date.now() - new Date(r.ts) < CLAIM_TTL ? r.device : null; };
function cartonProg(c) {
  const ls_ = D.byCarton.get(c) || [];
  let done = 0, got = 0, qty = 0;
  ls_.forEach(l => { qty += l.qty; const g = lineGot(l); got += g; if (g >= l.qty) done++; });
  return {n: ls_.length, done, qty, got, qtyDone: got, ratio: qty ? got / qty : 0};
}
const remPieces = c => (D.byCarton.get(c) || []).reduce((a, l) => a + (l.qty - lineGot(l)), 0);
const keyName = k => ((D.byKey.get(k) || [])[0] || {}).descr || k;
// meg nem nyitott dobozok a felretett polc alapjan: mennyi van meg belole, mi hianyzik.
// full: minden darabja a polcon van, ez legyen a kovetkezo doboz.
// egy meg nem nyitott doboz lefedettsege a polc (pk: termek kulcs -> darab) alapjan
function coverage(c, pk) {
  const need = new Map();
  D.byCarton.get(c).forEach(l => need.set(l.key, (need.get(l.key) || 0) + l.qty - lineGot(l)));
  let have = 0, total = 0; const miss = [];
  need.forEach((q, k) => { const h = Math.min(q, pk.get(k) || 0); have += h; total += q; if (h < q) miss.push({k, n: q - h}); });
  return {c, have, total, miss, full: total > 0 && have >= total, ratio: total ? have / total : 0};
}
function collected() {
  const cs = new Set();
  D.parked.forEach((n, k) => (D.byKey.get(k) || []).forEach(l => { if (!cartonStatus(l.carton)) cs.add(l.carton); }));
  return [...cs].map(c => coverage(c, D.parked)).filter(x => x.have > 0)
    .sort((a, b) => b.full - a.full || (a.full ? b.total - a.total : b.ratio - a.ratio || b.have - a.have) || a.c.localeCompare(b.c));
}
// uj doboz valasztasa egy termekhez: a polc + ez a darab alapjan a legjobban lefedett doboz elol
function newBoxCands(key) {
  const pk = new Map(D.parked); pk.set(key, (pk.get(key) || 0) + 1);
  const cs = new Set((D.byKey.get(key) || []).filter(l => !cartonStatus(l.carton) && lineGot(l) < l.qty).map(l => l.carton));
  return [...cs].map(c => coverage(c, pk))
    .sort((a, b) => b.full - a.full || b.ratio - a.ratio || a.total - b.total || a.c.localeCompare(b.c));
}
function awbTag(l) { return `<span class="tag mono" title="AWB">${esc(l.awb)}</span>`; }
// kor alaku haladasjelzo (0..1)
function ring(ratio, size, label) {
  const w = 6, r = (size - w) / 2, c = 2 * Math.PI * r, done = ratio >= 1;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label || Math.round(ratio * 100) + '% kész')}" style="flex:none">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${w}"/>
    <circle class="rg" style="--c:${c}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${done ? 'var(--ok-strong)' : 'var(--accent)'}" stroke-width="${w}" stroke-linecap="round"
      stroke-dasharray="${c * Math.min(1, ratio)} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>`;
}

// ---------- szkennelt kod ertelmezese ----------
// Doboz azonosito: pontosan RQ-XPW + 10 szamjegy (mint a goodslistben). Mas formatumot nem fogadunk el dobozkent.
const CARTON_RE = /^RQ-XPW\d{10}$/;
// AWB jelolo: a legrovidebb egyedi vegzodes (min. 4 jegy) + AWB-nkent allando szin, hogy tobb AWB ranezesre elvaljon
let awbMeta = {sig: null, m: new Map()};
function awbInfo(a) {
  if (awbMeta.sig !== D.sig + D.awbs.size) {
    const ids = [...D.awbs.keys()].sort(), m = new Map();
    ids.forEach((id, i) => { let n = 4; while (n < id.length && ids.some(o => o !== id && o.endsWith(id.slice(-n)))) n++; m.set(id, {s: id.slice(-n), i: i % 6}); });
    awbMeta = {sig: D.sig + D.awbs.size, m};
  }
  return awbMeta.m.get(a) || {s: String(a || '').slice(-4), i: 0};
}
function awbChip(a) { if (!a) return ''; const x = awbInfo(a); return `<span class="awbt" style="--awb:var(--awb-${x.i})" title="AWB ${esc(a)}">AWB ${esc(x.s)}</span>`; }
const cartonAwb = c => ((D.byCarton.get(c) || [])[0] || {}).awb || '';
// egy termek mely AWB-k dobozaiba kell (alapbol: meg nem nyitott dobozok, ahol van hely)
function keyAwbChips(key, pred) {
  pred = pred || (l => !cartonStatus(l.carton) && lineGot(l) < l.qty);
  return [...new Set((D.byKey.get(key) || []).filter(pred).map(l => l.awb))].sort().map(awbChip).join('');
}
// noAwb: ahol mellette kulon AWB oszlop van
function idHtml(c, stack, noAwb) {
  return `<span class="idc${stack ? ' stack' : ''}"><span class="idp">${esc(c.slice(0, -4))}</span><b class="id4">${esc(c.slice(-4))}</b>${noAwb ? '' : awbChip(cartonAwb(c))}</span>`;
}
function classify(raw) {
  const t = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (CARTON_RE.test(t)) return {kind: 'carton', carton: t};
  if (/^RQ/.test(t) || /XPW/.test(t)) return {kind: 'badcarton', raw: raw.trim()};
  const digits = t.replace(/\D/g, '');
  const onlyNum = /^[\d-]+$/.test(t);
  const key = t.split('-')[0].replace(/\D/g, '').replace(/^0+/, '');
  if (onlyNum && key && D.byKey.has(key)) return {kind: 'sku', key};
  if (onlyNum && digits.length >= 4 && digits.length < 10) {
    const skus = [...D.byKey.keys()].filter(k => k.endsWith(digits)).slice(0, 25);
    if (skus.length === 1) return {kind: 'sku', key: skus[0]};
    if (skus.length) return {kind: 'cands', skus};
  }
  return {kind: 'unknown', raw: raw.trim(), key};
}

// ---------- tobb kereses egyszerre ----------
// A keresomezok (data-multi) soronkent beillesztett listat is elfogadnak: a sima beviteli mezo kiszedne a sortoreseket,
// ezert beillesztesnel a sorok "; "-vel fuzodnek ossze. Kezzel ; vagy , jellel lehet tobbet beirni.
const multiTerms = q => String(q || '').split(/[\r\n\t;,]+/).map(s => s.trim()).filter(Boolean);
document.addEventListener('paste', e => {
  const t = e.target; if (!(t instanceof HTMLInputElement) || !('multi' in t.dataset)) return;
  const s = (e.clipboardData || window.clipboardData).getData('text'); if (!/[\r\n\t]/.test(s.trim())) return;
  e.preventDefault();
  const a = t.selectionStart ?? t.value.length, b = t.selectionEnd ?? a, pre = t.value.slice(0, a), post = t.value.slice(b);
  t.value = pre + (pre.trim() && !/[;,]\s*$/.test(pre) ? '; ' : '') + multiTerms(s).join('; ') + post;
  t.dispatchEvent(new Event('input', {bubbles: true}));
});

// ---------- kozos UI ----------
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
// a bezaras is animalt: a close() elobb lejatssza a kifutast
(() => {
  const orig = HTMLDialogElement.prototype.close;
  HTMLDialogElement.prototype.close = function (v) {
    if (!this.open || this._closing || reduceMotion) return orig.call(this, v);
    this._closing = true; const tok = this._tok = (this._tok || 0) + 1;
    this.classList.add('closing');
    setTimeout(() => { if (this._tok !== tok) return; this.classList.remove('closing'); this._closing = false; orig.call(this, v); }, 200);
  };
})();
function dialog(html) {
  const d = $('#dlg'); d._tok = (d._tok || 0) + 1; d._closing = false; d.classList.remove('closing');
  d.innerHTML = html; if (!d.open) d.showModal(); return d;
}
function confirmDlg(text, okLabel, danger) {
  return new Promise(res => {
    const d = dialog(`<h2>${esc(text)}</h2><div class="row"><button class="btn" id="n">Mégse</button><button class="btn ${danger ? 'dng' : 'pri'}" id="y">${esc(okLabel)}</button></div>`);
    d.querySelector('#n').onclick = () => { d.close(); res(false); };
    d.querySelector('#y').onclick = () => { d.close(); res(true); };
    d.oncancel = () => res(false);
  });
}
function toast(t) {
  let e = $('#toast');
  if (!e) { e = document.createElement('div'); e.id = 'toast'; e.className = 'toast'; e.setAttribute('role', 'status'); document.body.append(e); }
  e.textContent = t; void e.offsetWidth; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 2200);
}
// ugyanaz a HTML nem rajzolodik ujra: nincs villogas, nincs ismetelt animacio
function setHtml(el, html, force) { if (!force && el._h === html) return false; el.innerHTML = html; el._h = html; return true; }
// szamok szamlalo-animacioja
function countUp(el, to, ms) {
  const from = +el.dataset.from || 0; if (reduceMotion || from === to) { el.textContent = to; el.dataset.from = to; return; }
  const t0 = performance.now(); ms = ms || 700;
  (function f(t) { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(f); else el.dataset.from = to; })(t0);
}
function csv(rows, name) {
  const t = '\ufeff' + rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], {type: 'text/csv'})); a.download = name; a.click();
}
