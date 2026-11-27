/* 今日はC&Aの何の日？ Ver.1.8.2-42
 * Future schedule overview. Display-only: does not change CA_EVENT_DATA,
 * existing IDs, sources, verification, scheduled/postponed/cancelled records.
 * Load after ca-ver41.js.
 */
(() => {
  'use strict';
  const archive=window.CA_EVENT_DATA;
  const events=Array.isArray(archive?.events)?archive.events:[];
  const browse=document.getElementById('browse');
  if(!browse || !events.length || document.getElementById('ca42-upcoming'))return;
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CAT={live:'ライブ',release:'音楽・映像作品', book:'書籍・出版',media:'テレビ・ラジオ',milestone:'歴史・出来事',amateur:'デビュー前・アマチュア活動',other:'その他'};
  const ORDER=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
  const parseDate=s=>{
    const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s??''));
    if(!m)return null;
    const [y,mo,d]=m.slice(1).map(Number);
    if(y<1970||y>9999||mo<1||mo>12||d<1||d>31)return null;
    const x=new Date(Date.UTC(y,mo-1,d));
    if(x.getUTCFullYear()!==y||x.getUTCMonth()!==mo-1||x.getUTCDate()!==d)return null;
    return {iso:m[0],y,mo,d,ms:x.getTime()};
  };
  const todayISO=()=>{
    const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const status=e=>{
    const v=String(e.status||'').toLowerCase().trim();
    if(v.includes('cancel')||v.includes('中止'))return 'cancelled';
    if(v.includes('postpon')||v.includes('延期'))return 'postponed';
    return v==='scheduled'||v==='planned'||v.includes('予定')?'scheduled':'other';
  };
  const records=events.map(e=>({e,d:parseDate(e.date)})).filter(r=>r.d && status(r.e)==='scheduled');
  const recordUrl=e=>{
    const u=new URL(window.location.href);u.search='';u.hash='browse';u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',String(e.id));return u.href;
  };
  const state={horizon:'365',year:'all',artist:'all',category:'all',keyword:'',limit:12};
  const wrap=document.createElement('section');wrap.id='ca42-upcoming';wrap.className='ca42-upcoming';wrap.setAttribute('aria-labelledby','ca42-title');
  wrap.innerHTML=`<div class="section-head ca42-head"><div><span class="kicker">FUTURE SCHEDULE / REGISTERED EVENTS</span><h2 id="ca42-title">これからの公演・放送・イベント</h2><p>公式発表等で日程を確認した、今後の公演・放送・作品発売などの予定を一覧表示します。</p></div><span id="ca42-total" class="ca42-total" aria-live="polite"></span></div>
    <p class="ca42-notice">表示は<strong>登録されている予定</strong>であり、すべての予定を網羅するものではありません。開催・放送・発売の変更等は公式をご確認ください。予定日を過ぎても自動で実施済みにはしません。</p>
    <div class="ca42-controls">
      <label>対象期間<select id="ca42-horizon"><option value="90">今後90日</option><option value="365" selected>今後1年</option><option value="all">登録済みの将来すべて</option></select></label>
      <label>予定年<select id="ca42-year"><option value="all">すべての年</option></select></label>
      <label>名義<select id="ca42-artist"><option value="all">すべての名義</option></select></label>
      <label>分類<select id="ca42-category"><option value="all">すべての分類</option></select></label>
      <label class="ca42-search">絞り込み<input id="ca42-keyword" type="search" placeholder="公演名・番組名・放送局・会場など" autocomplete="off"></label>
    </div>
    <div class="ca42-toolbar"><p id="ca42-summary" aria-live="polite"></p><div class="ca42-actions"><button type="button" id="ca42-export" class="text-button">一覧をCSV保存</button><button type="button" id="ca42-clear" class="text-button">条件をクリア</button></div></div>
    <div id="ca42-items" class="ca42-items"></div>
    <div class="ca42-foot"><button id="ca42-more" type="button" class="btn btn-ghost" hidden>さらに表示する</button><a href="#ca41-review">過去の開催予定・実施確認待ちを見る ↓</a></div>`;
  // Ver.3.3.4: year-only は検索欄の中へ移動されるため基準にしない。
  const main=document.querySelector('main');
  const anchor=document.getElementById('browse');
  if(!main||!anchor||anchor.parentElement!==main){console.error('CA 3.7.1: メイン直下の検索セクションが見つかりません');return;}
  main.insertBefore(wrap,anchor);
  const option=(value,label)=>`<option value="${esc(value)}">${esc(label)}</option>`;
  const artists=[...new Set(records.map(r=>r.e.artist).filter(Boolean))].sort((a,b)=>{
    const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);
    return (ia<0?99:ia)-(ib<0?99:ib)||a.localeCompare(b,'ja');
  });
  $('ca42-artist').insertAdjacentHTML('beforeend',artists.map(a=>option(a,a)).join(''));
  const categories=[...new Set(records.map(r=>r.e.category).filter(Boolean))];
  $('ca42-category').insertAdjacentHTML('beforeend',categories.map(c=>option(c,CAT[c]||c)).join(''));
  let currentToday='';
  let cache=[];
  const isFuture=r=>r.d.iso>=currentToday;
  function refreshYearOptions(){
    const prior=state.year;
    const years=[...new Set(records.filter(isFuture).map(r=>String(r.d.y)))].sort();
    $('ca42-year').innerHTML=option('all','すべての年')+years.map(y=>option(y,y+'年')).join('');
    state.year=years.includes(prior)?prior:'all';$('ca42-year').value=state.year;
  }
  function matching(){
    const base=parseDate(currentToday);
    const limitMs=base.ms+Number(state.horizon)*86400000;
    const terms=state.keyword.trim().normalize('NFKC').toLocaleLowerCase('ja-JP').split(/\s+/).filter(Boolean);
    return records.filter(r=>{
      if(!isFuture(r))return false;
      if(state.horizon!=='all'&&r.d.ms>limitMs)return false;
      if(state.year!=='all'&&String(r.d.y)!==state.year)return false;
      if(state.artist!=='all'&&r.e.artist!==state.artist)return false;
      if(state.category!=='all'&&r.e.category!==state.category)return false;
      if(terms.length){
        const hay=[r.e.id,r.e.date,r.e.artist,r.e.category,r.e.title,r.e.prefecture,r.e.venue,r.e.tourId,r.e.releaseTitle,r.e.broadcastStation,r.e.startTime,r.e.endTime].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ja-JP');
        if(terms.some(term=>!hay.includes(term)))return false;
      }
      return true;
    }).sort((a,b)=>a.d.iso.localeCompare(b.d.iso)||String(a.e.id).localeCompare(String(b.e.id)));
  }
  const label=e=>e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'確認状況未設定';
  function itemHTML(r){
    const e=r.e,d=r.d;
    const dateLabel=`${d.y}年${d.mo}月${d.d}日`;
    const loc=e.category==='media'?[e.broadcastStation,[e.startTime,e.endTime].filter(Boolean).join('～')].filter(Boolean).join(' ｜ '):[e.prefecture,e.venue].filter(Boolean).join('・');
    const extra=e.performanceNo!=null?`<span>公演番号 ${esc(e.performanceNo)}</span>`:'';
    const what=e.category==='media'?'放送予定':e.category==='release'||e.category==='book'?'発売・公開予定':e.category==='live'?'開催予定':'予定';
    const todayBadge=d.iso===currentToday?'<span class="ca42-today">本日'+what+'（実施未確認）</span>':'<span>'+what+'</span>';
    return `<article class="ca42-item"><div class="ca42-item-date"><time datetime="${esc(d.iso)}">${esc(dateLabel)}</time><span>${esc(CAT[e.category]||e.category||'その他')}</span></div>
      <div class="ca42-item-body"><h3>${esc(e.title||'タイトル未設定')}</h3><p class="ca42-venue">${esc(e.artist||'名義未設定')}${loc?' ｜ '+esc(loc):''}</p><div class="ca42-flags">${todayBadge}<span>${esc(label(e))}</span>${extra}</div><a href="${esc(recordUrl(e))}">この記録を見る ↗</a></div></article>`;
  }
  function render(){
    cache=matching();
    const displayed=cache.slice(0,state.limit);
    const totalFuture=records.filter(isFuture).length;
    $('ca42-total').textContent=`今後の予定 ${totalFuture.toLocaleString('ja-JP')}件`;
    const dates=new Set(cache.map(x=>x.d.iso)).size;
    $('ca42-summary').textContent=`該当 ${cache.length}件 ／ ${dates}日分 ／ 表示 ${displayed.length}件（1日複数ステージは別記録）`;
    const groups=new Map();
    for(const r of displayed){const k=r.d.iso.slice(0,7);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    $('ca42-items').innerHTML=displayed.length?[...groups].map(([month,arr])=>{
      const [year,mon]=month.split('-').map(Number),inGroup=cache.filter(x=>x.d.iso.startsWith(month)).length;
      return `<section class="ca42-month"><h3>${year}年${mon}月 <small>該当${inGroup}件</small></h3>${arr.map(itemHTML).join('')}</section>`;
    }).join(''):'<div class="ca42-empty">この条件に該当する登録済みの開催予定はありません。予定が存在しないことを意味するものではありません。</div>';
    for(const a of $('ca42-items').querySelectorAll('a[href]'))window.CA_INDEX_RETURN?.link(a,'ca42-upcoming',()=>({...state}));
    $('ca42-more').hidden=state.limit>=cache.length;
    $('ca42-more').textContent=`さらに表示（残り${Math.max(0,cache.length-state.limit)}件）`;
    $('ca42-export').disabled=!cache.length;
  }
  function syncToday(force=false){
    const now=todayISO();if(now===currentToday&&!force)return;
    currentToday=now;refreshYearOptions();state.limit=12;render();
  }
  for(const [id,key] of [['ca42-horizon','horizon'],['ca42-year','year'],['ca42-artist','artist'],['ca42-category','category']]){
    $(id).addEventListener('change',e=>{state[key]=e.target.value;state.limit=12;render();});
  }
  $('ca42-keyword').addEventListener('input',e=>{state.keyword=e.target.value;state.limit=12;render();});
  $('ca42-more').addEventListener('click',()=>{state.limit+=12;render();});
  $('ca42-clear').addEventListener('click',()=>{
    Object.assign(state,{horizon:'365',year:'all',artist:'all',category:'all',keyword:'',limit:12});
    for(const key of ['horizon','year','artist','category'])$('ca42-'+key).value=state[key];
    $('ca42-keyword').value='';render();
  });
  const quote=value=>{let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  $('ca42-export').addEventListener('click',()=>{
    if(!cache.length)return;
    const rows=[['ID','開催日','名義','分類','タイトル','都道府県','会場','登録時の状態','確認区分','記録URL'].map(quote).join(',')];
    for(const r of cache){const e=r.e;rows.push([e.id,e.date,e.artist,CAT[e.category]||e.category,e.title,e.prefecture,e.venue,e.status,e.verification,recordUrl(e)].map(quote).join(','));}
    const blob=new Blob(['\uFEFF'+rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`CA_future_events_${currentToday}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  // When the date changes in Japan, refresh only the view, not the records.
  setInterval(()=>syncToday(),60000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncToday();});
  const saved=window.CA_INDEX_RETURN?.get('ca42-upcoming');
  if(saved){const s=saved.state;currentToday=todayISO();refreshYearOptions();
    for(const key of ['horizon','year','artist','category']){const el=$('ca42-'+key);if([...el.options].some(o=>o.value===s[key]))state[key]=el.value=s[key];}
    if(typeof s.keyword==='string')state.keyword=$('ca42-keyword').value=s.keyword;
    if(Number.isInteger(s.limit))state.limit=Math.max(12,Math.min(records.length,s.limit));
    render();window.CA_INDEX_RETURN.finish(saved);
  }else syncToday(true);
})();
