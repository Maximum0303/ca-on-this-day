/* 今日はC&Aの何の日？｜画面 Ver.2.3.4
 * 項目の開閉状態を端末内（localStorage）に記憶。
 * PC／スマートフォンは別々の状態として保存。
 * 共有リンク・検索リンクによる自動展開は保存しない。
 * 記録データ・既存検索処理・出典・URL は変更しない。
 * ca-mobile-fold-v231.js と ca-search-ux-v233.js の後に読み込む。
 */
(() => {
  'use strict';
  const VERSION = '2.3.4';
  const GROUP_IDS = [
    'ca210-index','ca40-monthly','ca42-upcoming','ca43-check','browse','about'
  ];
  const DETAILS = [
    'ca233-review-shell','ca41-review-details','ca41-closed-details',
    'ca43-list-details','browse-help','ca43-guidance'
  ];
  const storagePrefix = 'ca-on-this-day:fold-state:v234:';
  const viewport = () => window.matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop';
  const key = () => storagePrefix + viewport();
  const isBoolean = x => typeof x === 'boolean';

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(key()) || '{}');
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {groups:{},details:{}};
      return {
        groups: parsed.groups && typeof parsed.groups === 'object' && !Array.isArray(parsed.groups) ? parsed.groups : {},
        details: parsed.details && typeof parsed.details === 'object' && !Array.isArray(parsed.details) ? parsed.details : {}
      };
    } catch (_) { return {groups:{},details:{}}; }
  }
  function remember(type, name, open) {
    if (!isBoolean(open)) return;
    const saved = read();
    saved[type][name] = open;
    try { localStorage.setItem(key(),JSON.stringify(saved)); } catch (_) { /* 保存不可の場合でも表示は機能する */ }
  }
  function detailsByKey(id) {
    if (id === 'browse-help') return document.querySelector('#browse details.browse-help');
    if (id === 'ca43-guidance') return document.querySelector('#ca43-check details.ca43-guidance');
    return document.getElementById(id);
  }
  function detailsKey(el) {
    if (!el || el.tagName !== 'DETAILS') return null;
    if (DETAILS.includes(el.id)) return el.id;
    if (el.matches('#browse details.browse-help')) return 'browse-help';
    if (el.matches('#ca43-check details.ca43-guidance')) return 'ca43-guidance';
    return null;
  }

  function directTargets() {
    const groups = new Set(), details = new Set();
    // F5では手動で閉じた状態を優先。新しい共有URLからのアクセスでは対象を優先。
    const entry = performance.getEntriesByType?.('navigation')?.[0];
    if (entry?.type === 'reload') return {groups,details};
    const params = new URLSearchParams(location.search);
    const section = {monthly:'ca40-monthly',upcoming:'ca42-upcoming',verification:'ca43-check'}[params.get('ca_view')];
    if (section) groups.add(section);
    if (['q','artist','category','decade','year','status','verification','sort','daylist','event']
        .some(k => params.has(k))) groups.add('browse');
    let id = '';
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { /* 無効なhashは無視 */ }
    let target = id ? document.getElementById(id) : null;
    for (let el = target; el; el = el.parentElement) {
      if (GROUP_IDS.includes(el.id)) groups.add(el.id);
      const detail = detailsKey(el);
      if (detail) details.add(detail);
    }
    return {groups, details};
  }

  function restore() {
    const saved = read();
    const forced = directTargets();
    for (const id of GROUP_IDS) {
      const section = document.getElementById(id);
      const button = section?.querySelector(':scope > .ca231-fold-head > .ca231-fold-toggle');
      if (!button) continue;
      const stored = saved.groups[id];
      const desired = forced.groups.has(id) ? true : stored;
      if (!isBoolean(desired)) continue;
      if ((button.getAttribute('aria-expanded') === 'true') !== desired) {
        button.click(); // 既存の開閉ロジックを使用（manual指定も維持）
      }
    }
    for (const id of DETAILS) {
      const el = detailsByKey(id);
      if (!el || el.tagName !== 'DETAILS') continue;
      const stored = saved.details[id];
      const desired = forced.details.has(id) ? true : stored;
      if (isBoolean(desired) && el.open !== desired) el.open = desired;
    }
  }

  function installReset() {
    const footer = document.querySelector('footer.footer');
    if (!footer || document.getElementById('ca234-reset-memory')) return;
    const btn = document.createElement('button');
    btn.id = 'ca234-reset-memory';
    btn.type = 'button';
    btn.textContent = '項目の開閉状態をリセット';
    btn.title = 'このサイトの開閉状態だけを消去し、初期表示に戻す';
    btn.style.cssText = 'display:block;width:max-content;max-width:100%;margin:10px 0 0;padding:4px 0;background:none;border:0;color:var(--muted,#b3c0d2);font:inherit;font-size:11px;line-height:1.7;text-decoration:underline;text-underline-offset:3px;cursor:pointer;text-align:left';
    btn.addEventListener('click', () => {
      try {
        localStorage.removeItem(storagePrefix + 'desktop');
        localStorage.removeItem(storagePrefix + 'mobile');
      } catch (_) { /* プライベートブラウズ等 */ }
      location.reload();
    });
    (footer.querySelector('.footer-title') || footer).append(btn);
  }

  function boot() {
    if (document.documentElement.dataset.ca234Memory === VERSION) return;
    document.documentElement.dataset.ca234Memory = VERSION;
    restore();
    installReset();
    document.addEventListener('click', e => {
      // v231, v233 の自動クリックや共有リンクからの展開は記憶しない。
      if (!e.isTrusted) return;
      const button = e.target.closest?.('.ca231-fold-toggle');
      if (button) {
        const section = GROUP_IDS.map(id => document.getElementById(id))
          .find(section => section?.querySelector(':scope > .ca231-fold-head > .ca231-fold-toggle') === button);
        if (section) remember('groups',section.id,button.getAttribute('aria-expanded') === 'true');
        return;
      }
      const summary = e.target.closest?.('summary');
      if (!summary) return;
      const details = summary.parentElement;
      const name = detailsKey(details);
      if (name && details) {
        // summaryの既定クリック処理で開閉された後の状態を保存する。
        setTimeout(() => remember('details',name,details.open),0);
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
