/* 今日はC&Aの何の日？｜画面 Ver.2.3.2
 * ON THIS DAY: 日本時間の本日と日付が完全一致する開催予定を優先案内。
 * 表示専用。データ、ID、status、出典、既存の検索・日付操作は変更しない。
 * ca-ver39.js / ca-ver41.js より後に読み込む。
 */
(() => {
  'use strict';
  const EVENTS = Array.isArray(window.CA_EVENT_DATA?.events) ? window.CA_EVENT_DATA.events : [];
  const $ = id => document.getElementById(id);
  const DAY = $('day-events');
  const SELECTED = $('selected-date');
  const SUMMARY = $('day-summary');
  if (!EVENTS.length || !DAY || !SELECTED || !SUMMARY || $('ca232-today-banner')) return;

  const style = document.createElement('style');
  style.id = 'ca232-today-style';
  style.textContent = `
    .ca232-today-banner{margin:0 0 17px;padding:15px 16px;border:2px solid #edc16b;
      border-left:6px solid #f4c56a;border-radius:12px;
      background:linear-gradient(120deg,#35425b,#202f49 82%);color:#fff;min-width:0}
    .ca232-today-heading{display:flex;align-items:center;flex-wrap:wrap;gap:7px 10px;
      margin-bottom:5px}
    .ca232-today-label{display:inline-flex;align-items:center;gap:6px;border-radius:6px;
      background:#f2c76f;color:#19283e;padding:3px 10px;font-size:13px;font-weight:900}
    .ca232-today-count{font-size:12px;color:#e8eaf1;font-weight:700}
    .ca232-today-note{font-size:11px;line-height:1.65;color:#dbe5f2;margin:4px 0 10px}
    .ca232-today-item{border-top:1px solid rgba(249,219,164,.3);padding:10px 0 7px;min-width:0}
    .ca232-today-item strong{display:block;font-size:15px;line-height:1.5;color:#fff4d8;overflow-wrap:anywhere}
    .ca232-today-meta{margin:4px 0 5px;line-height:1.65;font-size:12px;color:#edf2fa;overflow-wrap:anywhere}
    .ca232-today-links{display:flex;flex-wrap:wrap;gap:8px 17px;margin-top:5px}
    .ca232-today-links a,.ca232-more{color:#ffe0a0;font-weight:800;font-size:12px;
      line-height:1.55;text-decoration:underline;text-underline-offset:3px}
    .ca232-today-links a{display:inline-flex;align-items:center;min-height:37px}
    .ca232-more{display:inline-flex;align-items:center;min-height:40px;border:1px solid rgba(246,212,150,.5);
      border-radius:7px;background:#293b54;padding:6px 12px;cursor:pointer;margin-top:9px}
    .ca232-today-links a:focus-visible,.ca232-more:focus-visible{outline:3px solid #fff0bf;outline-offset:3px}
    #day-events .ca39-day-card.ca232-today-card{border:2px solid #edc16b!important;
      border-left:5px solid #f4c56a!important;background:rgba(239,194,108,.09)!important}
    #day-events .ca39-day-card.ca232-today-card .ca39-day-flags span:first-child{
      border-color:#eac16e!important;background:#eac16e!important;color:#17263c!important;font-weight:900}
    @media(max-width:600px){.ca232-today-banner{padding:13px 12px;margin-bottom:12px}
      .ca232-today-item strong{font-size:14px}.ca232-today-meta{font-size:12px}}
  `;
  document.head.append(style);

  const banner = document.createElement('aside');
  banner.id = 'ca232-today-banner';
  banner.className = 'ca232-today-banner';
  banner.setAttribute('aria-label', '本日開催予定の公演・イベント');
  banner.hidden = true;
  DAY.before(banner);

  function jstDate() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'
    }).formatToParts(new Date());
    const out = Object.fromEntries(parts.map(x => [x.type,x.value]));
    return `${out.year}-${out.month}-${out.day}`;
  }
  function isScheduled(e) {
    const s = String(e?.status || '').trim().toLowerCase();
    if (/cancel|中止|postpon|延期/.test(s)) return false;
    return s === 'scheduled' || s === 'planned' || s.includes('予定');
  }
  function selectedMonthDay() {
    const m = String(SELECTED.textContent || '').match(/(\d{1,2})月\s*(\d{1,2})日/);
    return m ? `${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}` : null;
  }
  function exactTodayEvents(today) {
    if (selectedMonthDay() !== today.slice(5)) return [];
    return EVENTS.filter(e => String(e.date) === today &&
      ['live','other'].includes(e.category) && isScheduled(e));
  }
  function make(tag, cls, text) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = String(text);
    return el;
  }
  function linkFor(e) {
    const base = /^https?:/i.test(location.href) ? location.href : 'https://maximum0303.github.io/ca-on-this-day/';
    const u = new URL('./', base);
    u.search = '';
    u.searchParams.set('date',String(e.date).slice(5));
    u.searchParams.set('event',String(e.id));
    u.hash = 'browse';
    return u.href;
  }
  function makeItem(e) {
    const item = make('div','ca232-today-item');
    item.append(make('strong','',String(e.title || 'タイトル未設定')));
    const details = [String(e.artist || '').trim(),
      [String(e.prefecture || '').trim(),String(e.venue || '').trim()].filter(Boolean).join('・')];
    if (/^\d{1,2}:\d{2}$/.test(String(e.startTime || '').trim()))
      details.push('開演 '+String(e.startTime).trim());
    const meta = details.filter(Boolean).join(' ／ ');
    if (meta) item.append(make('p','ca232-today-meta',meta));
    const links = make('div','ca232-today-links');
    const detail = make('a','','記録の詳細を見る ↗');
    detail.href = linkFor(e);
    links.append(detail);
    const source = Array.isArray(e.sources) ? e.sources.find(x => /^https:\/\//.test(x?.url || '')) : null;
    if (source) {
      const a = make('a','','出典を見る ↗');
      a.href = source.url;a.target = '_blank';a.rel = 'noopener noreferrer';
      links.append(a);
    }
    item.append(links);
    return item;
  }
  let cachedKey = '';
  let matchingIDs = new Set();
  function highlightCards() {
    DAY.querySelectorAll('.ca39-day-card[data-event-id]').forEach(card => {
      card.classList.toggle('ca232-today-card',matchingIDs.has(card.dataset.eventId));
    });
  }
  function render(force=false) {
    const today = jstDate();
    const events = exactTodayEvents(today);
    const key = today + '|' + selectedMonthDay() + '|' + events.map(e=>String(e.id)).join('|');
    if (!force && cachedKey === key) { highlightCards(); return; }
    cachedKey = key;
    matchingIDs = new Set(events.map(e => String(e.id)));
    banner.replaceChildren();
    banner.hidden = events.length === 0;
    if (!events.length) { highlightCards(); return; }
    const head = make('div','ca232-today-heading');
    head.append(make('span','ca232-today-label','● 本日開催予定'));
    head.append(make('span','ca232-today-count',`${events.length}件の公演・イベント`));
    banner.append(head);
    banner.append(make('p','ca232-today-note',
      '公式等の予定情報に基づく表示です。実際に開催されたことを確認した記録ではありません。'));
    events.slice(0,2).forEach(e=>banner.append(makeItem(e)));
    if (events.length > 2) {
      const extra = make('div','ca232-extra');extra.hidden = true;
      events.slice(2).forEach(e=>extra.append(makeItem(e)));
      const more = make('button','ca232-more',`ほか${events.length-2}件を表示する`);
      more.type='button';more.setAttribute('aria-expanded','false');
      more.addEventListener('click',() => {
        extra.hidden = !extra.hidden;
        more.setAttribute('aria-expanded',String(!extra.hidden));
        more.textContent = extra.hidden ? `ほか${events.length-2}件を表示する` : '追加分を閉じる';
      });
      banner.append(extra,more);
    }
    highlightCards();
  }
  // 日付変更、ON THIS DAY の並び替え・追加表示にも追随する。
  new MutationObserver(() => render()).observe(SELECTED,{childList:true,characterData:true,subtree:true});
  new MutationObserver(highlightCards).observe(DAY,{childList:true});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render(true);});
  window.addEventListener('pageshow',()=>render(true));
  render(true);
})();
