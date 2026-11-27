/* 今日はC&Aの何の日？ — 画面 Ver.2.2.6 / 第57回
 * スマホではCSV保存を隠し、検索結果のX共有を優先。
 * PCはCSVとX共有を併用。既存のデータ・検索・個別共有は変更しない。
 */
(() => {
  'use strict';
  const boot = () => {
    const download = document.getElementById('export-results');
    const toolbar = document.querySelector('#browse .result-actions');
    const resultsCount = document.getElementById('results-count');
    if (!download || !toolbar || !resultsCount || document.getElementById('ca226-share-results')) return;

    const style = document.createElement('style');
    style.id = 'ca226-search-share-style';
    style.textContent = `
      #ca226-share-results {
        display:inline-flex; align-items:center; justify-content:center;
        min-height:44px; padding:7px 10px; color:#f8e2ba;
        text-decoration:underline; text-underline-offset:4px;
        font-weight:700; font-size:12px; line-height:1.5;
        border:1px solid rgba(232,188,115,.42); border-radius:8px;
        overflow-wrap:anywhere; text-align:center;
      }
      #ca226-share-results:hover { background:#293f5c; border-color:#f8e2ba; }
      #ca226-share-results:focus-visible { outline:3px solid #f8e2ba; outline-offset:3px; }
      @media(max-width:700px) {
        #browse #export-results { display:none!important; }
        #browse .result-actions { gap:10px; }
        #ca226-share-results { min-height:46px; }
      }
    `;
    document.head.appendChild(style);

    const link = document.createElement('a');
    link.id = 'ca226-share-results';
    link.className = 'text-button';
    link.textContent = '検索結果を𝕏で共有';
    link.href = 'https://twitter.com/intent/tweet';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', '現在の検索結果と絞り込み条件をXで共有');
    download.insertAdjacentElement('afterend', link);

    const fields = [
      ['q', 'keyword', ''],
      ['artist', 'artist-filter', 'all'],
      ['category', 'category-filter', 'all'],
      ['decade', 'decade-filter', 'all'],
      ['year', 'year-filter', 'all'],
      ['status', 'status-filter', 'all'],
      ['verification', 'verification-filter', 'all'],
      ['sort', 'sort-filter', 'asc']
    ];
    const daySelection = () => {
      // app.js が実際に日付限定で表示している場合のみ検出。
      const match = String(resultsCount.textContent || '').match(/／\s*(\d{1,2})月(\d{1,2})日の記録/);
      if (!match) return null;
      const m = Number(match[1]), d = Number(match[2]);
      if (m < 1 || m > 12 || d < 1 || d > new Date(Date.UTC(2000,m,0)).getUTCDate()) return null;
      return {month:m,day:d,code:String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')};
    };
    const selectedLabels = () => {
      const list = [];
      for (const [param,id,defaultValue] of fields) {
        const control = document.getElementById(id);
        if (!control || control.value === defaultValue) continue;
        const label = param === 'q' ? control.value.trim() : control.selectedOptions?.[0]?.textContent?.trim() || control.value;
        if (label) list.push(label);
      }
      return list;
    };
    const share = () => {
      const url = new URL('./',window.location.href);
      url.search = '';
      const day = daySelection();
      if (day) {
        // 日付限定一覧は、共有先で「同じ日付の記録をすべて見る」を再実行。
        url.searchParams.set('date',day.code);
        url.searchParams.set('daylist','1');
      } else {
        for (const [param,id,defaultValue] of fields) {
          const value = document.getElementById(id)?.value || defaultValue;
          if (value !== defaultValue) url.searchParams.set(param,value);
        }
      }
      url.hash = 'browse';
      const countMatch = String(resultsCount.textContent||'').match(/該当\s*([\d,]+)\s*件/);
      const count = countMatch ? '（該当'+countMatch[1]+'件）' : '';
      const conditions = day
        ? day.month+'月'+day.day+'日の記録'
        : selectedLabels().join('・') || '全記録';
      // X の投稿欄に収まるよう長いキーワードは短縮し、条件の詳細はリンク側に保持。
      const heading = Array.from(conditions).slice(0,75).join('');
      const text = '今日はC&Aの何の日？｜'+heading+count;
      return {url:url.href,text};
    };
    link.addEventListener('click', () => {
      const s = share();
      const intent = new URL('https://twitter.com/intent/tweet');
      intent.searchParams.set('text',s.text);
      const caOgpShareUrl=new URL(s.url);caOgpShareUrl.searchParams.set('ogp','2');intent.searchParams.set('url',caOgpShareUrl.href);
      link.href = intent.href;
    });

    // 日付限定一覧を共有リンクから復元する。app.js に触れず、既存ボタンを再利用。
    const dayListButton = document.getElementById('all-day');
    const markDayList = () => {
      const url = new URL(window.location.href);
      if (!daySelection()) return;
      url.searchParams.set('daylist','1');
      history.replaceState(null,'',url);
    };
    const clearDayList = () => {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('daylist')) return;
      url.searchParams.delete('daylist');
      history.replaceState(null,'',url);
    };
    dayListButton?.addEventListener('click',markDayList);
    for (const [,id] of fields) {
      const control = document.getElementById(id);
      if (control) control.addEventListener(id==='keyword'?'input':'change',clearDayList);
    }
    for (const id of ['date-prev','date-next','today-btn','reset-filters']) {
      document.getElementById(id)?.addEventListener('click',clearDayList);
    }
    document.getElementById('calendar-cells')?.addEventListener('click',event => {
      if (event.target.closest('button[data-day]')) clearDayList();
    });

    const initial = new URL(window.location.href);
    if (initial.searchParams.get('daylist') === '1') {
      const date = initial.searchParams.get('date') || '';
      const [m,d] = date.split('-').map(Number);
      const valid = /^\d{2}-\d{2}$/.test(date) && m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(2000,m,0)).getUTCDate();
      if (valid && !initial.searchParams.has('event') && dayListButton) {
        if(!((window.CA_INDEX_RETURN?.get('browse')||window.CA_INDEX_RETURN?.get('day-events'))&&daySelection()))dayListButton.click();
      }
      else clearDayList();
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
