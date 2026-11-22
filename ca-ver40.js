/* 今日はC&Aの何の日？｜画面 Ver.2.3.6
 * 月間アーカイブを「選択日から7日／10日」の閲覧窓へ置き換える。
 * 月・年の境界をまたぐ。全て表示用の投影のみで、元データは変更しない。
 * 既存 ca40-* ID / 共有URL / 折りたたみ機能と互換。
 */
(() => {
  'use strict';
  const root=document.getElementById('calendar');
  const selectedDate=document.getElementById('selected-date');
  const archive=window.CA_EVENT_DATA;
  const events=Array.isArray(archive?.events)?archive.events:[];
  if(!root || !selectedDate || !events.length || document.getElementById('ca40-monthly'))return;

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cats={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',amateur:'デビュー前・アマチュア活動',other:'その他'};
  const artists=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
  const weekdays=['日','月','火','水','木','金','土'];
  const MS=86400000;
  const epoch=Date.UTC(2000,0,1); // 閏年の 2月29日も正しく扱う
  const yearDays=366;
  const pad=n=>String(n).padStart(2,'0');
  const inYear=n=>((n%yearDays)+yearDays)%yearDays;
  const mdIndex=(m,d)=>{
    const dt=new Date(Date.UTC(2000,m-1,d));
    return dt.getUTCMonth()+1===m&&dt.getUTCDate()===d?Math.round((dt.getTime()-epoch)/MS):null;
  };
  const partsAt=index=>{
    const date=new Date(epoch+inYear(index)*MS);
    return {month:date.getUTCMonth()+1,day:date.getUTCDate()};
  };
  const formatMD=index=>{const d=partsAt(index);return `${d.month}月${d.day}日`;};
  const validDate=s=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));
    if(!m)return null;
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]);
    if(!Number.isSafeInteger(y)||y<1970||y>2100)return null;
    const dt=new Date(Date.UTC(y,mo-1,d));
    if(dt.getUTCFullYear()!==y||dt.getUTCMonth()+1!==mo||dt.getUTCDate()!==d)return null;
    return {year:y,month:mo,day:d,index:mdIndex(mo,d),weekday:weekdays[dt.getUTCDay()]};
  };
  const records=events.map(event=>({event,day:validDate(event.date)})).filter(x=>x.day);
  const query=new URLSearchParams(window.location.search);
  const selectedIndex=()=>{
    const m=/(\d{1,2})月(\d{1,2})日/.exec(selectedDate.textContent||'');
    return m?mdIndex(Number(m[1]),Number(m[2])):null;
  };
  const queryIndex=()=>{
    const val=query.get('ca_m_start');
    const m=/^(\d{2})-(\d{2})$/.exec(val||'');
    return m?mdIndex(Number(m[1]),Number(m[2])):null;
  };
  const initial=selectedIndex();
  // Ver.2.2.9までの月間共有URLは、従来どおり月全体を表示する。
  const legacyLink=query.get('ca_view')==='monthly'&&!query.has('ca_m_span')&&!query.has('ca_m_start');
  const initialStart=query.get('ca_view')==='monthly'&&queryIndex()!=null?queryIndex():(initial??0);
  const initialMD=partsAt(initialStart);
  const legacyDays=new Date(Date.UTC(2000,initialMD.month,0)).getUTCDate();
  const state={
    start:initialStart,
    span:legacyLink?legacyDays:(query.get('ca_view')==='monthly'&&query.get('ca_m_span')==='10'?10:7),
    year:'all',artist:'all',category:'all',order:'asc',limit:10
  };
  const box=document.createElement('section');
  box.id='ca40-monthly';box.className='ca40-monthly';
  box.setAttribute('aria-labelledby','ca40-title');
  box.innerHTML=`<div class="ca40-heading"><div><span class="kicker">WEEKLY ARCHIVE / 登録記録</span><h3 id="ca40-title">選択日から7日間の記録</h3></div><span class="ca40-total" id="ca40-total" aria-live="polite"></span></div>
  <p class="ca40-explain">選択日から7日間（または10日間）の登録記録を年代順に表示します。月末・年末は次の月や年へ続きます。異なる年代の同じ日付をまとめた一覧です。</p>
  <nav class="ca236-window-nav" aria-label="表示する期間">
    <button type="button" id="ca236-prev" class="btn btn-ghost">← 前の7日間</button>
    <div class="ca236-window-center"><strong id="ca236-range" aria-live="polite"></strong><label>期間<select id="ca236-span"><option value="7">7日間</option><option value="10">10日間</option>${legacyLink?'<option value="legacy">月全体（旧共有リンク）</option>':''}</select></label></div>
    <button type="button" id="ca236-next" class="btn btn-ghost">次の7日間 →</button>
    <button type="button" id="ca236-selected" class="ca236-return">選択日に戻る</button>
  </nav>
  <div class="ca40-filter-row"><label>西暦年<select id="ca40-year"></select></label><label>名義<select id="ca40-artist"></select></label><label>分類<select id="ca40-category"></select></label><label>並び順<select id="ca40-order"><option value="asc">古い順</option><option value="desc">新しい順</option></select></label></div>
  <div id="ca40-breakdown" class="ca40-breakdown" aria-live="polite"></div>
  <p id="ca40-summary" class="ca40-summary" aria-live="polite"></p>
  <div id="ca40-items" class="ca40-items"></div>
  <div class="ca40-footer"><button id="ca40-more" type="button" class="btn btn-ghost" hidden>さらに表示</button><button id="ca40-reset" type="button" class="ca40-reset">絞り込みを解除</button></div>`;
  root.append(box);

  const style=document.createElement('style');
  style.id='ca236-window-style';
  style.textContent=`
    .ca236-window-nav{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:15px;margin:0 0 18px;border:1px solid rgba(232,188,115,.27);border-radius:11px;background:rgba(11,26,45,.38)}
    .ca236-window-nav > .btn{min-height:44px;white-space:normal}
    .ca236-window-center{flex:1 1 195px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
    .ca236-window-center strong{font-size:16px;color:#ffe2ab;line-height:1.5}
    .ca236-window-center label{display:inline-flex;align-items:center;gap:9px;font-size:12px;color:#c9d7e9}
    .ca236-window-center select{background:#0e1c33;color:#fff;border:1px solid rgba(211,225,247,.35);padding:5px 8px;border-radius:7px;min-height:40px;font:inherit}
    .ca236-return{border:0;background:transparent;color:#f8e2ba;text-decoration:underline;text-underline-offset:4px;padding:8px 6px;font-size:12px;min-height:40px}
    @media(max-width:640px){.ca236-window-nav{padding:13px 10px;display:grid;grid-template-columns:1fr 1fr;gap:8px}.ca236-window-center{grid-column:1/-1;grid-row:1}.ca236-window-nav > .btn{padding:9px 8px;font-size:12px}.ca236-return{grid-column:1/-1;justify-self:center}.ca236-window-center strong{font-size:15px}}
  `;
  document.head.appendChild(style);

  const selectOptions=(arr,current)=>arr.map(([value,label])=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`).join('');
  const wrapsYear=()=>state.start+state.span>yearDays;
  const filteredInWindow=()=>records.filter(x=>inYear(x.day.index-state.start)<state.span);
  const baseYear=item=>item.day.year-(wrapsYear()&&item.day.index<state.start?1:0);
  const status=e=>{
    const raw=String(e.status||'').toLowerCase();
    if(raw.includes('cancel')||raw.includes('中止'))return '中止';
    if(raw.includes('postpon')||raw.includes('延期'))return '延期';
    if(raw==='scheduled'||raw==='planned'||raw.includes('予定'))return '開催予定';
    if(raw==='released'||raw.includes('発売'))return '発売済み';
    if(['recorded','held','performed'].includes(raw)||raw.includes('実施'))return '実施・放送済み';
    return '状態未設定';
  };
  const verification=e=>e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'確認状況未設定';
  const recordUrl=e=>{
    const u=new URL('./',location.href);u.search='';u.hash='browse';
    u.searchParams.set('date',String(e.date).slice(5));u.searchParams.set('event',String(e.id));return u.href;
  };
  const rangeLabel=()=>`${formatMD(state.start)}〜${formatMD(state.start+state.span-1)}`;
  function renderOptions(){
    const years=[...new Set(filteredInWindow().map(baseYear))].sort((a,b)=>b-a);
    const available=years.map(String);
    if(state.year!=='all'&&!available.includes(state.year))state.year='all';
    const suffix=wrapsYear()?'年開始（翌年1月を含む）':'年';
    $('ca40-year').innerHTML=selectOptions([['all','すべての年'],...years.map(y=>[String(y),String(y)+suffix])],state.year);
    $('ca40-artist').innerHTML=selectOptions([['all','すべての名義'],...artists.map(x=>[x,x]),['other','その他・未設定']],state.artist);
    $('ca40-category').innerHTML=selectOptions([['all','すべての分類'],...Object.entries(cats)],state.category);
    $('ca40-order').value=state.order;
    $('ca236-span').value=state.span>10?'legacy':String(state.span);
  }
  function matches(){
    const list=filteredInWindow().filter(({event:e,day},i)=>{
      if(state.year!=='all'&&String(baseYear({event:e,day}))!==state.year)return false;
      if(state.artist!=='all'&&(state.artist==='other'?artists.includes(e.artist):e.artist!==state.artist))return false;
      if(state.category!=='all'&&e.category!==state.category)return false;
      return true;
    });
    list.sort((a,b)=>{
      const x=String(a.event.date).localeCompare(String(b.event.date))||String(a.event.id||'').localeCompare(String(b.event.id||''));
      return state.order==='desc'?-x:x;
    });
    return list;
  }
  function card({event:e,day:d}){
    const location=[e.prefecture,e.venue].filter(Boolean).join('・');
    const date=`${d.year}年${d.month}月${d.day}日（${d.weekday}）`;
    return `<article class="ca40-item"><div class="ca40-date"><time datetime="${esc(e.date)}">${esc(date)}</time><span class="ca40-cat">${esc(cats[e.category]||'その他')}</span></div>
    <div class="ca40-info"><h4>${esc(e.title||'タイトル未設定')}</h4><p class="ca40-person">${esc(e.artist||'名義未設定')}${location?' ｜ '+esc(location):''}</p>
    <div class="ca40-flags"><span>${esc(status(e))}</span><span>${esc(verification(e))}</span>${e.performanceNo!=null?`<span>公演番号 ${esc(e.performanceNo)}</span>`:''}</div>
    <a class="ca40-open" href="${esc(recordUrl(e))}">この記録を開く ↗</a></div></article>`;
  }
  function render(){
    const windowItems=filteredInWindow(),list=matches(),shown=list.slice(0,state.limit);
    $('ca40-title').textContent=state.span>10?'月全体の記録（旧共有リンク）':state.span+'日間の記録を年代順に見る';
    $('ca236-range').textContent=rangeLabel();
    const at=partsAt(state.start);
    $('ca236-range').dataset.ca236Start=pad(at.month)+'-'+pad(at.day);
    $('ca236-prev').textContent='← 前の'+state.span+'日間';
    $('ca236-next').textContent='次の'+state.span+'日間 →';
    $('ca40-total').textContent=`登録 ${windowItems.length}件`;
    const names=['live','release','media','milestone','other'];
    const counts=Object.fromEntries(names.map(k=>[k,list.filter(x=>x.event.category===k).length]));
    counts.other+=list.filter(x=>!names.includes(x.event.category)).length;
    $('ca40-breakdown').innerHTML=names.map(k=>`<span class="ca40-breakdown-item">${esc(cats[k])} <strong>${counts[k]}</strong>件</span>`).join('');
    const uniqueDates=new Set(list.map(x=>`${x.day.month}-${x.day.day}`)).size;
    $('ca40-summary').textContent=`該当${list.length}件 ／ ${state.span}日間のうち記録のある月日は${uniqueDates}日 ／ 表示${shown.length}件（同日・同会場の別公演も個別に表示）`;
    $('ca40-items').innerHTML=shown.length?shown.map(card).join(''):'<p class="ca40-empty">この期間・条件では登録済みの記録がありません。出来事がなかったことを意味するものではありません。</p>';
    $('ca40-more').hidden=shown.length>=list.length;
    $('ca40-more').textContent=`さらに${Math.min(10,list.length-shown.length)}件を表示（残り${list.length-shown.length}件）`;
  }
  const renderAll=()=>{renderOptions();render();};
  const startAt=(index)=>{state.start=inYear(index);state.limit=10;renderAll();};
  const onSelectedChange=()=>{
    const index=selectedIndex();
    if(index==null)return;
    // URL共有側 ca_m_start は初回のみ利用。カレンダー操作は選択日へ追従。
    if(index!==lastSelected){lastSelected=index;startAt(index);}
  };
  let lastSelected=initial;
  new MutationObserver(onSelectedChange).observe(selectedDate,{childList:true,characterData:true,subtree:true});
  $('ca236-prev').addEventListener('click',()=>startAt(state.start-state.span));
  $('ca236-next').addEventListener('click',()=>startAt(state.start+state.span));
  $('ca236-selected').addEventListener('click',()=>startAt(selectedIndex()??state.start));
  $('ca236-span').addEventListener('change',e=>{const v=e.target.value;state.span=v==='legacy'?new Date(Date.UTC(2000,partsAt(state.start).month,0)).getUTCDate():v==='10'?10:7;state.limit=10;renderAll();});
  for(const [id,key] of [['ca40-year','year'],['ca40-artist','artist'],['ca40-category','category'],['ca40-order','order']]){
    $(id).addEventListener('change',e=>{state[key]=e.target.value;state.limit=10;render();});
  }
  $('ca40-more').addEventListener('click',()=>{state.limit+=10;render();});
  $('ca40-reset').addEventListener('click',()=>{state.year='all';state.artist='all';state.category='all';state.order='asc';state.limit=10;renderAll();});
  renderAll();
})();
