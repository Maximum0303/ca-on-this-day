/* 今日はC&Aの何の日？ — Ver.1.8.2-43
 * 資料確認状況ナビ（閲覧専用）。全件・ID・出典・確認区分・公演状態を変更しない。
 * ca-ver42.js より後に読み込む。
 */
(() => {
  'use strict';
  const archive = window.CA_EVENT_DATA;
  const events = Array.isArray(archive?.events) ? archive.events : [];
  const browse = document.getElementById('browse');
  if (!browse || !events.length || document.getElementById('ca43-check')) return;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const categories = {live:'ライブ', release:'作品発売', book:'書籍・出版', media:'テレビ・ラジオ', milestone:'記録・記念日', amateur:'デビュー前・アマチュア活動', other:'その他'};
  const artistOrder = ['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
  const validYear = e => /^\d{4}-\d{2}-\d{2}$/.test(String(e.date || '')) ? Number(e.date.slice(0,4)) : null;
  const verification = e => e.verification === 'primary' ? 'primary' : e.verification === 'secondary' ? 'secondary' : 'unknown';
  const verificationLabel = v => ({primary:'一次資料確認',secondary:'二次資料確認',unknown:'確認区分未設定'}[v] || '確認区分未設定');
  const normalized = v => String(v ?? '').normalize('NFKC').toLocaleLowerCase('ja-JP');
  const recordUrl = e => {
    const u=new URL(window.location.href);
    u.search='';u.hash='browse';u.searchParams.set('date',String(e.date).slice(5));u.searchParams.set('event',String(e.id));return u.href;
  };
  const decadeOf = e => {const y=validYear(e);return y===null?null:Math.floor(y/10)*10;};
  const state={artist:'all',category:'all',decade:'all',verification:'secondary',keyword:'',order:'desc',limit:12};
  const wrap=document.createElement('section');
  wrap.id='ca43-check';wrap.className='ca43-check';wrap.setAttribute('aria-labelledby','ca43-title');
  wrap.innerHTML=`<div class="section-head ca43-head"><div><span class="kicker">SOURCE VERIFICATION / ARCHIVE</span><h2 id="ca43-title">資料確認状況を調べる</h2><p>年代や名義ごとの一次資料・二次資料の確認区分を一覧で確認できます。</p></div></div>
    <p class="ca43-notice"><strong>「二次資料確認」は誤りの確定ではありません。</strong> 公式などの一次資料を直接照合したかどうかを示す記録上の区分です。資料リンクは当該情報の裏付けとしてご利用ください。日付・会場・公演状態の変更はこの画面から行いません。</p>
    <div class="ca43-kpis" aria-label="登録データの確認状況"><div><span>登録総数</span><strong id="ca43-total">—</strong></div><div><span>一次資料確認</span><strong id="ca43-primary">—</strong></div><div><span>二次資料確認</span><strong id="ca43-secondary">—</strong></div><div><span>確認区分未設定</span><strong id="ca43-unknown">—</strong></div></div>
    <div class="ca43-decade"><h3>年代別の確認状況</h3><p class="ca43-help">各年代を押すと、下の記録一覧に絞り込めます。グラフの長さは当該年代の記録件数に占める割合です。</p><div id="ca43-decade-bars" class="ca43-decade-bars"></div></div>
    <div class="ca43-controls" aria-label="確認状況の絞り込み">
      <label>確認区分<select id="ca43-verification"><option value="secondary">二次資料確認</option><option value="primary">一次資料確認</option><option value="unknown">確認区分未設定</option><option value="all">すべて</option></select></label>
      <label>年代<select id="ca43-decade"><option value="all">すべての年代</option></select></label>
      <label>名義<select id="ca43-artist"><option value="all">すべての名義</option></select></label>
      <label>分類<select id="ca43-category"><option value="all">すべての分類</option></select></label>
      <label>表示順<select id="ca43-order"><option value="desc">新しい順</option><option value="asc">古い順</option></select></label>
      <label class="ca43-search">キーワード<input id="ca43-keyword" type="search" placeholder="タイトル・会場・都道府県など" autocomplete="off"></label>
    </div>
    <div class="ca43-toolbar"><p id="ca43-summary" aria-live="polite"></p><div class="ca43-actions"><button id="ca43-export" type="button" class="text-button">該当記録をCSV保存</button><button id="ca43-reset" type="button" class="text-button">条件をクリア</button></div></div>
    <details id="ca43-list-details" class="ca43-record-details"><summary>記録一覧を表示</summary><div id="ca43-items" class="ca43-items"></div><div class="ca43-more-wrap"><button id="ca43-more" type="button" class="btn btn-ghost" hidden>さらに表示する</button></div></details>
    <details class="ca43-guidance"><summary>原典照合の際に注意すること</summary><p>同じ日付・会場でも昼夜2公演の場合があります。延期前・振替日・中止・放送日は別の記録や履歴として扱います。資料の確認後も、既存ID・出典URLを維持しながら必要な修正だけを行ってください。</p></details>`;
  browse.parentNode.insertBefore(wrap,browse);
  const option=(v,label)=>`<option value="${esc(v)}">${esc(label)}</option>`;
  const decades=[...new Set(events.map(decadeOf).filter(x=>x!==null))].sort((a,b)=>a-b);
  $('ca43-decade').insertAdjacentHTML('beforeend',decades.map(d=>option(d,d+'年代')).join(''));
  const artists=[...new Set(events.map(e=>e.artist).filter(Boolean))].sort((a,b)=>{
    const aa=artistOrder.indexOf(a),bb=artistOrder.indexOf(b);
    return (aa<0?99:aa)-(bb<0?99:bb)||a.localeCompare(b,'ja');
  });
  $('ca43-artist').insertAdjacentHTML('beforeend',artists.map(a=>option(a,a)).join(''));
  const cats=[...new Set(events.map(e=>e.category).filter(Boolean))];
  $('ca43-category').insertAdjacentHTML('beforeend',cats.map(c=>option(c,categories[c]||c)).join(''));
  function drawStats(){
    $('ca43-total').textContent=events.length.toLocaleString('ja-JP')+'件';
    for(const k of ['primary','secondary','unknown'])$('ca43-'+k).textContent=events.filter(e=>verification(e)===k).length.toLocaleString('ja-JP')+'件';
    $('ca43-decade-bars').innerHTML=decades.map(d=>{
      const group=events.filter(e=>decadeOf(e)===d),p=group.filter(e=>verification(e)==='primary').length,s=group.filter(e=>verification(e)==='secondary').length,u=group.length-p-s;
      const pPct=group.length?p/group.length*100:0,sPct=group.length?s/group.length*100:0,uPct=group.length?u/group.length*100:0;
      return `<button type="button" class="ca43-decade-row" data-decade="${d}" aria-label="${d}年代 ${group.length}件、一次資料${p}件、二次資料${s}件">
        <span class="ca43-decade-name">${d}年代</span><span class="ca43-bar" aria-hidden="true"><span class="ca43-bar-primary" style="width:${pPct.toFixed(4)}%"></span><span class="ca43-bar-secondary" style="width:${sPct.toFixed(4)}%"></span><span class="ca43-bar-unknown" style="width:${uPct.toFixed(4)}%"></span></span><span class="ca43-decade-n">${group.length.toLocaleString('ja-JP')}件</span>
      </button>`;
    }).join('')+`<div class="ca43-legend"><span class="ca43-legend-primary">一次資料</span><span class="ca43-legend-secondary">二次資料</span><span class="ca43-legend-unknown">未設定</span></div>`;
  }
  let matched=[];
  const compare=(a,b)=>String(a.date).localeCompare(String(b.date))||String(a.id).localeCompare(String(b.id));
  function matches(){
    const terms=normalized(state.keyword.trim()).split(/\s+/).filter(Boolean);
    return events.filter(e=>{
      if(state.verification!=='all'&&verification(e)!==state.verification)return false;
      if(state.decade!=='all'&&decadeOf(e)!==Number(state.decade))return false;
      if(state.artist!=='all'&&e.artist!==state.artist)return false;
      if(state.category!=='all'&&e.category!==state.category)return false;
      if(terms.length){const hay=normalized([e.id,e.date,e.artist,e.category,e.title,e.prefecture,e.venue,e.releaseTitle,e.broadcastStation,e.tourId].filter(Boolean).join(' '));if(terms.some(t=>!hay.includes(t)))return false;}
      return true;
    }).sort((a,b)=>state.order==='desc'?-compare(a,b):compare(a,b));
  }
  const hasSources=e=>Array.isArray(e.sources)&&e.sources.some(s=>s&&/^https:\/\//.test(String(s.url||'')));
  function card(e){
    const locationLabel=[e.prefecture,e.venue].filter(Boolean).join('・');
    const count=Array.isArray(e.sources)?e.sources.filter(s=>s&&/^https:\/\//.test(String(s.url||''))).length:0;
    const sourceLabel=count?`資料リンク ${count}件`:'資料リンク未設定';
    return `<article class="ca43-item"><div class="ca43-item-date"><time datetime="${esc(e.date)}">${esc(String(e.date).replace(/-/g,'/'))}</time><span>${esc(categories[e.category]||e.category||'その他')}</span></div><div class="ca43-item-body"><h3>${esc(e.title||'タイトル未設定')}</h3><p>${esc(e.artist||'名義未設定')}${locationLabel?' ｜ '+esc(locationLabel):''}</p><div class="ca43-flags"><span>${esc(verificationLabel(verification(e)))}</span><span>${esc(sourceLabel)}</span></div><a href="${esc(recordUrl(e))}">記録の詳細と出典を見る ↗</a></div></article>`;
  }
  function render(){
    matched=matches();
    const count=matched.length;
    $('ca43-summary').textContent=`該当 ${count.toLocaleString('ja-JP')}件 ／ 表示対象 ${Math.min(state.limit,count).toLocaleString('ja-JP')}件。区分は登録時の資料確認状況です。`;
    $('ca43-export').disabled=count===0;
    $('ca43-decade-bars').querySelectorAll('button[data-decade]').forEach(b=>b.setAttribute('aria-pressed',String(state.decade===b.dataset.decade)));
    if(!$('ca43-list-details').open){$('ca43-items').innerHTML='';$('ca43-more').hidden=true;return;}
    $('ca43-items').innerHTML=count?matched.slice(0,state.limit).map(card).join(''):'<p class="ca43-empty">該当する記録はありません。絞り込みを変更してください。</p>';
    $('ca43-more').hidden=state.limit>=count;
    $('ca43-more').textContent=`さらに表示する（残り${Math.max(0,count-state.limit).toLocaleString('ja-JP')}件）`;
  }
  for(const key of ['verification','decade','artist','category','order']){
    $('ca43-'+key).addEventListener('change',e=>{state[key]=e.target.value;state.limit=12;render();});
  }
  $('ca43-keyword').addEventListener('input',e=>{state.keyword=e.target.value;state.limit=12;render();});
  $('ca43-decade-bars').addEventListener('click',e=>{
    const button=e.target.closest('button[data-decade]');if(!button)return;
    state.decade=state.decade===button.dataset.decade?'all':button.dataset.decade;
    $('ca43-decade').value=state.decade;state.limit=12;$('ca43-list-details').open=true;render();
  });
  $('ca43-list-details').addEventListener('toggle',render);
  $('ca43-more').addEventListener('click',()=>{state.limit+=12;render();});
  $('ca43-reset').addEventListener('click',()=>{
    Object.assign(state,{artist:'all',category:'all',decade:'all',verification:'secondary',keyword:'',order:'desc',limit:12});
    for(const key of ['artist','category','decade','verification','order'])$('ca43-'+key).value=state[key];
    $('ca43-keyword').value='';render();
  });
  const quote=value=>{let s=String(value??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  $('ca43-export').addEventListener('click',()=>{
    if(!matched.length)return;
    const cols=['ID','日付','名義','分類','タイトル','都道府県','会場','確認区分','登録状態','出典URL','記録URL'];
    const rows=[cols.map(quote).join(',')];
    for(const e of matched){const urls=(Array.isArray(e.sources)?e.sources:[]).filter(s=>s&&/^https:\/\//.test(String(s.url||''))).map(s=>String(s.url)).join(' | ');
      rows.push([e.id,e.date,e.artist,categories[e.category]||e.category,e.title,e.prefecture,e.venue,verificationLabel(verification(e)),e.status,urls,recordUrl(e)].map(quote).join(','));}
    const blob=new Blob(['\uFEFF'+rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`CA_source_verification_${new Date().toISOString().slice(0,10)}.csv`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  });
  drawStats();render();
  window.CA43View={verification,hasSources}; // Read-only helpers for diagnostics.
})();
