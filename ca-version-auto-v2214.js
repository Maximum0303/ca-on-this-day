/* 今日はC&Aの何の日？ — 画面 Ver.2.2.14
 * フッターの画面バージョンを、サイト内の読み込み済みアセットの ?v= から判定する。
 * 今後の画面更新では、新しい ca-*.js / ca-*.css に ?v=2.2.15 等を付けるだけで更新される。
 * データバージョンは CA_EVENT_DATA から読み、記録データには触れない。
 */
(() => {
  'use strict';
  const fallback = [2, 2, 14];
  const versionPattern = /^(\d+)\.(\d+)\.(\d+)(?:[-+][a-z0-9._-]+)?$/i;
  const compare = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

  function screenVersion() {
    let best = fallback;
    // 外部サイトやデータ用URLではなく、サイト内の画面用 ca- アセットだけを参照。
    const assets = document.querySelectorAll('script[src], link[rel="stylesheet"][href]');
    for (const node of assets) {
      let url;
      try { url = new URL(node.src || node.href, location.href); } catch (_) { continue; }
      if (url.origin !== location.origin) continue;
      const file = url.pathname.split('/').pop() || '';
      if (!/^ca-[a-z0-9._-]+\.(?:js|css)$/i.test(file)) continue;
      const m = versionPattern.exec(url.searchParams.get('v') || '');
      if (!m) continue;
      const candidate = m.slice(1, 4).map(Number);
      if (candidate.every(Number.isSafeInteger) && compare(candidate, best) > 0) best = candidate;
    }
    return best.join('.');
  }

  function footerText() {
    const archive = window.CA_EVENT_DATA || {};
    const dataVersion = String(archive.siteVersion || archive.version || '未設定')
      .replace(/^Ver\.?\s*/i, '').trim();
    return `画面 Ver.${screenVersion()} ／ データ Ver.${dataVersion}`;
  }

  function boot() {
    const footer = document.getElementById('ca-footer-version');
    if (!footer || footer.dataset.caVersionAuto === '1') return;
    footer.dataset.caVersionAuto = '1';
    const apply = () => {
      const text = footerText();
      if (footer.textContent !== text) footer.textContent = text;
    };
    // 旧来のHTML内スクリプトがフッターを更新しても最新値に戻す。
    const observer = new MutationObserver(apply);
    observer.observe(footer, {childList: true, subtree: true, characterData: true});
    apply();
    window.addEventListener('pageshow', apply);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) apply(); });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', boot, {once: true});
  else boot();
})();
