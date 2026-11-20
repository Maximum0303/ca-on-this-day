/* 今日はC&Aの何の日？ — 画面 Ver.2.2.9 / 第60回
 * 「月間の記録一覧」に既存の控えめな共有デザインを追加する。
 * 共有するのは表示中の月・月間フィルター・並び順で、記録本体は変更しない。
 * ca-ver40.js、ca-share-unify-v228.js より後に読み込む。
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const fields = [
    ['year', 'ca40-year', 'all', '西暦年'],
    ['artist', 'ca40-artist', 'all', '名義'],
    ['category', 'ca40-category', 'all', '分類'],
    ['order', 'ca40-order', 'asc', '並び順']
  ];
  const monthNow = () => {
    const found = String($('calendar-title')?.textContent || '').match(/(\d{1,2})月/);
    const month = found ? Number(found[1]) : NaN;
    return month >= 1 && month <= 12 ? month : null;
  };
  const newShare = () => {
    const month = monthNow();
    if (month === null) return null;
    const url = new URL('./', window.location.href);
    url.search = '';
    // 月間ビューは独立したURLパラメーターを使用し、既存の検索と混同しない。
    url.searchParams.set('date', String(month).padStart(2, '0') + '-01');
    url.searchParams.set('ca_view', 'monthly');
    const conditions = [];
    for (const [name,id,defaultValue,label] of fields) {
      const control = $(id);
      if (!control || control.value === defaultValue) continue;
      url.searchParams.set('ca_m_' + name, control.value);
      const display = control.selectedOptions?.[0]?.textContent?.trim() || control.value;
      conditions.push(label + '：' + display);
    }
    url.hash = 'ca40-monthly';
    const matched = String($('ca40-summary')?.textContent || '').match(/該当\s*([\d,]+)\s*件/);
    const count = matched ? '（該当' + matched[1] + '件）' : '';
    const description = (conditions.length ? '｜' + conditions.join('・') : '');
    const label = Array.from(description).slice(0,72).join('');
    return {url: url.href, text: '今日はC&Aの何の日？｜' + month + '月の記録' + label + count};
  };
  const provideStatus = root => {
    let status = root.querySelector('.ca-share-quiet-status');
    if (!status) {
      status = document.createElement('span');
      status.className = 'ca-share-quiet-status';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      root.append(status);
    }
    return status;
  };
  const copyLink = async root => {
    const share = newShare();
    const status = provideStatus(root);
    if (!share) { status.textContent = '表示中の月を取得できませんでした。'; return; }
    const url = share.url;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(url);
      status.textContent = 'リンクをコピーしました。';
      return;
    } catch (_) { /* スマートフォン等で Clipboard API が使えなければ代替へ */ }
    const tmp = document.createElement('textarea');
    tmp.value = url;
    tmp.style.position = 'fixed';
    tmp.style.left = '-9999px';
    document.body.append(tmp);
    tmp.focus();
    tmp.select();
    let success = false;
    try { success = document.execCommand('copy'); } catch (_) {}
    tmp.remove();
    if (success) {status.textContent = 'リンクをコピーしました。';return;}
    status.textContent = '下のURLを選択してコピーしてください。';
    let input = root.querySelector('.ca-share-quiet-manual');
    if (!input) {
      input = document.createElement('input');
      input.className = 'ca-share-quiet-manual';
      input.type = 'text';
      input.readOnly = true;
      input.setAttribute('aria-label', '月間一覧の共有URL');
      root.append(input);
    }
    input.value = url;
    input.focus();
    input.select();
  };
  const restore = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ca_view') !== 'monthly' || monthNow() === null) return;
    // app.js の date=MM-01 と ca-ver40.js により、既に正しい月が表示されている。
    // 存在する選択肢に限ってイベント経由で復元し、既存の描画処理に任せる。
    for (const [name,id] of fields) {
      const value = params.get('ca_m_' + name);
      if (value === null || value.length > 200) continue;
      const control = $(id);
      if (!control || !Array.from(control.options || []).some(o => o.value === value)) continue;
      if (control.value === value) continue;
      control.value = value;
      control.dispatchEvent(new Event('change', {bubbles: true}));
    }
  };
  const boot = () => {
    if ($('ca229-month-share') || !$('ca40-monthly') || !$('ca40-summary')) return;
    const root = document.createElement('div');
    root.id = 'ca229-month-share';
    root.className = 'ca-share-quiet ca-share-unified ca229-month-share';
    root.setAttribute('role','group');
    root.setAttribute('aria-label','この月の記録一覧を共有');

    const label = document.createElement('span');
    label.className = 'ca-share-quiet-label';
    label.textContent = 'この月の記録を共有';
    const post = document.createElement('a');
    post.textContent = '𝕏 に投稿';
    post.href = 'https://twitter.com/intent/tweet';
    post.target = '_blank';
    post.rel = 'noopener noreferrer';
    post.setAttribute('aria-label','表示中の月間一覧をXに投稿');
    post.addEventListener('click', event => {
      const share = newShare();
      if (!share) {event.preventDefault();return;}
      const intent = new URL('https://twitter.com/intent/tweet');
      intent.searchParams.set('text', share.text);
      intent.searchParams.set('url', share.url);
      post.href = intent.href;
    });
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'リンクをコピー';
    copy.setAttribute('aria-label','表示中の月間一覧のリンクをコピー');
    copy.addEventListener('click', () => copyLink(root));
    root.append(label,post,copy);
    $('ca40-summary').insertAdjacentElement('afterend',root);
    restore();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
