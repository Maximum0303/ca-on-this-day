/* 今日はC&Aの何の日？ — 画面 Ver.2.2.13 / 状態表示の見方
 * 「登録時の状態」「開催後の実施確認」「資料の確認区分」の違いを説明する表示拡張。
 * 既存イベント、ID、status、verification、確認履歴を一切変更しない。
 * ca-ver41.js と ca-review-guide-v2210.js より後に defer で読み込む。
 */
(() => {
  'use strict';
  function boot() {
    const section = document.getElementById('ca41-review');
    if (!section || document.getElementById('ca2213-status-guide')) return;

    const style = document.createElement('style');
    style.id = 'ca2213-status-guide-style';
    style.textContent = `
      #ca2213-status-guide {
        margin:14px 0 12px!important;
        border:1px solid rgba(171,191,218,.3)!important;
        border-radius:9px;
        padding:0!important;
        background:rgba(14,28,48,.24);
      }
      #ca2213-status-guide > summary {
        padding:11px 14px;
        color:#f8e2ba;
        font-size:13px;
        font-weight:700;
        cursor:pointer;
        min-height:44px;
        display:list-item;
        box-sizing:border-box;
      }
      #ca2213-status-guide > summary:focus-visible,
      .ca2213-help-link:focus-visible {
        outline:2px solid #f1d59c;
        outline-offset:3px;
      }
      #ca2213-status-guide .ca2213-guide-body {
        padding:0 14px 15px;
        border-top:1px solid rgba(171,191,218,.2);
      }
      #ca2213-status-guide .ca2213-guide-intro {
        color:#d5e1ef;
        margin:11px 0!important;
        font-size:12px;
        line-height:1.8;
      }
      #ca2213-status-guide dl {
        display:grid;
        grid-template-columns:minmax(130px,0.8fr) minmax(0,2fr);
        gap:0 16px;
        margin:0;
        font-size:12px;
        line-height:1.7;
      }
      #ca2213-status-guide dt,#ca2213-status-guide dd {
        padding:9px 0;
        margin:0;
        border-bottom:1px solid rgba(171,191,218,.13);
      }
      #ca2213-status-guide dt {font-weight:700;color:#f8e2ba;}
      #ca2213-status-guide dd {color:#d0ddec;}
      #ca2213-status-guide .ca2213-guide-foot {
        margin-top:12px!important;
        color:#c3d4e7;
        font-size:12px;
        line-height:1.8;
      }
      .ca2213-help-link {
        color:#f8e2ba;
        text-decoration:underline;
        text-underline-offset:3px;
      }
      @media(max-width:600px) {
        #ca2213-status-guide dl {grid-template-columns:minmax(0,1fr);gap:0;}
        #ca2213-status-guide dt {border-bottom:0;padding-bottom:0;}
        #ca2213-status-guide dd {padding-top:2px;padding-bottom:11px;}
        #ca2213-status-guide .ca2213-guide-body {padding:0 11px 13px;}
      }
    `;
    document.head.append(style);

    const guide = document.createElement('details');
    guide.id = 'ca2213-status-guide';
    guide.className = 'ca2213-status-guide';
    guide.innerHTML = `
      <summary>「開催予定」「実施確認待ち」などの表示の見方</summary>
      <div class="ca2213-guide-body">
        <p class="ca2213-guide-intro">このサイトでは、<strong>記録に登録された状態</strong>と、<strong>開催日を過ぎた後の確認状況</strong>を区別しています。</p>
        <dl>
          <dt>開催予定</dt><dd>開催日程の告知が登録されています。実際に開催されたことの確認ではありません。</dd>
          <dt>本日開催予定（実施未確認）</dt><dd>開催予定日が今日です。当日の実施状況はまだ確認していません。</dd>
          <dt>開催日経過・実施確認待ち</dt><dd>予定日を過ぎましたが、開催・延期・中止の裏付けがまだ十分でない記録です。確認対象として残します。</dd>
          <dt>事後確認終了（実施未確定）</dt><dd>開催告知は確認できましたが、開催後の報告が通常公表されないなどの理由で追加調査をいったん終了した記録です。「開催済み」を意味しません。</dd>
          <dt>公演・放送済み</dt><dd>実施・放送済みとして登録されている記録です。日付が過ぎたという理由だけで自動変更しません。</dd>
          <dt>延期・中止</dt><dd>延期・中止の情報が記録されている状態です。振替公演や別公演を自動で統合しません。</dd>
          <dt>一次資料確認・二次資料確認</dt><dd>出典の確認区分です。開催告知を一次資料で確認していても、実際の開催を確認したとは限りません。</dd>
        </dl>
        <p class="ca2213-guide-foot">「事後確認終了」は管理者の追加確認作業を終えたという区分です。新しい資料が見つかれば見直します。元の公演ID・登録状態・出典は維持しています。</p>
      </div>
    `;
    const pending = document.getElementById('ca41-review-details');
    if (pending && pending.parentElement === section) section.insertBefore(guide, pending);
    else section.append(guide);

    const help = document.querySelector('#browse .browse-help');
    if (help && !help.querySelector('.ca2213-help-link')) {
      const paragraph = document.createElement('p');
      paragraph.textContent = '開催予定と開催後の確認状況は別の情報です。';
      const anchor = document.createElement('a');
      anchor.href = '#ca2213-status-guide';
      anchor.className = 'ca2213-help-link';
      anchor.textContent = '状態表示の詳しい説明を見る';
      anchor.addEventListener('click', () => { guide.open = true; });
      paragraph.append(' ', anchor);
      help.append(paragraph);
    }

    if (window.location.hash === '#ca2213-status-guide') guide.open = true;
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#ca2213-status-guide') guide.open = true;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
