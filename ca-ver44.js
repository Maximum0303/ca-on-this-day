/* 今日はC&Aの何の日？｜画面 Ver.1.8.2-44
   8月25日の周年数を日本時間の現在年から自動算出。
   公開記録と status / ID / sources は変更しない。
*/
(()=>{
  'use strict';
  const day=document.getElementById('selected-date');
  if(!day)return;
  if(document.getElementById('ca44-debut-anniversary'))return;
  const banner=document.createElement('aside');
  banner.id='ca44-debut-anniversary';
  banner.className='ca44-anniversary';
  banner.setAttribute('aria-label','チャゲ＆飛鳥デビュー記念日');
  banner.hidden=true;
  day.insertAdjacentElement('afterend',banner);
  const getJapanYear=()=>Number(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric'}).format(new Date()));
  const render=()=>{
    const isDebut=/^\s*8月25日\s*$/.test(day.textContent||'');
    banner.hidden=!isDebut;
    if(!isDebut)return;
    const year=getJapanYear();
    const elapsed=year-1979;
    // 1979年のデビューを基準に、表示時の日本の暦年で計算する。
    banner.replaceChildren();
    const title=document.createElement('strong');
    title.textContent='8月25日は、チャゲ＆飛鳥のデビュー記念日';
    const body=document.createElement('span');
    body.textContent=`1979年8月25日「ひとり咲き」でデビュー。${year}年はデビュー${elapsed}周年です。`; 
    const explanation=document.createElement('small');
    explanation.textContent='周年数は自動計算表示です。公式の記念企画・開催記録とは別に扱います。';
    banner.append(title,body,explanation);
  };
  new MutationObserver(render).observe(day,{childList:true,characterData:true,subtree:true});
  render();
})();
