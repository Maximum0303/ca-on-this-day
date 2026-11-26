/* 今日はC&Aの何の日？ — 画面 Ver.2.2.7 / 第58回
 * 「これからの公演・イベント」「資料確認状況を調べる」の一覧をXで共有。
 * スマホのみ該当2セクションのCSV保存を非表示。PCはCSV保存を残す。
 * 元データ・既存のフィルター処理・その他の共有機能には変更を加えない。
 * 必ず ca-ver42.js / ca-ver43.js の後で読み込むこと。
 */
(() => {
  'use strict';
  const sections = [
    {
      section: 'ca42-upcoming', view: 'upcoming', key: 'u', exportId: 'ca42-export',
      summaryId: 'ca42-summary', linkId: 'ca227-upcoming-share',
      title: 'これからの公演・イベント',
      fields: [
        ['horizon','ca42-horizon','365','対象期間'],
        ['year','ca42-year','all','開催年'],
        ['artist','ca42-artist','all','名義'],
        ['category','ca42-category','all','分類'],
        ['q','ca42-keyword','','絞り込み']
      ]
    },
    {
      section: 'ca43-check', view: 'verification', key: 'v', exportId: 'ca43-export',
      summaryId: 'ca43-summary', linkId: 'ca227-verification-share',
      title: '資料確認状況を調べる',
      fields: [
        ['verification','ca43-verification','secondary','確認区分'],
        ['decade','ca43-decade','all','年代'],
        ['artist','ca43-artist','all','名義'],
        ['category','ca43-category','all','分類'],
        ['order','ca43-order','desc','表示順'],
        ['q','ca43-keyword','','キーワード']
      ]
    }
  ];
  const param = (cfg,name) => `ca_${cfg.key}_${name}`;
  const element = id => document.getElementById(id);
  const readable = (field,control) => {
    if (field[0] === 'q') return control.value.trim();
    return control.selectedOptions?.[0]?.textContent?.trim() || control.value;
  };

  const boot = () => {
    const valid = sections.filter(cfg => element(cfg.section) && element(cfg.exportId));
    if (!valid.length || element('ca227-share-style')) return;
    const style = document.createElement('style');
    style.id = 'ca227-share-style';
    style.textContent = `
      .ca227-share-link {display:inline-flex;align-items:center;justify-content:center;
        min-height:44px;padding:7px 10px;color:#f8e2ba;text-decoration:underline;
        text-underline-offset:4px;font-weight:700;font-size:12px;line-height:1.5;
        border:1px solid rgba(232,188,115,.42);border-radius:8px;
        overflow-wrap:anywhere;text-align:center;}
      .ca227-share-link:hover {background:#293f5c;border-color:#f8e2ba;}
      .ca227-share-link:focus-visible {outline:3px solid #f8e2ba;outline-offset:3px;}
      @media(max-width:700px) {
        #ca42-upcoming #ca42-export, #ca43-check #ca43-export {display:none!important;}
        #ca42-upcoming .ca42-actions, #ca43-check .ca43-actions {gap:10px;flex-wrap:wrap;}
        .ca227-share-link {min-height:46px;}
      }
    `;
    document.head.append(style);

    for (const cfg of valid) {
      const exportButton = element(cfg.exportId);
      if (element(cfg.linkId)) continue;
      const link = document.createElement('a');
      link.id = cfg.linkId;
      link.className = 'text-button ca227-share-link';
      link.textContent = '検索結果を𝕏で共有';
      link.href = 'https://twitter.com/intent/tweet';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', cfg.title + 'の現在の検索結果と条件をXで共有');
      exportButton.insertAdjacentElement('afterend', link);

      const makeShare = () => {
        const url = new URL('./', window.location.href);
        url.search = '';
        url.searchParams.set('ca_view', cfg.view);
        const selected = [];
        for (const field of cfg.fields) {
          const [name,id,defaultValue,label] = field;
          const control = element(id);
          if (!control) continue;
          const value = control.value;
          if (value !== defaultValue && (name !== 'q' || value.trim())) {
            url.searchParams.set(param(cfg,name),value);
            const valueLabel = readable(field,control);
            if (valueLabel) selected.push(label + '：' + valueLabel);
          }
        }
        url.hash = cfg.section;
        const count = (element(cfg.summaryId)?.textContent||'').match(/該当\s*([\d,]+)\s*件/);
        const countText = count ? '（該当'+count[1]+'件）' : '';
        const conditions = selected.length ? selected.join('・') : '初期条件';
        const heading = Array.from(conditions).slice(0,65).join('');
        const text = '今日はC&Aの何の日？｜'+cfg.title+'｜'+heading+countText;
        return {url:url.href,text};
      };
      // クリックした時点の条件を読み取る。X投稿はユーザーの操作で開く。
      link.addEventListener('click', () => {
        const share = makeShare();
        const intent = new URL('https://twitter.com/intent/tweet');
        intent.searchParams.set('text',share.text);
        const caOgpShareUrl=new URL(share.url);caOgpShareUrl.searchParams.set('ogp','2');intent.searchParams.set('url',caOgpShareUrl.href);
        link.href = intent.href;
      });
    }

    // Xで共有したURLにアクセスしたときだけ対象セクションの条件を復元。
    // 元の検索・描画ロジックが所有する change/input イベントを呼び出す。
    const incoming = new URLSearchParams(window.location.search);
    const cfg = valid.find(s => s.view === incoming.get('ca_view'));
    if (!cfg) return;
    for (const [name,id] of cfg.fields) {
      const value = incoming.get(param(cfg,name));
      if (value == null || value.length > 300) continue;
      const control = element(id);
      if (!control) continue;
      if (control.tagName === 'SELECT') {
        if (![...control.options].some(opt => opt.value === value)) continue;
        control.value = value;
        control.dispatchEvent(new Event('change',{bubbles:true}));
      } else {
        control.value = value;
        control.dispatchEvent(new Event('input',{bubbles:true}));
      }
    }
    if (cfg.view === 'verification') {
      const list = element('ca43-list-details');
      if (list) list.open = true;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
