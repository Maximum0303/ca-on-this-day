/* 今日はC&Aの何の日？｜画面 Ver.2.3.3
 * キーワード検索をスマホの折りたたみ領域の外に常設。
 * 検索結果は、検索条件の指定／個別記録／当日一覧の指定がある場合のみ初期表示。
 * 「開催日が過ぎた予定の確認」は検索一覧の後ろに移し、全体を初期折りたたみ。
 * 既存のapp.js、全記録、出典、URL仕様は書き換えない。
 * ca-mobile-fold-v231.js、ca-today-highlight-v232.jsの後にdeferで読み込む。
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const paramKeys = [
    ['q', ''], ['artist','all'], ['category','all'], ['decade','all'],
    ['year','all'], ['status','all'], ['verification','all'], ['sort','asc']
  ];
  const controls = [
    ['keyword',''], ['artist-filter','all'], ['category-filter','all'],
    ['decade-filter','all'], ['year-filter','all'], ['status-filter','all'],
    ['verification-filter','all'], ['sort-filter','asc']
  ];
  function initialActive() {
    const params = new URLSearchParams(location.search);
    return Boolean(params.get('event') || params.get('daylist') === '1'
      || paramKeys.some(([name, base]) => {
        const value = params.get(name);
        return value != null && value.trim() !== base && value.trim() !== '';
      }));
  }
  function hasConditions() {
    return controls.some(([name, base]) => {
      const val = $(name)?.value ?? base;
      return String(val).trim() !== base && String(val).trim() !== '';
    });
  }
  function addStyles() {
    if ($('ca233-style')) return;
    const style = document.createElement('style');
    style.id = 'ca233-style';
    style.textContent = `
      #browse .ca233-search-bar {
        margin:12px 0 18px; padding:15px 18px 17px;
        border:1px solid rgba(245,209,132,.67); border-radius:15px;
        background:linear-gradient(135deg,#263c5a,#172943);
        box-shadow:0 2px 0 rgba(230,191,115,.12);
        min-width:0;
      }
      #browse .ca233-search-bar .search-wrap {display:block;position:relative;min-width:0}
      #browse .ca233-search-bar .ca233-search-label {
        display:block;font-size:14px;font-weight:800;line-height:1.6;
        color:#ffe4ac;letter-spacing:.025em;margin-bottom:8px;
      }
      #browse .ca233-search-bar .search-wrap svg {
        position:absolute;left:15px;bottom:16px;width:20px;height:20px;
        fill:none;stroke:#b9cee6;stroke-width:1.8;pointer-events:none;
      }
      #browse .ca233-search-bar #keyword {
        width:100%;min-width:0;height:54px;padding:10px 16px 10px 46px;
        font:inherit;font-size:16px;line-height:1.3;
        color:#fff;background:#0d1c32;border:2px solid #91a8c7;
        border-radius:10px;box-sizing:border-box;
      }
      #browse .ca233-search-bar #keyword::placeholder {color:#b2c4da;opacity:1}
      #browse .ca233-search-bar #keyword:focus {border-color:#ffdd95;outline:3px solid rgba(255,221,149,.33);outline-offset:2px}
      #browse .ca233-search-hint {font-size:12px;line-height:1.65;color:#d0e0f0;margin:8px 0 0}
      #browse .ca233-search-outcome {font-size:12px;color:#ffe2a7;margin:9px 0 0;min-height:1em}
      #browse .ca233-empty {padding:20px 19px;margin:12px 0 8px;border:1px dashed rgba(198,215,239,.45);
        border-radius:12px;background:rgba(20,37,59,.7);color:#d5e2ef;line-height:1.8}
      #browse .ca233-empty p {font-size:13px;margin:0 0 12px}
      #browse .ca233-show-all {background:#2a4262;color:#ffe5b4;border:1px solid #bd9b62;
        border-radius:8px;min-height:44px;padding:8px 13px;font:inherit;font-weight:700;font-size:13px;cursor:pointer}
      #browse .ca233-show-all:hover {background:#365675}
      #browse .ca233-show-all:focus-visible {outline:3px solid #ffe1a0;outline-offset:3px}
      #browse .ca233-review-shell {margin:30px 0 12px;border:1px solid rgba(183,205,232,.26);
        background:#182a43;border-radius:13px;overflow:hidden}
      #browse .ca233-review-shell > summary {display:block;cursor:pointer;list-style:none;padding:12px 16px;min-height:54px}
      #browse .ca233-review-shell > summary::-webkit-details-marker {display:none}
      #browse .ca233-review-shell > summary::after {content:'⌄';float:right;font-size:22px;color:#f4d79b;line-height:1.2}
      #browse .ca233-review-shell[open] > summary::after {content:'⌃'}
      #browse .ca233-review-shell > summary:hover {background:#233a58}
      #browse .ca233-review-shell > summary:focus-visible {outline:3px solid #ffe1a0;outline-offset:-3px}
      #browse .ca233-review-shell .ca41-review-head {display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding-right:20px}
      #browse .ca233-review-shell .ca41-review-head h3 {font-size:14px;margin:0;line-height:1.6}
      #browse .ca233-review-shell .ca41-review-head .kicker {display:none}
      #browse .ca233-review-shell .ca41-review-head > strong {font-size:11px;white-space:normal}
      #browse .ca233-review-shell .ca41-review {margin:0;padding:0 16px 15px;
        background:none;border:0;border-top:1px solid rgba(183,205,232,.17);border-radius:0}
      @media(max-width:760px){
        #browse .ca233-search-bar {margin:8px 0 12px;padding:13px 12px 15px}
        #browse .ca233-search-bar #keyword {min-height:53px}
        #browse .ca233-review-shell {margin-top:18px}
        #browse .ca233-review-shell .ca41-review-head {align-items:flex-start;flex-direction:column;gap:2px}
      }
      [hidden].ca233-empty, #browse .results-toolbar[hidden], #browse #results[hidden],
      #browse .load-more-wrap[hidden] {display:none!important}
    `;
    document.head.append(style);
  }

  function boot() {
    const section = $('browse'), keyword = $('keyword'), results = $('results');
    const review = $('ca41-review');
    if (!section || !keyword || !results || section.dataset.ca233Ready) return;
    section.dataset.ca233Ready = '1';
    addStyles();
    const filters = keyword.closest('.filters');
    const label = keyword.closest('label');
    const head = section.querySelector(':scope > .section-head');
    const foldBody = $('ca231-browse-body');
    if (!filters || !label || !head) return;

    // 実際の検索<input>を移動。既存app.js / ca-search-v225.jsのリスナーを保持。
    const searchBar = document.createElement('div');
    searchBar.className = 'ca233-search-bar';
    searchBar.id = 'ca233-search-bar';
    const oldLabel = label.querySelector('span.sr-only');
    if (oldLabel) {
      oldLabel.classList.remove('sr-only');
      oldLabel.classList.add('ca233-search-label');
      oldLabel.textContent = 'キーワードで出来事を探す';
    }
    keyword.placeholder = '曲名・ライブ・番組名・会場名など';
    searchBar.append(label);
    const hint = document.createElement('p');
    hint.className = 'ca233-search-hint';
    hint.textContent = 'スペース区切りはAND検索。曲名は \"SAY YES\" のように引用符で囲むとフレーズ検索できます。';
    searchBar.append(hint);
    const outcome = document.createElement('p');
    outcome.className = 'ca233-search-outcome';
    outcome.id = 'ca233-search-outcome';
    outcome.setAttribute('role','status');
    outcome.setAttribute('aria-live','polite');
    searchBar.append(outcome);
    if (foldBody && foldBody.parentElement === section) foldBody.before(searchBar);
    else head.insertAdjacentElement('afterend', searchBar);

    // 元の結果リストは保持し、検索条件を設定するまで描画済みカードを非表示。
    const toolbar = section.querySelector('.results-toolbar');
    const more = section.querySelector('.load-more-wrap');
    const empty = document.createElement('div');
    empty.className = 'ca233-empty';
    empty.id = 'ca233-empty';
    empty.innerHTML = '<p>検索するとここに記録が表示されます。条件を指定せず、全件を新しい順で見ることもできます。</p>';
    const showAll = document.createElement('button');
    showAll.type = 'button';
    showAll.className = 'ca233-show-all';
    showAll.textContent = 'すべての記録を表示（新しい順）';
    empty.append(showAll);
    toolbar?.before(empty);
    let active = initialActive();
    let dayMode = new URLSearchParams(location.search).get('daylist') === '1';
    const foldToggle = head.querySelector('.ca231-fold-toggle');
    function openBrowse() {
      if (foldBody?.hidden && foldToggle) foldToggle.click();
    }
    function update() {
      const off = !active;
      if (toolbar) toolbar.hidden = off;
      results.hidden = off;
      if (more) more.hidden = off;
      // app.jsの件数/さらに表示ボタンの状態は変更しない。表示制御のみ。
      empty.hidden = !off;
      const text = $('results-count')?.textContent?.trim() || '';
      outcome.textContent = active ? (text || '条件に一致する記録を表示中') : '検索結果は初期状態では非表示です。';
      searchBar.classList.toggle('ca233-has-results',active);
    }
    update();
    // 別の検索条件が変わったときのみ一覧を更新（カレンダーの月移動などには反応しない）。
    for(const [id] of controls) {
      const control = $(id);
      if (!control) continue;
      const eventName = id === 'keyword' ? 'input' : 'change';
      control.addEventListener(eventName, () => {
        dayMode=false;
        active=hasConditions();
        if (active) openBrowse();
        update();
      });
    }
    const allDay = $('all-day');
    allDay?.addEventListener('click', () => {
      active = true;
      dayMode = true;
      openBrowse();
      update();
    });
    $('reset-filters')?.addEventListener('click', () => {
      active = false;
      dayMode = false;
      update();
    });
    showAll.addEventListener('click', () => {
      const sort = $('sort-filter');
      if (!sort) return;
      sort.value='desc';
      sort.dispatchEvent(new Event('change',{bubbles:true}));
      openBrowse();
      const first = $('results-count');
      if (first) first.scrollIntoView({block:'nearest',behavior:'auto'});
    });
    // app.js は結果数を書き換える。表示中に最新の件数を検索バーにも表示。
    const count = $('results-count');
    if (count) new MutationObserver(() => {
      if (active) outcome.textContent = count.textContent?.trim() || '';
    }).observe(count,{childList:true,characterData:true,subtree:true});

    // 実施確認待ちのパネルは、検索の前ではなく検索結果の下に移す。
    if(review){
      const reviewHead=review.querySelector('.ca41-review-head');
      const shell=document.createElement('details');
      shell.id='ca233-review-shell';
      shell.className='ca233-review-shell';
      const summary=document.createElement('summary');
      summary.setAttribute('aria-label','開催日が過ぎた予定の確認を開く・閉じる');
      if(reviewHead)summary.append(reviewHead);
      else summary.textContent='開催日が過ぎた予定の確認';
      shell.append(summary,review);
      (more || results).insertAdjacentElement('afterend', shell);
      function revealReview(){
        const h=decodeURIComponent(location.hash||'').replace(/^#/,'');
        if(['ca41-review','ca41-review-details','ca41-closed-details','ca233-review-shell'].includes(h)){
          shell.open=true;
          openBrowse();
          if(h==='ca41-review-details')$('ca41-review-details')?.setAttribute('open','');
          if(h==='ca41-closed-details')$('ca41-closed-details')?.setAttribute('open','');
        }
      }
      document.addEventListener('click', ev => {
        const a=ev.target.closest('a[href]');
        if(!a)return;
        try{
          const u=new URL(a.href,location.href);
          if(u.origin===location.origin && u.pathname===location.pathname &&
            /#(?:ca41-review|ca41-review-details|ca41-closed-details|ca233-review-shell)$/.test(u.hash)){
            shell.open=true;openBrowse();
          }
        }catch(_){/* 外部URLや不正なURLは無視 */}
      },true);
      window.addEventListener('hashchange',revealReview);
      revealReview();
    }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
