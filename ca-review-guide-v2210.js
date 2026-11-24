/* 今日はC&Aの何の日？ — 画面 Ver.2.2.10 / 第61回
 * 「開催日が過ぎた予定の確認」の内容を明確化する表示専用拡張。
 * 実施を推定・確定しない。データ、ID、状態、出典、既存の動的判定は変更しない。
 * ca-ver41.js より後に defer で読み込むこと。
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);

  function todayInJapan() {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(new Date());
    const data = Object.fromEntries(parts.map(p => [p.type, p.value]));
    return `${data.year}-${data.month}-${data.day}`;
  }

  function daysSince(iso) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
    const today = todayInJapan();
    const from = new Date(`${iso}T00:00:00Z`).getTime();
    const to = new Date(`${today}T00:00:00Z`).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
    return Math.max(0, Math.round((to - from) / 86400000));
  }

  function linkForRecord(listItem) {
    const a = listItem.querySelector('a[href]');
    if (!a) return null;
    try {
      const url = new URL(a.getAttribute('href'),location.href);
      return url.searchParams.get('event');
    } catch (_) { return null; }
  }

  function appendText(parent,tag,className,value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    parent.append(node);
    return node;
  }

  function boot() {
    const section = $('ca41-review');
    const list = $('ca41-review-items');
    if (!section || !list || $('ca2210-review-style')) return;
    const all = Array.isArray(window.CA_EVENT_DATA?.events) ? window.CA_EVENT_DATA.events : [];
    const byId = new Map(all.map(e => [String(e.id),e]));

    const style = document.createElement('style');
    style.id = 'ca2210-review-style';
    style.textContent = `
      #ca41-review .ca2210-explain {margin:12px 0 14px;padding:11px 14px;
        border-left:3px solid #e8bc73;background:rgba(232,188,115,.065);
        color:#d8e3f1;font-size:12px;line-height:1.8;}
      #ca41-review .ca2210-explain strong {color:#ffe3ad;}
      #ca41-review .ca2210-list-note {color:#aabbd0;font-size:11px;margin:10px 0 8px;}
      #ca41-review .ca2210-meta {display:flex;flex-wrap:wrap;gap:5px 12px;
        margin:5px 0 0;font-size:11px;color:#c5d2e4;line-height:1.65;}
      #ca41-review .ca2210-review-label {color:#ffe0a6;font-weight:700;}
      #ca41-review .ca2210-source-links {display:flex;flex-wrap:wrap;gap:3px 13px;
        margin-top:5px;font-size:11px;line-height:1.65;}
      #ca41-review .ca2210-source-links a {color:#dce7f4;
        text-decoration:underline;text-decoration-color:#758bad;text-underline-offset:3px;}
      #ca41-review .ca2210-source-links a:hover {color:#ffe3ad;}
      #ca41-review .ca2210-source-links a:focus-visible {outline:2px solid #f1d59c;outline-offset:3px;}
      #ca41-review .ca2210-source-note {margin-top:3px;color:#aabbd0;font-size:10px;line-height:1.55;}
      #ca41-review #ca41-review-items > li:not(.ca41-no-review) {padding:0 4px 12px 0;
        border-bottom:1px solid rgba(222,227,238,.12);}
      @media(max-width:600px) {
        #ca41-review .ca2210-explain {padding:10px 11px;}
        #ca41-review .ca2210-meta {gap:3px 8px;}
      }
    `;
    document.head.append(style);

    const explain = document.createElement('p');
    explain.className = 'ca2210-explain';
    explain.innerHTML = '<strong>ここに表示されるのは「予定日が過ぎ、引き続き実施確認が必要な記録」です。</strong> 出典のある再放送は7日経過後に確認待ちから外します。実際に開催・放送されたと判定したものではありません。資料の「一次資料確認」も、開催予定の根拠を確認した意味の場合があります。実施・延期・中止を裏付ける情報が確認できた場合に、管理者が登録データを更新します。';
    const details = $('ca41-review-details');
    if (details) section.insertBefore(explain,details);
    else section.append(explain);

    const listNote = document.createElement('p');
    listNote.className = 'ca2210-list-note';
    listNote.textContent = '公演の詳細と登録済み資料を開いて確認できます。資料リンクの存在だけでは実施済みとは判断しません。';
    list.before(listNote);

    function enrich() {
      for (const li of list.querySelectorAll(':scope > li')) {
        if (li.classList.contains('ca41-no-review') || li.querySelector('.ca2210-meta')) continue;
        const id = linkForRecord(li);
        const event = id && byId.get(id);
        if (!event) continue;

        const meta = document.createElement('div');
        meta.className = 'ca2210-meta';
        appendText(meta,'span','ca2210-review-label','現在：実施確認待ち');
        appendText(meta,'span','','登録状態：開催予定');
        const days = daysSince(String(event.date||''));
        if (days !== null) appendText(meta,'span','',`開催予定日から${days}日経過`);
        const vLabel = event.verification === 'primary' ? '一次資料確認' : event.verification === 'secondary' ? '二次資料確認' : '未確認・未設定';
        appendText(meta,'span','',`資料の確認区分：${vLabel}`);
        li.append(meta);

        const sources = Array.isArray(event.sources) ? event.sources : [];
        const valid = sources.filter(s => {
          if (!s || !s.url) return false;
          try { return new URL(String(s.url)).protocol === 'https:'; } catch (_) { return false; }
        });
        if (!valid.length) {
          appendText(li,'div','ca2210-source-note','登録済みの資料リンクはありません。');
          continue;
        }
        const links = document.createElement('div');
        links.className = 'ca2210-source-links';
        valid.forEach((s,i) => {
          const a = document.createElement('a');
          a.href = String(s.url);
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = valid.length === 1 ? '登録済み資料を開く ↗' : `登録済み資料 ${i+1} を開く ↗`;
          links.append(a);
        });
        li.append(links);
      }
    }

    enrich();
    // ca-ver41.js が日付変更時に一覧を再描画しても、追加表示を復元。
    // 直下の li の差し替えのみ監視し、li 内への追記では再実行しない。
    new MutationObserver(enrich).observe(list,{childList:true});
    document.addEventListener('visibilitychange',() => {if(!document.hidden) {
      for (const meta of list.querySelectorAll('.ca2210-meta')) meta.remove();
      for (const sources of list.querySelectorAll('.ca2210-source-links,.ca2210-source-note')) sources.remove();
      enrich();
    }});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
