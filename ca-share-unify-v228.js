/* 今日はC&Aの何の日？｜画面 Ver.2.2.8／共有リンクの表記・デザイン統一
 * Ver.2.2.6／2.2.7のX投稿処理はそのまま維持し、見た目を既存の
 * 「この日を共有／この記録を共有」と合わせる。コピー機能は追加する。
 * 保存・記録・出典・URL復元の既存ロジックには変更を加えない。
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const columns = {
    browse: {
      anchor: 'ca226-share-results', hash: 'browse',
      fields: [
        ['q', 'keyword', ''], ['artist', 'artist-filter', 'all'],
        ['category', 'category-filter', 'all'], ['decade', 'decade-filter', 'all'],
        ['year', 'year-filter', 'all'], ['status', 'status-filter', 'all'],
        ['verification', 'verification-filter', 'all'], ['sort', 'sort-filter', 'asc']
      ]
    },
    upcoming: {
      anchor: 'ca227-upcoming-share', hash: 'ca42-upcoming',
      view: 'upcoming', key: 'u',
      fields: [
        ['horizon', 'ca42-horizon', '365'], ['year', 'ca42-year', 'all'],
        ['artist', 'ca42-artist', 'all'], ['category', 'ca42-category', 'all'],
        ['q', 'ca42-keyword', '']
      ]
    },
    verification: {
      anchor: 'ca227-verification-share', hash: 'ca43-check',
      view: 'verification', key: 'v',
      fields: [
        ['verification', 'ca43-verification', 'secondary'],
        ['decade', 'ca43-decade', 'all'], ['artist', 'ca43-artist', 'all'],
        ['category', 'ca43-category', 'all'], ['order', 'ca43-order', 'desc'],
        ['q', 'ca43-keyword', '']
      ]
    }
  };

  // The same link rules as ca-search-share-v226.js and ca-section-share-v227.js.
  function currentShareUrl(kind) {
    const config = columns[kind];
    const url = new URL('./', window.location.href);
    url.search = '';
    if (kind === 'browse') {
      const summary = $('results-count')?.textContent || '';
      const match = summary.match(/／\s*(\d{1,2})月(\d{1,2})日の記録/);
      if (match) {
        const m = Number(match[1]), d = Number(match[2]);
        if (m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(2000,m,0)).getUTCDate()) {
          url.searchParams.set('date',String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'));
          url.searchParams.set('daylist','1');
        }
      } else {
        for (const [param,id,defaultValue] of config.fields) {
          const value = $(id)?.value ?? defaultValue;
          if (value !== defaultValue) url.searchParams.set(param,value);
        }
      }
    } else {
      url.searchParams.set('ca_view',config.view);
      for (const [param,id,defaultValue] of config.fields) {
        const value = $(id)?.value ?? defaultValue;
        if (value !== defaultValue && (param !== 'q' || value.trim())) {
          url.searchParams.set(`ca_${config.key}_${param}`,value);
        }
      }
    }
    url.hash = config.hash;
    return url.href;
  }

  async function copyShareUrl(kind, wrapper) {
    const url = currentShareUrl(kind);
    let status = wrapper.querySelector('.ca-share-quiet-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'ca-share-quiet-status';
      status.setAttribute('role','status');
      status.setAttribute('aria-live','polite');
      wrapper.append(status);
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'リンクをコピーしました。';
      return;
    } catch (_) { /* Use manual copy fallback below. */ }
    const input = document.createElement('textarea');
    input.value = url;
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.append(input);
    input.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) {}
    input.remove();
    if (success) {status.textContent = 'リンクをコピーしました。';return;}
    status.textContent = '下のURLを選択してコピーしてください。';
    let manual = wrapper.querySelector('.ca-share-quiet-manual');
    if (!manual) {
      manual = document.createElement('input');
      manual.type = 'text';
      manual.readOnly = true;
      manual.className = 'ca-share-quiet-manual';
      manual.setAttribute('aria-label','共有URL');
      wrapper.append(manual);
    }
    manual.value = url;
    manual.focus();
    manual.select();
  }

  function boot() {
    if ($('ca228-share-unify-style')) return;
    const available = Object.entries(columns).filter(([,c]) => $(c.anchor));
    if (!available.length) return;
    const style = document.createElement('style');
    style.id = 'ca228-share-unify-style';
    style.textContent = `
      /* Match the original unboxed, understated share links. */
      .ca-share-unified {margin:3px 0!important; padding:0!important;
        border:0!important;background:none!important;box-shadow:none!important;
        display:inline-flex!important;align-items:center!important;flex-wrap:wrap!important;
        gap:3px 13px!important;min-width:0;}
      .ca-share-unified .ca-share-quiet-label {white-space:nowrap;}
      .ca-share-unified a, .ca-share-unified button {
        width:auto!important;min-height:36px!important;padding:2px 1px!important;
        border:0!important;border-radius:3px!important;background:transparent!important;
        box-shadow:none!important;color:#dce7f4!important;
        font:inherit!important;font-size:13px!important;font-weight:600!important;
        line-height:1.6!important;text-decoration:underline!important;
        text-decoration-color:#7185a2!important;text-underline-offset:4px!important;
        cursor:pointer!important;white-space:normal!important;text-align:left!important;
      }
      .ca-share-unified a:hover, .ca-share-unified button:hover {
        background:none!important;color:#ffe0a7!important;
        text-decoration-color:currentColor!important;
      }
      .ca-share-unified a:focus-visible, .ca-share-unified button:focus-visible {
        outline:2px solid #f1d59c!important;outline-offset:3px!important;
      }
      .ca-share-unified .ca-share-quiet-status {width:100%;font-size:12px;}
      @media(max-width:700px) {
        #browse .result-actions, #ca42-upcoming .ca42-actions, #ca43-check .ca43-actions {
          gap:8px 15px;flex-wrap:wrap;
        }
      }
      @media(max-width:480px) {
        .ca-share-unified {display:flex!important;width:100%;}
        .ca-share-unified .ca-share-quiet-label {flex-basis:100%;}
      }
    `;
    document.head.append(style);

    for (const [kind,c] of available) {
      const anchor = $(c.anchor);
      if (!anchor || anchor.closest('.ca-share-unified')) continue;
      const wrapper = document.createElement('div');
      wrapper.className = 'ca-share-quiet ca-share-unified';
      wrapper.setAttribute('role','group');
      wrapper.setAttribute('aria-label','この検索結果を共有');
      const label = document.createElement('span');
      label.className = 'ca-share-quiet-label';
      label.textContent = 'この検索結果を共有';
      anchor.parentNode.insertBefore(wrapper,anchor);
      wrapper.append(label,anchor); // Moving the anchor preserves the original X click listener.
      anchor.textContent = '𝕏 に投稿';
      anchor.setAttribute('aria-label','現在の検索結果をXに投稿');
      anchor.classList.remove('text-button','ca227-share-link');
      const copy = document.createElement('button');
      copy.type = 'button';
      copy.textContent = 'リンクをコピー';
      copy.setAttribute('aria-label','検索結果へのリンクをコピー');
      copy.addEventListener('click',() => copyShareUrl(kind,wrapper));
      wrapper.append(copy);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
