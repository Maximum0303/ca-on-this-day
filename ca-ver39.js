/* 今日はC&Aの何の日？ | Ver.1.8.2-39
 * UI extension only. Does not mutate window.CA_EVENT_DATA or event records.
 * Must load with defer AFTER app.js and data/events.js.
 */
(() => {
  'use strict';
  const archive = window.CA_EVENT_DATA;
  const events = Array.isArray(archive && archive.events) ? archive.events : [];
  const $ = id => document.getElementById(id);
  if (!events.length || !$('calendar-cells') || !$('day-events') || !$('results')) return;

  const cats = {live:'ライブ',release:'作品発売', book:'書籍・出版',media:'テレビ・ラジオ',milestone:'記録・記念日',amateur:'デビュー前・アマチュア活動',other:'その他'};
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2,'0');
  const eventById = new Map();
  const calendarCounts = new Map();
  for (const event of events) {
    if (event.id != null && !eventById.has(String(event.id))) eventById.set(String(event.id),event);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(event.date))) {
      const key = String(event.date).slice(5);
      calendarCounts.set(key,(calendarCounts.get(key)||0)+1);
    }
  }
  const statusLabel = e => {
    const v=String(e.status||'').toLowerCase().trim();
    if (v.includes('cancel')||v.includes('中止')) return '中止';
    if (v.includes('postpon')||v.includes('延期')) return '延期';
    if (v==='scheduled'||v==='planned'||v.includes('予定')) return '開催予定';
    if (v==='released'||v.includes('発売')) return '発売済み';
    if (v==='recorded'||v==='held'||v==='performed'||v.includes('実施')) return '実施・放送済み';
    return '状態未設定';
  };
  const verificationLabel=e=>e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'確認状況未設定';
  const eventUrl=e=>{
    const url=new URL(window.location.href);
    url.search='';
    url.searchParams.set('date',String(e.date).slice(5));
    url.searchParams.set('event',String(e.id));
    url.hash='browse';
    return url.href;
  };
  const eventLabel=e=>{
    const prefix=String(e.date||'').replace(/-/g,'/');
    const venue=e.venue?' ｜ '+e.venue:'';
    return prefix+' '+String(e.title||'')+venue;
  };
  const tourMatches=e=>{
    if (!e.tourId) return [];
    return events.filter(x=>x.tourId===e.tourId && x.artist===e.artist).sort(compare);
  };
  const venueMatches=e=>{
    if (!e.venue) return [];
    return events.filter(x=>x.venue===e.venue && (e.prefecture?x.prefecture===e.prefecture:true) && x.category==='live').sort(compare);
  };
  const compare=(a,b)=>String(a.date||'').localeCompare(String(b.date||'')) || String(a.id||'').localeCompare(String(b.id||''));
  const relatedButtons=e=>{
    let html='';
    if (e.tourId && tourMatches(e).length>1) html+=`<button type="button" class="ca39-related" data-ca39-kind="tour" data-ca39-id="${esc(e.id)}">同じツアー (${tourMatches(e).length}件)</button>`;
    if (e.venue && venueMatches(e).length>1) html+=`<button type="button" class="ca39-related" data-ca39-kind="venue" data-ca39-id="${esc(e.id)}">同じ会場 (${venueMatches(e).length}件)</button>`;
    return html;
  };

  // No assumption of primary verification from a non-official site. Display safely.
  function safeSourceLabel(source, event) {
    let host='';
    try { host=new URL(String(source.url||'')).hostname.toLowerCase(); } catch (_) {return '参考資料';}
    if (/(^|\.)w\.atwiki\.jp$/.test(host) || host==='ca.ladomi.net' || /(^|\.)wikipedia\.org$/.test(host) || /(^|\.)livefans\.jp$/.test(host) || /(^|\.)setlist\.fm$/.test(host))
      return event.category==='live'?'参考資料（非公式・公演記録）':event.category==='media'?'参考資料（非公式・放送記録）':'参考資料（非公式）';
    const original=String(source.label||'').trim();
    return /公式|放送局|レーベル|主催者|番組公式/.test(original)?original:'参考資料';
  }
  const sourceMarkup=e=>{
    if (!Array.isArray(e.sources)) return '';
    return e.sources.filter(s=>s&&/^https:\/\//i.test(String(s.url||''))).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(safeSourceLabel(s,e))} ↗</a>`).join('');
  };

  function applyCalendarCounts() {
    const calendar=$('calendar-cells');
    const m=Number(($('calendar-title')?.textContent||'').match(/\d+/)?.[0]);
    if (!(m>=1&&m<=12)) return;
    calendar.querySelectorAll('button.day-btn[data-day]').forEach(btn=>{
      const day=Number(btn.dataset.day), count=calendarCounts.get(`${pad(m)}-${pad(day)}`)||0;
      const label=`${m}月${day}日：登録${count}件`;
      if (btn.getAttribute('aria-label')!==label) btn.setAttribute('aria-label',label);
      if (btn.title!==label) btn.title=label;
      if (count) {
        let mark=btn.querySelector('.ca39-day-count');
        if (!mark) {mark=document.createElement('span');mark.className='ca39-day-count';mark.setAttribute('aria-hidden','true');btn.append(mark);}
        if (mark.textContent!==String(count)) mark.textContent=String(count);
      }
    });
    const legend=document.querySelector('.calendar-legend');
    if (legend && !legend.dataset.ca39) {
      legend.dataset.ca39='yes';
      legend.append(document.createTextNode('　数字はその月日に登録された件数です（年をまたいだ合計）。'));
    }
  }

  /* CA242_DAY_FILTERS: display only */
  let dayDisplay={key:'',year:'all',sort:'desc',artist:'all',category:'all',limit:12,filtersOpen:false};
  let refreshing=false;
  const dateKey=()=>{
    const text=$('selected-date')?.textContent||'';
    const match=text.match(/(\d{1,2})月(\d{1,2})日/);
    return match?`${pad(Number(match[1]))}-${pad(Number(match[2]))}`:'';
  };
  const noteMarkup=e=>{
    const description=String(e.description||'');
    const note=String(e.note||'');
    const reader=description?`<p class="ca39-day-note">${esc(description)}</p>`:'';
    const history=note?`<details class="ca39-note ca23-audit"><summary>調査・確認記録</summary><p>${esc(note)}</p></details>`:'';
    return reader+history;
  };
  const dayCard=e=>{
    const venue=[e.prefecture,e.venue].filter(Boolean).join('・');
    return `<article class="ca39-day-card" data-event-id="${esc(e.id)}">
      <div class="ca39-day-meta"><span class="ca39-day-year">${esc(String(e.date).slice(0,4))}年</span><span>${esc(cats[e.category]||'その他')}</span><span>${esc(e.artist||'名義未設定')}</span></div>
      <h4>${esc(e.title||'タイトル未設定')}</h4>
      ${venue?`<p class="ca39-venue">${esc(venue)}</p>`:''}
      <p class="ca39-day-flags"><span>${esc(statusLabel(e))}</span><span>${esc(verificationLabel(e))}</span>${e.performanceNo!=null?`<span>公演番号 ${esc(e.performanceNo)}</span>`:''}</p>
      ${noteMarkup(e)}
      <div class="ca39-day-actions"><a href="${esc(eventUrl(e))}">記録詳細へ ↗</a>${relatedButtons(e)}</div>
      </article>`;
  };
  function renderDayEnhanced() {
    const key=dateKey();
    if (!key) return;
    if (dayDisplay.key!==key) dayDisplay={key,year:'all',sort:'desc',artist:'all',category:'all',limit:12,filtersOpen:false};
    const matches=events.filter(e=>String(e.date||'').slice(5)===key).sort(compare);
    if (!matches.length) return; // preserve Ver.38 partial-archive empty message
    const years=[...new Set(matches.map(e=>String(e.date).slice(0,4)))].sort((a,b)=>b.localeCompare(a));
    const yearFiltered=dayDisplay.year==='all'?matches:matches.filter(e=>String(e.date).startsWith(dayDisplay.year+'-'));
    const artistKey=e=>String(e.artist||'').trim()||'__unknown__';
    const categoryKey=e=>Object.prototype.hasOwnProperty.call(cats,e.category)?e.category:'other';
    const artistOrder=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
    const artistValues=[...new Set(matches.map(artistKey))].sort((a,b)=>{const rank=x=>artistOrder.includes(x)?artistOrder.indexOf(x):99;return rank(a)-rank(b)||a.localeCompare(b,'ja');});
    const categoryValues=Object.keys(cats).filter(k=>matches.some(e=>categoryKey(e)===k));
    const makeOptions=(values,key,label,selected,allLabel)=>['<option value="all">'+allLabel+'</option>',...values.map(v=>'<option value="'+esc(v)+'" '+(selected===v?'selected':'')+'>'+esc(label(v))+' ('+matches.filter(e=>key(e)===v).length+'件)</option>')].join('');
    const artistOptions=makeOptions(artistValues,artistKey,v=>v==='__unknown__'?'名義未設定':v,dayDisplay.artist,'すべての名義');
    const categoryOptions=makeOptions(categoryValues,categoryKey,v=>cats[v],dayDisplay.category,'すべての分類');
    const filtered=yearFiltered.filter(e=>(dayDisplay.artist==='all'||artistKey(e)===dayDisplay.artist)&&(dayDisplay.category==='all'||categoryKey(e)===dayDisplay.category));
    const ordered=dayDisplay.sort==='desc'?[...filtered].reverse():filtered;
    const visible=ordered.slice(0,dayDisplay.limit);
    const options=['<option value="all">すべての年</option>',...years.map(y=>`<option value="${esc(y)}" ${dayDisplay.year===y?'selected':''}>${esc(y)}年 (${matches.filter(e=>String(e.date).startsWith(y+'-')).length}件)</option>`)].join('');
    const filterCount=[dayDisplay.year,dayDisplay.artist,dayDisplay.category].filter(v=>v!=='all').length+Number(dayDisplay.sort!=='desc');
    const desktop=window.matchMedia('(min-width: 701px)').matches;
    const panel=`<div class="ca39-day-list" data-ca39-date="${esc(key)}">
      ${desktop?`<div class="ca244-day-tools"><p class="ca39-day-match">${filterCount?`全${matches.length}件中 ${filtered.length}件一致`:`全${matches.length}件`}${visible.length<filtered.length?` ／ ${visible.length}件表示`:''}</p><button type="button" id="ca244-day-toggle" aria-controls="ca244-day-filters" aria-expanded="${dayDisplay.filtersOpen?'true':'false'}">絞り込み${filterCount?`（設定中 ${filterCount}）`:''}<span aria-hidden="true" class="ca244-chevron">⌄</span></button></div>
      <div id="ca244-day-filters" class="ca244-day-filters"${dayDisplay.filtersOpen?'':' hidden'}>`:''}<div class="ca39-day-toolbar"><label>表示年<select id="ca39-day-year">${options}</select></label><label>並び順<select id="ca39-day-sort"><option value="desc" ${dayDisplay.sort==='desc'?'selected':''}>新しい順</option><option value="asc" ${dayDisplay.sort==='asc'?'selected':''}>古い順</option></select></label><label>名義<select id="ca39-day-artist">${artistOptions}</select></label><label>分類<select id="ca39-day-category">${categoryOptions}</select></label></div>${desktop?`<div class="ca244-day-filter-actions"><button type="button" id="ca244-day-clear">条件をクリア</button><button type="button" id="ca244-day-close">閉じる</button></div></div>`:`<p class="ca39-day-match">この日の全${matches.length}件 ／ 条件に一致 ${filtered.length}件 ／ ${visible.length}件を表示</p>`}
      ${visible.length?visible.map(dayCard).join(''):'<p class="ca39-day-match">この条件に一致する登録済みの記録はありません。表示年・名義・分類を変更してください。</p>'}
      ${visible.length<ordered.length?`<button type="button" id="ca39-day-more" class="ca39-more">さらに${Math.min(12,ordered.length-visible.length)}件を表示（残り${ordered.length-visible.length}件）</button>`:''}
    </div>`;
    // MutationObserver watches direct children; marked markup prevents an update loop.
    refreshing=true;
    $('day-events').innerHTML=panel;
    refreshing=false;
  }
  function afterDayMutation() {
    if (refreshing) return;
    const day=$('day-events');
    if (day.firstElementChild?.classList.contains('ca39-day-list')) return;
    renderDayEnhanced();
  }

  const detailFields=e=>[
    ['記録ID',e.id],['対象日',e.date],['都道府県',e.prefecture],['会場',e.venue],
    ['ツアー',e.tourId?e.title:undefined],['公演番号',e.performanceNo],
    ['作品名',e.releaseTitle],['放送局',e.broadcastStation],['状態',statusLabel(e)],['確認区分',verificationLabel(e)]
  ].filter(([,v])=>v!==undefined&&v!==null&&String(v).trim()!=='');
  function enhanceResultCards() {
    $('results').querySelectorAll('.result-card[data-id]').forEach(card=>{
      if (card.dataset.ca39Enhanced) return;
      const e=eventById.get(card.dataset.id);
      if (!e) return;
      card.dataset.ca39Enhanced='1';
      const details=document.createElement('details');
      details.className='ca39-record-details';
      details.innerHTML=`<summary>記録の詳細情報</summary><dl>${detailFields(e).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><div class="ca39-source-inline">${sourceMarkup(e)}</div>`;
      const actions=document.createElement('div');
      actions.className='ca39-relationships';
      actions.innerHTML=relatedButtons(e);
      const body=card.children[1]||card;
      body.append(details);
      if (actions.childElementCount) body.append(actions);
    });
  }

  // Single accessible dialog reused for both related-record views.
  const dlg=document.createElement('dialog');
  dlg.id='ca39-related-dialog';
  dlg.setAttribute('aria-labelledby','ca39-dialog-title');
  dlg.innerHTML=`<div class="ca39-modal-head"><div><p>RELATED RECORDS / 関連記録</p><h2 id="ca39-dialog-title">関連する記録</h2></div><button type="button" class="ca39-dialog-close" aria-label="閉じる">×</button></div><p id="ca39-dialog-subtitle"></p><div id="ca39-dialog-items"></div><div class="ca39-modal-bottom"><button type="button" id="ca39-modal-more" class="ca39-more" hidden>さらに表示</button><button type="button" class="ca39-dialog-close ca39-close-button">閉じる</button></div>`;
  document.body.append(dlg);
  let modalRecords=[],modalLimit=30;
  const renderModal=()=>{
    const target=$('ca39-dialog-items');
    const showing=modalRecords.slice(0,modalLimit);
    target.innerHTML=showing.map(e=>`<article class="ca39-modal-item"><time>${esc(String(e.date||'').replace(/-/g,'/'))}</time><div><strong>${esc(e.title||'タイトル未設定')}</strong><p>${esc([e.artist,e.prefecture,e.venue].filter(Boolean).join('・'))}</p><small>${esc(statusLabel(e))} ／ ${esc(verificationLabel(e))}${e.performanceNo!=null?' ／ 公演番号 '+esc(e.performanceNo):''}</small><a href="${esc(eventUrl(e))}">記録を開く ↗</a></div></article>`).join('');
    const more=$('ca39-modal-more');
    more.hidden=modalLimit>=modalRecords.length;
    more.textContent=`さらに表示（残り${Math.max(0,modalRecords.length-modalLimit)}件）`;
  };
  function openRelated(kind,id) {
    const selected=eventById.get(id);
    if (!selected) return;
    const list=kind==='tour'?tourMatches(selected):venueMatches(selected);
    if (!list.length) return;
    modalRecords=list;
    modalLimit=30;
    $('ca39-dialog-title').textContent=kind==='tour'?'同じツアーの記録':'同じ会場のライブ記録';
    $('ca39-dialog-subtitle').textContent=(kind==='tour'?(selected.title||selected.tourId):[selected.prefecture,selected.venue].filter(Boolean).join('・'))+` ／ ${list.length}件（登録分）`;
    renderModal();
    if (typeof dlg.showModal==='function') dlg.showModal();
    else { dlg.setAttribute('open',''); }
  }
  document.addEventListener('click',ev=>{
    const b=ev.target.closest?.('[data-ca39-kind][data-ca39-id]');
    if(b){ev.preventDefault();openRelated(b.dataset.ca39Kind,b.dataset.ca39Id);return;}
    if(ev.target.closest?.('.ca39-dialog-close')) {if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open');}
  });
  dlg.addEventListener('click',ev=>{if(ev.target===dlg) dlg.close?.();});
  $('ca39-modal-more').addEventListener('click',()=>{modalLimit+=30;renderModal();});
  $('day-events').addEventListener('change',ev=>{
    const field=({'ca39-day-year':'year','ca39-day-sort':'sort','ca39-day-artist':'artist','ca39-day-category':'category'})[ev.target.id];
    if(field){const id=ev.target.id;const restore=document.activeElement===ev.target;dayDisplay[field]=ev.target.value;dayDisplay.limit=12;renderDayEnhanced();if(restore)$(id)?.focus({preventScroll:true});}
  });
  function setDayFiltersOpen(open,restoreFocus=false){
    dayDisplay.filtersOpen=open;
    const toggle=$('ca244-day-toggle'),panel=$('ca244-day-filters');
    if(toggle)toggle.setAttribute('aria-expanded',String(open));
    if(panel)panel.hidden=!open;
    if(restoreFocus)toggle?.focus({preventScroll:true});
  }
  $('day-events').addEventListener('click',ev=>{
    if(ev.target.closest?.('#ca244-day-toggle')){setDayFiltersOpen(!dayDisplay.filtersOpen);return;}
    if(ev.target.closest?.('#ca244-day-close')){setDayFiltersOpen(false,true);return;}
    if(ev.target.closest?.('#ca244-day-clear')){Object.assign(dayDisplay,{year:'all',sort:'desc',artist:'all',category:'all',limit:12});renderDayEnhanced();$('ca244-day-clear')?.focus({preventScroll:true});return;}
    if(ev.target.closest?.('#ca39-day-more')) {dayDisplay.limit+=12;renderDayEnhanced();}
  });
  const ca244Desktop=window.matchMedia('(min-width: 701px)');
  const ca244Resize=()=>{if($('day-events')?.firstElementChild?.classList.contains('ca39-day-list')){dayDisplay.filtersOpen=false;renderDayEnhanced();}};
  if(ca244Desktop.addEventListener)ca244Desktop.addEventListener('change',ca244Resize);else ca244Desktop.addListener?.(ca244Resize);

  new MutationObserver(applyCalendarCounts).observe($('calendar-cells'),{childList:true});
  new MutationObserver(afterDayMutation).observe($('day-events'),{childList:true});
  new MutationObserver(enhanceResultCards).observe($('results'),{childList:true});
  applyCalendarCounts();
  afterDayMutation();
  enhanceResultCards();
})();
