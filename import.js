// Goodslist import: jelszavas xlsx feloldasa, beolvasasa, magyar leiras osszeallitasa a VAM Progi kozos szotarabol.
// Minden a bongeszoben fut, a fajl nem hagyja el a gepet; csak a feldolgozott sorok kerulnek az adatbazisba.

// ---------- szotar (a VAM Progi compose.py / dictionary.py portja) ----------
const DICT_URL = 'https://raw.githubusercontent.com/blkvl01/vam-leiro-releases/main/descriptions.json';
const SET_RE = /\s*\d+\s*PCS\s+per\s+set\s*$/i;
const normKey = t => String(t == null ? '' : t).replace(/ /g, ' ').replace(SET_RE, '').replace(/\s+/g, ' ').trim().toLowerCase();
const FRONT = new Set([...'eéiíöőüű']), BACK = new Set([...'aáoóuú']), NEUTRAL = new Set([...'iíé']);
const PLASTIC_FIBRES = new Set(['acrylic', 'nylon', 'polyamide', 'polyester', 'polyester fiber']);
const GENDER_NOUNS = {'férfi': {'bugyi': 'alsónadrág'}, 'fiú': {'bugyi': 'alsónadrág'}};

class Dict {
  constructor(raw) {
    this.revision = raw.revision || 0;
    this.entries = new Map(); this.aliases = new Map();
    (raw.entries || []).forEach(e => this.entries.set(normKey(e.en), e));
    this.entries.forEach((e, k) => (e.aliases || []).forEach(a => { const ak = normKey(a); if (ak && !this.entries.has(ak)) this.aliases.set(ak, k); }));
    const m = o => { const r = {}; Object.entries(o || {}).forEach(([k, v]) => r[normKey(k)] = v); return r; };
    this.materials = m(raw.materials); this.weaves = m(raw.weaves); this.genders = m(raw.genders);
    this.abbr = raw.abbreviation_suffixes || {};
  }
  lookup(en) { const k = normKey(en); return this.entries.get(k) || this.entries.get(this.aliases.get(k)) || null; }
}
async function loadDict() {
  try {
    const r = await fetch(DICT_URL, {cache: 'no-cache'});
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = (await r.text()).replace(/^﻿/, '');
    const raw = JSON.parse(text);
    ls.set('rk_dict', text);
    return {dict: new Dict(raw), source: 'élő'};
  } catch (e) {
    const c = ls.get('rk_dict');
    if (c) return {dict: new Dict(JSON.parse(c)), source: 'helyi másolat'};
    return {dict: null, source: '', error: String(e.message || e)};
  }
}
const stripExpl = n => n.replace(/\s*\([^)]*\)/g, '').trim();
function ablative(phrase, d) {
  const words = phrase.split(' '); let last = words[words.length - 1];
  if (d.abbr[last]) { words[words.length - 1] = last + d.abbr[last]; return words.join(' '); }
  let lowered = last.toLowerCase();
  if (lowered.endsWith('a')) { last = last.slice(0, -1) + 'á'; lowered = lowered.slice(0, -1) + 'á'; }
  else if (lowered.endsWith('e')) { last = last.slice(0, -1) + 'é'; lowered = lowered.slice(0, -1) + 'é'; }
  let suffix = 'ből';
  for (const c of [...lowered].filter(c => FRONT.has(c) || BACK.has(c)).reverse()) {
    if (BACK.has(c)) { suffix = 'ból'; break; }
    if (!NEUTRAL.has(c)) break;
  }
  words[words.length - 1] = last + suffix; return words.join(' ');
}
function parseCommodity(descEn, commEn, d, hs) {
  const base = String(descEn || '').replace(SET_RE, '').trim();
  let rest = String(commEn || '').replace(SET_RE, '').trim();
  if (base && rest.toLowerCase().startsWith(base.toLowerCase())) rest = rest.slice(base.length);
  else if (base) { const parts = rest.split(/\s{2,}/); rest = parts.length > 1 ? parts.slice(1).join('  ') : ''; }
  const materials = []; let weave = '', gender = ''; const unknown = [];
  for (const raw of rest.split(/\s{2,}/)) {
    const seg = raw.replace(/\s+/g, ' ').trim().toLowerCase(); if (!seg) continue;
    if (seg in d.genders) gender = d.genders[seg];
    else if (seg in d.weaves && !(seg in d.materials && !materials.length)) weave = d.weaves[seg];
    else if (seg in d.materials) {
      let hu = d.materials[seg];
      if (PLASTIC_FIBRES.has(seg) && String(hs || '').startsWith('39')) hu = 'műanyag';
      if (hu && !materials.includes(hu)) materials.push(hu);
    } else unknown.push(seg);
  }
  return {materials, weave, gender, unknown};
}
const namedIn = (m, nounFolded) => {
  const t = m.toLowerCase();
  if ((' ' + nounFolded + ' ').includes(' ' + t + ' ')) return true;
  if (t.length < 4 || t.includes(' ')) return false;
  return nounFolded.split(' ').some(w => w.startsWith(t) || w.endsWith(t));
};
function composeHu(nounHu, descEn, commEn, d, hs) {
  const p = parseCommodity(descEn, commEn, d, hs);
  let noun = stripExpl(nounHu);
  noun = (GENDER_NOUNS[p.gender] || {})[noun.toLowerCase()] || noun;
  const nf = noun.toLowerCase(), lead = [];
  if (p.gender && !nf.includes(p.gender.toLowerCase())) lead.push(p.gender);
  if (p.weave && !nf.includes(p.weave.toLowerCase())) lead.push(p.weave);
  let text = [...lead, noun].join(' ').trim();
  const mats = p.materials.filter(m => !namedIn(m, nf));
  if (mats.length) text += ' ' + mats.map(m => ablative(m, d)).join(' és ');
  return {text: text ? text[0].toUpperCase() + text.slice(1) : '', unknown: p.unknown};
}
// magyar leiras egy sorhoz; ha a szotarban nincs, az angol eredeti marad (found=false)
function describeHu(descEn, commEn, hs, dict) {
  const en = String(descEn || '').replace(SET_RE, '').trim();
  const fallback = en ? en[0].toUpperCase() + en.slice(1) : '';
  if (!dict) return {text: fallback, found: false};
  const e = dict.lookup(descEn);
  if (!e) return {text: fallback, found: false};
  const r = composeHu(e.hu, descEn, commEn, dict, hs);
  return {text: r.text || e.hu, found: true};
}

// ---------- xlsx feloldas (Office "Standard" titkositas, AES-ECB) ----------
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let p = 0; a.forEach(x => { o.set(x, p); p += x.length; }); return o; };
const le32 = n => new Uint8Array([n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]);
function sha1(msg) {                                                   // szinkron SHA-1 (a 50 000 koros kulcsszamitashoz)
  const rotl = (x, n) => (x << n) | (x >>> (32 - n));
  const l = msg.length, nb = ((l + 8) >> 6) + 1, w = new Uint32Array(nb * 16 + 80);
  for (let i = 0; i < l; i++) w[i >> 2] |= msg[i] << (24 - (i & 3) * 8);
  w[l >> 2] |= 0x80 << (24 - (l & 3) * 8);
  w[nb * 16 - 1] = l * 8;
  let h0 = 0x67452301, h1 = 0xEFCDAB89, h2 = 0x98BADCFE, h3 = 0x10325476, h4 = 0xC3D2E1F0;
  const x = new Uint32Array(80);
  for (let b = 0; b < nb; b++) {
    for (let i = 0; i < 16; i++) x[i] = w[b * 16 + i];
    for (let i = 16; i < 80; i++) x[i] = rotl(x[i - 3] ^ x[i - 8] ^ x[i - 14] ^ x[i - 16], 1);
    let a = h0, bb = h1, c = h2, d = h3, e = h4;
    for (let i = 0; i < 80; i++) {
      const f = i < 20 ? (bb & c) | (~bb & d) : i < 40 ? bb ^ c ^ d : i < 60 ? (bb & c) | (bb & d) | (c & d) : bb ^ c ^ d;
      const k = i < 20 ? 0x5A827999 : i < 40 ? 0x6ED9EBA1 : i < 60 ? 0x8F1BBCDC : 0xCA62C1D6;
      const t = (rotl(a, 5) + f + e + k + x[i]) | 0; e = d; d = c; c = rotl(bb, 30); bb = a; a = t;
    }
    h0 = (h0 + a) | 0; h1 = (h1 + bb) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0;
  }
  const o = new Uint8Array(20); [h0, h1, h2, h3, h4].forEach((v, i) => { o[i * 4] = v >>> 24; o[i * 4 + 1] = (v >>> 16) & 255; o[i * 4 + 2] = (v >>> 8) & 255; o[i * 4 + 3] = v & 255; });
  return o;
}
async function aesEcbDecrypt(keyBytes, data) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['encrypt', 'decrypt']);
  const pad = new Uint8Array(await crypto.subtle.encrypt({name: 'AES-CBC', iv: data.slice(data.length - 16)}, key, new Uint8Array(0)));
  const plain = new Uint8Array(await crypto.subtle.decrypt({name: 'AES-CBC', iv: new Uint8Array(16)}, key, cat(data, pad)));
  for (let i = plain.length - 1; i >= 16; i--) plain[i] ^= data[i - 16];   // a CBC lanc visszaforgatasa = ECB
  return plain;
}
class ImportError extends Error {}
async function decryptXlsx(buf, password) {
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0x50 && u8[1] === 0x4B) return buf;                        // nincs titkositva (zip)
  if (!(u8[0] === 0xD0 && u8[1] === 0xCF)) throw new ImportError('Ez nem Excel (xlsx) fájl.');
  const cfb = CFB.read(u8, {type: 'array'});
  const ei = CFB.find(cfb, '/EncryptionInfo'), ep = CFB.find(cfb, '/EncryptedPackage');
  if (!ei || !ep) throw new ImportError('A fájl titkosítása ismeretlen.');
  const info = Uint8Array.from(ei.content), pkg = Uint8Array.from(ep.content);
  const dv = new DataView(info.buffer);
  if (dv.getUint16(0, true) !== 4 || dv.getUint16(2, true) !== 2) throw new ImportError('Nem támogatott titkosítás (csak a Standard típus).');
  const hdr = dv.getUint32(8, true), keySize = dv.getUint32(28, true);
  const v = 12 + hdr, saltSize = dv.getUint32(v, true);
  const salt = info.slice(v + 4, v + 4 + saltSize), encVer = info.slice(v + 4 + saltSize, v + 20 + saltSize);
  const encVerHash = info.slice(v + 24 + saltSize, v + 56 + saltSize);
  const pw = new Uint8Array([...password].flatMap(c => [c.charCodeAt(0) & 255, c.charCodeAt(0) >> 8]));
  await new Promise(r => setTimeout(r, 0));
  let h = sha1(cat(salt, pw));
  for (let i = 0; i < 50000; i++) h = sha1(cat(le32(i), h));
  const hf = sha1(cat(h, le32(0)));
  const b1 = new Uint8Array(64).fill(0x36), b2 = new Uint8Array(64).fill(0x5C);
  for (let i = 0; i < 20; i++) { b1[i] ^= hf[i]; b2[i] ^= hf[i]; }
  const key = cat(sha1(b1), sha1(b2)).slice(0, keySize / 8);
  const verifier = await aesEcbDecrypt(key, encVer), vhash = (await aesEcbDecrypt(key, encVerHash)).slice(0, 20);
  const chk = sha1(verifier);
  if (!chk.every((b, i) => b === vhash[i])) throw new ImportError('Hibás jelszó.');
  const size = new DataView(pkg.buffer, pkg.byteOffset).getUint32(0, true);
  const data = pkg.slice(8); const full = data.slice(0, data.length - (data.length % 16));
  return (await aesEcbDecrypt(key, full)).slice(0, size).buffer;
}

// ---------- xlsx olvasas (zip + XML) ----------
async function inflateRaw(u8) {
  const s = new Blob([u8]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function unzip(buf) {
  const u = new Uint8Array(buf), dv = new DataView(buf); let e = u.length - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new ImportError('Sérült xlsx fájl.');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true); const files = {};
  for (let i = 0; i < n; i++) {
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), el = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u.slice(p + 46, p + 46 + nl));
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    files[name] = async () => { const d = u.slice(start, start + csize); return new TextDecoder().decode(method === 0 ? d : await inflateRaw(d)); };
    p += 46 + nl + el + cl;
  }
  return files;
}
const xml = t => new DOMParser().parseFromString(t, 'application/xml');
const colIdx = ref => { let n = 0; for (const ch of ref.replace(/\d/g, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
async function readSheet(buf) {
  const z = await unzip(buf);
  const wb = xml(await z['xl/workbook.xml']()), rels = xml(await z['xl/_rels/workbook.xml.rels']());
  const sheets = [...wb.getElementsByTagName('sheet')];
  const sh = sheets.find(s => /^goodlist$/i.test(s.getAttribute('name'))) || sheets[0];
  const rid = sh.getAttribute('r:id') || sh.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const rel = [...rels.getElementsByTagName('Relationship')].find(r => r.getAttribute('Id') === rid);
  const target = rel.getAttribute('Target').replace(/^\//, '');
  const shared = z['xl/sharedStrings.xml'] ? [...xml(await z['xl/sharedStrings.xml']()).getElementsByTagName('si')].map(si => [...si.getElementsByTagName('t')].map(t => t.textContent).join('')) : [];
  const doc = xml(await z[target.startsWith('xl/') ? target : 'xl/' + target]());
  return [...doc.getElementsByTagName('row')].map(row => {
    const out = [];
    for (const c of row.getElementsByTagName('c')) {
      const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
      let val = '';
      if (t === 's') val = shared[+v.textContent]; else if (t === 'inlineStr') val = [...c.getElementsByTagName('t')].map(x => x.textContent).join(''); else if (v) val = v.textContent;
      out[colIdx(c.getAttribute('r'))] = val;
    }
    return out;
  });
}

// ---------- egy goodslist feldolgozasa ----------
const awbFromName = n => (n.match(/J1zTM\d+/i) || n.match(/\d{3}-\d{7,8}/) || [n.replace(/\.xlsx?$/i, '')])[0];
async function parseGoodslist(file, password, dict) {
  const buf = await decryptXlsx(await file.arrayBuffer(), password);
  const rows = await readSheet(buf);
  const head = (rows[0] || []).map(h => String(h || '').trim());
  const ix = n => head.findIndex(h => h.toLowerCase() === n.toLowerCase());
  const c = {sku: ix('SKU'), desc: ix('Description of Goods'), comm: ix('Commodity Description'), hs: ix('HS Code'), qty: ix('QTY'), gw: ix('total G/W(kg)'), carton: ix('Carton No.'), mark: ix('Mark No.')};
  if (c.sku < 0 || c.carton < 0 || c.qty < 0) throw new ImportError('Nem goodslist: hiányzik a SKU, QTY vagy Carton No. oszlop.');
  const lines = [], missing = new Map(); let found = 0;
  for (const r of rows.slice(1)) {
    const carton = String(r[c.carton] || '').trim(), sku = String(r[c.sku] || '').trim();
    if (!carton || !sku) continue;
    const en = String(r[c.desc] || '').trim(), d = describeHu(en, r[c.comm], r[c.hs], dict);
    if (d.found) found++; else if (en) missing.set(en, (missing.get(en) || 0) + 1);
    lines.push([carton, sku, d.text, en, Math.round(Number(r[c.qty]) || 0), Math.round((Number(r[c.gw]) || 0) * 1000) / 1000]);
  }
  if (!lines.length) throw new ImportError('A fájlban nincs adatsor.');
  const mark = String(((rows[1] || [])[c.mark]) || '').trim();
  return {file: file.name, awb: awbFromName(file.name), mark, lines, found, missing: [...missing.entries()].sort((a, b) => b[1] - a[1]),
    cartons: new Set(lines.map(l => l[0])).size, qty: lines.reduce((a, l) => a + l[4], 0)};
}
