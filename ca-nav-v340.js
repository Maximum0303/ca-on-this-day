/* 今日はC&Aの何の日？ — 画面 Ver.2.1.0
 * ページ内目次と最上部へ戻るボタン。表示機能のみ。記録データに触れない。
 * 既存の ca-ver39～46.js より後に defer で読み込む。
 */
(() => {
  'use strict';
  const main = document.querySelector('main');
  const hero = main?.querySelector('.hero');
  if (!main || !hero || document.getElementById('ca210-index')) return;

  const labels = new Map([
    ['calendar', '日付から探す'],
    ['ca40-monthly', '月間の記録一覧'],
    ['ca42-upcoming', 'これからの公演・放送・イベント'],
    ['ca320-index', 'ライブ索引'],
    ['ca330-index', '音楽・映像作品索引'],
    ['ca340-index', '書籍・出版索引'],
    ['browse', '出来事を探す'],
    ['ca41-review', '開催日経過・実施確認待ち'],
    ['ca43-check', '資料確認状況を調べる'],
    ['about', 'このサイトについて']
  ]);
  const index = document.createElement('section');
  index.id = 'ca210-index';
  index.className = 'ca210-index';
  index.setAttribute('aria-labelledby', 'ca210-heading');
  index.innerHTML = '<div class="ca210-index-header"><div><span class="kicker">PAGE INDEX / QUICK ACCESS</span><h2 id="ca210-heading">ページ内の目次</h2></div><span class="ca210-index-hint">項目を選ぶと、その場所へ移動します</span></div><nav class="ca210-index-links" aria-label="ページ内の目次"></nav>';
  hero.insertAdjacentElement('afterend', index);
  const nav = index.querySelector('nav');
  const populate = () => {
    const sections = [...main.querySelectorAll('section[id]')].filter(el => labels.has(el.id));
    const current = [...nav.querySelectorAll('a')].map(a => a.hash.slice(1)).join('|');
    if (current === sections.map(s => s.id).join('|')) return;
    nav.replaceChildren();
    for (const el of sections) {
      const link = document.createElement('a');
      link.href = '#' + el.id;
      link.textContent = labels.get(el.id);
      link.className = 'ca210-index-link';
      nav.appendChild(link);
    }
  };
  populate();

  // 初期ロード後に機能が差し込まれる場合にも目次を追従させる。
  const observer = new MutationObserver(records => {
    if (records.some(r => [...r.addedNodes].some(n => n.nodeType === 1 && (n.matches?.('section[id]') || n.querySelector?.('section[id]'))))) populate();
  });
  observer.observe(main, {childList:true,subtree:true});

  const actions = document.createElement('div');
  actions.className = 'ca210-float-actions';
  actions.id = 'ca210-actions';
  actions.hidden = true;
  const toIndex = document.createElement('a');
  toIndex.className = 'ca210-float-index';
  toIndex.href = '#ca210-index';
  toIndex.textContent = '目次';
  toIndex.setAttribute('aria-label', 'ページの目次へ移動');
  const top = document.createElement('button');
  top.className = 'ca210-back-top';
  top.type = 'button';
  top.setAttribute('aria-label', 'ページの最上部へ戻る');
  top.title = 'ページの最上部へ戻る';
  top.innerHTML = '<span aria-hidden="true">↑</span><span class="ca210-top-label">上へ</span>';
  top.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
  actions.append(toIndex, top);
  document.body.appendChild(actions);
  let lastVisible = null;
  const update = () => {
    const visible = window.scrollY > 450;
    if (visible !== lastVisible) {actions.hidden = !visible;lastVisible = visible;}
  };
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update, {passive:true});
  update();
})();
