/* 今日はC&Aの何の日？ | Ver.1.8.2-40
 * Monthly archive timeline; display extension only.
 * Does not add, delete, normalize, or mutate event data.
 * Load after data/events.js, app.js, and ca-ver39.js.
 */
(() => {
  'use strict';
  const root=document.getElementById('calendar');
  const title=document.getElementById('calendar-title');
  const archive=window.CA_EVENT_DATA;
  const events=Array.isArray(archive?.events)?archive.events:[];
  if(!root || !title || !events.length || document.getElementById('ca40-monthly')) return;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const cats={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',amateur:'デビュー前・アマチュア活動',other:'その他'};
  const artists=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
  const week=['日','月','火','水','木','金','土'];
  const validDate=s=>{
    const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s??''));
    if(!match) return null;
    const y=Number(match[1]),m=Number(match[2]),d=Number(match[3]);
    if(y<1 || m<1 || m>12 || d<1 || d>31) return null;
    const t=new Date(Date.UTC(y,m-1,d));
    if(t.getUTCFullYear()!==y || t.getUTCMonth()+1!==m || t.getUTCDate()!==d) return null;
    return {year:y,month:m,day:d,week:week[t.getUTCDay()]};
  };
  const records=events.map(e=>({event:e,day:validDate(e.date)})).filter(r=>r.day);
  const monthBuckets=new Map();
  for(const item of records){const key=item.day.month;const a=monthBuckets.get(key)||[];a.push(item);monthBuckets.set(key,a);}
  const status=e=>{
    const s=String(e.status||'').toLowerCase();
    if(s.includes('cancel')||s.includes('中止')) return '中止';
    if(s.includes('postpon')||s.includes('延期')) return '延期';
    if(s.includes('予定')||['planned','scheduled'].includes(s)) return '開催予定';
    if(s.includes('released')||s.includes('発売')) return '発売済み';
    if(['recorded','held','performed'].includes(s)||s.includes('実施')) return '実施・放送済み';
    return '状態未設定';
  };
  const verification=e=>e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'確認状況未設定';
  const recordUrl=e=>{
    const u=new URL(window.location.href);
    u.search='';u.hash='browse';
    u.searchParams.set('date',String(e.date).slice(5));
    u.searchParams.set('event',String(e.id));
    return u.href;
  };
  const monthFromTitle=()=>{const n=Number((title.textContent||'').match(/\d+/)?.[0]);return n>=1&&n<=12?n:null;};
  let shownMonth=monthFromTitle();
  if(!shownMonth) return;
  const state={year:'all',artist:'all',category:'all',order:'asc',limit:20};
  const box=document.createElement('section');
  box.id='ca40-monthly';box.className='ca40-monthly';
  box.setAttribute('aria-labelledby','ca40-title');
  box.innerHTML=`<div class="ca40-heading"><div><span class="kicker">MONTHLY ARCHIVE / 登録記録</span><h3 id="ca40-title">月間の歴史をたどる</h3></div><span class="ca40-total" id="ca40-total" aria-live="polite"></span></div>
  <p class="ca40-explain">表示中の月について、異なる西暦年の記録をまとめて確認できます。件数は登録済みの記録数であり、実際の公演総数を示すものではありません。</p>
  <div class="ca40-filter-row"><label>西暦年<select id="ca40-year"></select></label><label>名義<select id="ca40-artist"></select></label><label>分類<select id="ca40-category"></select></label><label>並び順<select id="ca40-order"><option value="asc">古い順</option><option value="desc">新しい順</option></select></label></div>
  <div id="ca40-breakdown" class="ca40-breakdown" aria-live="polite"></div>
  <p id="ca40-summary" class="ca40-summary" aria-live="polite"></p>
  <div id="ca40-items" class="ca40-items"></div>
  <div class="ca40-footer"><button id="ca40-more" type="button" class="btn btn-ghost" hidden>さらに表示</button><button id="ca40-reset" type="button" class="ca40-reset">月間の絞り込みを解除</button></div>`;
  root.append(box);
  const $=id=>document.getElementById(id);
  const selectOptions=(arr,current)=>arr.map(([value,label])=>`<option value="${esc(value)}" ${value===current?'selected':''}>${esc(label)}</option>`).join('');
  const currentRecords=()=>monthBuckets.get(shownMonth)||[];
  function renderOptions(){
    const items=currentRecords();
    const years=[...new Set(items.map(x=>x.day.year))].sort((a,b)=>b-a);
    const yearsAvailable=years.map(String);
    if(state.year!=='all'&&!yearsAvailable.includes(state.year))state.year='all';
    $('ca40-year').innerHTML=selectOptions([['all','すべての年'],...years.map(y=>[String(y),y+'年'])],state.year);
    $('ca40-artist').innerHTML=selectOptions([['all','すべての名義'],...artists.map(a=>[a,a]),['other','その他・未設定']],state.artist);
    $('ca40-category').innerHTML=selectOptions([['all','すべての分類'],...Object.entries(cats)],state.category);
    $('ca40-order').value=state.order;
  }
  const matches=()=>{
    const list=currentRecords().filter(({event:e,day:d})=>{
      if(state.year!=='all'&&String(d.year)!==state.year)return false;
      if(state.artist!=='all'&&(state.artist==='other'?artists.includes(e.artist):e.artist!==state.artist))return false;
      if(state.category!=='all'&&e.category!==state.category)return false;
      return true;
    });
    list.sort((a,b)=>{
      const x=String(a.event.date).localeCompare(String(b.event.date))||String(a.event.id||'').localeCompare(String(b.event.id||''));
      return state.order==='desc'?-x:x;
    });
    return list;
  };
  function card(item){
    const e=item.event,d=item.day;
    const location=[e.prefecture,e.venue].filter(Boolean).join('・');
    const date=`${d.year}年${d.month}月${d.day}日（${d.week}）`;
    const separate=e.performanceNo!=null?`<span>公演番号 ${esc(e.performanceNo)}</span>`:'';
    return `<article class="ca40-item"><div class="ca40-date"><time datetime="${esc(e.date)}">${esc(date)}</time><span class="ca40-cat">${esc(cats[e.category]||'その他')}</span></div>
      <div class="ca40-info"><h4>${esc(e.title||'タイトル未設定')}</h4><p class="ca40-person">${esc(e.artist||'名義未設定')}${location?' ｜ '+esc(location):''}</p>
      <div class="ca40-flags"><span>${esc(status(e))}</span><span>${esc(verification(e))}</span>${separate}</div>
      <a class="ca40-open" href="${esc(recordUrl(e))}">この記録を開く ↗</a></div></article>`;
  }
  function render(){
    const month=shownMonth,whole=currentRecords(),list=matches();
    const displayed=list.slice(0,state.limit);
    $('ca40-title').textContent=month+'月の記録を年代順に見る';
    $('ca40-total').textContent=`${whole.length}件（登録分）`;
    const names=['live','release','media','milestone','other'];
    const counts=Object.fromEntries(names.map(k=>[k,list.filter(x=>x.event.category===k).length]));
    const remainder=list.filter(x=>!names.includes(x.event.category)).length;
    counts.other+=remainder;
    $('ca40-breakdown').innerHTML=names.map(k=>`<span class="ca40-breakdown-item">${esc(cats[k])} <strong>${counts[k]}</strong>件</span>`).join('');
    const dayCount=new Set(list.map(x=>x.event.date)).size;
    $('ca40-summary').textContent=`該当${list.length}件 ／ ${dayCount}日分の記録 ／ 表示${displayed.length}件（同日・同会場の別公演も個別に表示）`;
    $('ca40-items').innerHTML=displayed.length?displayed.map(card).join(''):
      '<p class="ca40-empty">この条件では登録済みの記録がありません。記録が存在しなかったことを意味するものではありません。</p>';
    $('ca40-more').hidden=displayed.length>=list.length;
    $('ca40-more').textContent=`さらに${Math.min(20,list.length-displayed.length)}件を表示（残り${list.length-displayed.length}件）`;
  }
  function renderAll(){renderOptions();render();}
  function onMonthChange(){
    const value=monthFromTitle();
    if(value==null||value===shownMonth)return;
    shownMonth=value;state.year='all';state.artist='all';state.category='all';state.order='asc';state.limit=20;
    renderAll();
  }
  const obs=new MutationObserver(onMonthChange);
  obs.observe(title,{childList:true,subtree:true,characterData:true});
  for(const [id,key] of [['ca40-year','year'],['ca40-artist','artist'],['ca40-category','category'],['ca40-order','order']]){
    $(id).addEventListener('change',e=>{state[key]=e.target.value;state.limit=20;render();});
  }
  $('ca40-more').addEventListener('click',()=>{state.limit+=20;render();});
  $('ca40-reset').addEventListener('click',()=>{state.year='all';state.artist='all';state.category='all';state.order='asc';state.limit=20;renderAll();});
  renderAll();
})();
