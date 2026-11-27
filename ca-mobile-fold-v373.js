/* 今日はC&Aの何の日？｜画面 Ver.2.3.1
 * スマートフォン向け：長い補助セクションを初期状態で折りたたむ。
 * PCでは従来どおり開いて表示。日付・カレンダー・当日の出来事は常時表示。
 * 元のイベントデータ、ID、確認区分、検索処理、共有URLは変更しない。
 * 必ず既存の ca-*.js 群より後に defer で読み込む。
 */
(() => {
  'use strict';
  const version = '3.3.6';
  const defaultOpen = id => id === 'ca42-upcoming' || id === 'about';
  const narrow = window.matchMedia('(max-width: 760px)');
  const targets = [
    {id:'ca210-index', head:'.ca210-index-header', name:'ページ内の目次'},
    {id:'ca40-monthly', head:'.ca40-heading', name:'月間の歴史をたどる'},
    {id:'ca42-upcoming', head:'.section-head', name:'これからの公演・放送・イベント'},
    {id:'ca43-check', head:'.section-head', name:'資料確認状況を調べる'},
    {id:'browse', head:'.section-head', name:'出来事を探す'},
    {id:'about', head:'.section-head', name:'このサイトについて'}
  ];
  const groups = new Map();

  function style() {
    if (document.getElementById('ca231-fold-style')) return;
    const st = document.createElement('style');
    st.id = 'ca231-fold-style';
    st.textContent = `
      .ca231-fold-body[hidden] {display:none!important}
      .ca231-fold-head {display:flex;align-items:center;flex-wrap:wrap;gap:10px 14px}
      .ca231-fold-toggle {
        display:inline-flex;align-items:center;justify-content:center;gap:8px;
        min-width:95px;min-height:44px;margin-left:auto;padding:8px 12px;
        border:1px solid rgba(232,188,115,.48);border-radius:9px;
        background:#213754;color:#f8e2ba;font-family:inherit;font-size:12px;font-weight:700;line-height:1.5;
        cursor:pointer;white-space:nowrap;touch-action:manipulation;
      }
      .ca231-fold-toggle:hover {background:#304a6a;border-color:#f8e2ba}
      .ca231-fold-toggle:focus-visible {outline:3px solid #f8e2ba;outline-offset:3px}
      .ca231-fold-toggle .ca231-arrow {display:inline-block;font-size:15px;line-height:1;transition:transform .15s ease}
      .ca231-fold-toggle[aria-expanded="true"] .ca231-arrow {transform:rotate(180deg)}
      .ca231-fold-head + .ca231-fold-body {margin-top:18px;min-width:0}
      .ca231-fold-head {margin-bottom:0!important}
      .ca231-fold-body:focus {outline:none}
      @media (max-width:760px) {
        .ca231-folded#ca210-index {margin-bottom:20px}
        .ca231-folded#ca40-monthly {margin-top:18px}
        .ca231-folded#ca42-upcoming, .ca231-folded#ca43-check {margin-top:28px}
        .ca231-folded#browse {padding-top:32px}
        .ca231-folded#about {padding-top:36px;padding-bottom:30px}
        .ca231-folded#ca42-upcoming .section-head p,
        .ca231-folded#ca43-check .section-head p,
        .ca231-folded#browse .section-head p,
        .ca231-folded#ca210-index .ca210-index-hint {display:none}
        .ca231-fold-toggle {min-height:46px;min-width:105px}
      }
      @media (prefers-reduced-motion:reduce) {
        .ca231-fold-toggle .ca231-arrow {transition:none}
      }
    `;
    document.head.appendChild(st);
  }

  function setOpen(item, open, manual=false) {
    if (!item) return;
    if (manual) item.manual = true;
    item.body.hidden = !open;
    item.section.classList.toggle('ca231-folded', !open);
    item.button.setAttribute('aria-expanded', String(open));
    item.button.setAttribute('aria-label', item.name + (open ? 'を閉じる' : 'を表示する'));
    item.button.querySelector('.ca231-caption').textContent = open ? '閉じる' : '表示する';
    item.section.dataset.ca231Open = String(open);
  }

  function createGroup(config) {
    const section = document.getElementById(config.id);
    if (!section || section.dataset.ca231Ready === version) return;
    const head = [...section.children].find(el => el.matches(config.head));
    if (!head) return;
    const children = [...section.children].filter(el => el !== head);
    if (!children.length) return;
    const body = document.createElement('div');
    body.className = 'ca231-fold-body';
    body.id = 'ca231-' + config.id + '-body';
    for (const child of children) body.appendChild(child); // 既存イベントリスナーも保持する
    head.insertAdjacentElement('afterend', body);
    head.classList.add('ca231-fold-head');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ca231-fold-toggle';
    button.setAttribute('aria-controls', body.id);
    const caption = document.createElement('span');
    caption.className = 'ca231-caption';
    const arrow = document.createElement('span');
    arrow.className = 'ca231-arrow';
    arrow.textContent = '⌄';
    arrow.setAttribute('aria-hidden', 'true');
    button.append(caption, arrow);
    head.appendChild(button);
    section.dataset.ca231Ready = version;
    const item = {section, body, button, name:config.name, manual:false};
    groups.set(config.id, item);
    setOpen(item, defaultOpen(config.id));
    button.addEventListener('click', () => {
      setOpen(item, item.body.hidden, true);
    });
  }

  function revealElement(el) {
    if (!el) return;
    const ids = [];
    let node = el;
    while (node) {
      if (node.id && groups.has(node.id)) ids.push(node.id);
      node = node.parentElement;
    }
    for (const id of ids.reverse()) setOpen(groups.get(id), true);
  }

  function revealHash(hash, reposition=false) {
    if (!hash || hash === '#') return;
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return; }
    const target = document.getElementById(id);
    if (!target) return;
    revealElement(target);
    if (reposition && narrow.matches) {
      requestAnimationFrame(() => target.scrollIntoView({block:'start',behavior:'auto'}));
    }
  }

  function restoreDirectLink() {
    const p = new URLSearchParams(window.location.search);
    const view = p.get('ca_view');
    if (view === 'monthly') setOpen(groups.get('ca40-monthly'), true);
    else if (view === 'upcoming') setOpen(groups.get('ca42-upcoming'), true);
    else if (view === 'verification') setOpen(groups.get('ca43-check'), true);
    const filterKeys = ['q','artist','category','decade','year','status','verification','sort','daylist'];
    if (filterKeys.some(key => p.has(key))) setOpen(groups.get('browse'), true);
    revealHash(window.location.hash, Boolean(window.location.hash));
  }

  function boot() {
    if (document.documentElement.dataset.ca231Installed === '1') return;
    document.documentElement.dataset.ca231Installed = '1';
    style();
    targets.forEach(createGroup);
    restoreDirectLink();

    // 目次やハンバーガーメニューなどの通常のアンカー移動前に開く。
    document.addEventListener('click', event => {
      if (event.target.closest('#all-day')) setOpen(groups.get('browse'), true);
      const link = event.target.closest('a[href]');
      if (!link) return;
      let u;
      try { u = new URL(link.href, window.location.href); } catch (_) { return; }
      if (u.origin === location.origin && u.pathname === location.pathname && u.hash) {
        revealHash(u.hash);
      }
    }, true);

    window.addEventListener('hashchange', () => revealHash(location.hash, true));
    window.addEventListener('popstate', restoreDirectLink);
    narrow.addEventListener('change', event => {
      // 画面幅が変わっても開閉状態を維持する。
      restoreDirectLink();
    });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
