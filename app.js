(()=>{
'use strict';
const archive=window.CA_EVENT_DATA;
const events=Array.isArray(archive?.events)?archive.events:[];
const $=id=>document.getElementById(id);
const CAT={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',amateur:'デビュー前・アマチュア活動',other:'その他'};
const MONTHS=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const WEEK=['日','月','火','水','木','金','土'];
const pad=n=>String(n).padStart(2,'0');
const md=(m,d)=>`${pad(m)}-${pad(d)}`;
const fromDate=s=>{const p=String(s||'').split('-').map(Number);return {year:p[0],month:p[1],day:p[2]};};
const isYearOnly=e=>e?.datePrecision==='year'||/^\d{4}$/.test(String(e?.date||''));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayOfWeek=(y,m,d)=>WEEK[new Date(Date.UTC(y,m-1,d)).getUTCDay()];
const todayParts=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return {year:Number(p.year),month:Number(p.month),day:Number(p.day)};};
const today=todayParts();
const dateParam=new URLSearchParams(location.search).get('date');
const validParam=dateParam&&/^\d{2}-\d{2}$/.test(dateParam)&&(()=>{let[m,d]=dateParam.split('-').map(Number);return m>=1&&m<=12&&d>=1&&d<=new Date(Date.UTC(2000,m,0)).getUTCDate();})();
const [initMonth,initDay]=validParam?dateParam.split('-').map(Number):[today.month,today.day];
const initialParams=new URLSearchParams(location.search);
const state={month:initMonth,day:initDay,viewMonth:initMonth,dayOnly:null,limit:18,keyword:initialParams.get('q')||'',eventId:initialParams.get('event')||''};
const sourceLink=s=>{const u=String(s.url||'');return /^https:\/\//.test(u)?`<a target="_blank" rel="noopener noreferrer" href="${esc(u)}">${esc(s.label||'参考資料')} ↗</a>`:'';};
function syncURL(){
 const u=new URL(location.href);
 const selected=state.eventId?events.find(e=>e.id===state.eventId):null;
 if(selected&&isYearOnly(selected))u.searchParams.delete('date');else u.searchParams.set('date',md(state.month,state.day));
 if(state.keyword&&!state.eventId)u.searchParams.set('q',state.keyword);else u.searchParams.delete('q');
 const fields=[['artist','artist-filter'],['category','category-filter'],['decade','decade-filter'],['year','year-filter'],['status','status-filter'],['verification','verification-filter'],['sort','sort-filter']];
 for(const [key,id] of fields){const v=$(id)?.value||'all';if(v==='all'||(key==='sort'&&v==='asc'))u.searchParams.delete(key);else u.searchParams.set(key,v);}
 if(state.eventId)u.searchParams.set('event',state.eventId);else u.searchParams.delete('event');
 history.replaceState(null,'',u);
}
function renderHero(){const list=events.filter(e=>{const d=fromDate(e.date);return d.month===state.month&&d.day===state.day;});$('hero-month-en').textContent=MONTHS[state.month-1];$('hero-day').textContent=pad(state.day);$('hero-date-ja').textContent=`${state.month}月${state.day}日`;$('hero-week').textContent='日付を自由に選択';$('hero-count').textContent=`登録 ${list.length} 件`;}
function getReferenceYear(month){let y=today.year;if(month===2 && new Date(Date.UTC(y,2,0)).getUTCDate()!==29){while(new Date(Date.UTC(y,2,0)).getUTCDate()!==29)y--; }return y;}
function renderCalendar(){
 const refYear=getReferenceYear(state.viewMonth), month=state.viewMonth;
 $('calendar-title').textContent=`${month}月`;
 const cap=document.querySelector('.month-caption');cap.textContent=month===2&&refYear!==today.year?'2月29日を選べるよう、うるう年の曜日配置で表示':`${today.year}年の曜日配置で表示`;
 const count=new Date(Date.UTC(refYear,month,0)).getUTCDate();const offset=new Date(Date.UTC(refYear,month-1,1)).getUTCDay();
 const days=new Set(events.map(e=>fromDate(e.date)).filter(d=>d.month===month).map(d=>d.day));
 const nowMonth=month===today.month;
 const html=[];for(let n=0;n<offset;n++)html.push('<span class="day-empty" aria-hidden="true"></span>');
 for(let day=1;day<=count;day++){
  const cls=['day-btn',days.has(day)?'has-events':'',state.month===month&&state.day===day?'is-selected':'',nowMonth&&today.day===day?'is-today':''].filter(Boolean).join(' ');
  html.push(`<button type="button" data-day="${day}" class="${cls}" aria-label="${month}月${day}日" aria-pressed="${state.month===month&&state.day===day}">${day}</button>`);
 }
 $('calendar-cells').innerHTML=html.join('');
}
function preview(e){const d=fromDate(e.date);const subtitle=[e.prefecture,e.venue].filter(Boolean).join('・');return `<div class="event-preview"><div class="preview-top"><span>${d.year}年</span><span class="tag">${CAT[e.category]||'その他'}</span></div><strong>${esc(e.title)}</strong>${subtitle?`<p>${esc(subtitle)}</p>`:''}${e.description?`<p>${esc(e.description)}</p>`:''}</div>`;}
function renderDay(){
 const matches=events.filter(e=>{const d=fromDate(e.date);return d.month===state.month&&d.day===state.day;}).sort((a,b)=>a.date.localeCompare(b.date));
 $('selected-date').textContent=`${state.month}月${state.day}日`;
 $('day-summary').textContent=matches.length?`${matches.length}件の出来事が登録されています`:'現在、登録されている出来事はありません';
 if(matches.length){$('day-events').innerHTML=matches.map(preview).join('');}
 else {$('day-events').innerHTML=`<div class="empty-state"><strong>この日の記録は、まだ登録されていません。</strong>何も起きなかったという意味ではありません。確認できたものから追加していきます。<p>記録のある日の例：<button class="text-button jump-date" data-md="11-19">11月19日</button> ・ <button class="text-button jump-date" data-md="10-10">10月10日</button> ・ <button class="text-button jump-date" data-md="04-10">4月10日</button></p></div>`;}
 $('all-day').textContent=`この日の全${matches.length}件を検索一覧で見る ↓`;
 $('all-day').disabled=matches.length===0;
}
function setDate(month,day){state.eventId='';state.month=month;state.day=day;state.viewMonth=month;state.dayOnly=null;state.limit=18;renderHero();renderCalendar();renderDay();renderResults();syncURL();}
function shiftDate(diff){const utc=new Date(Date.UTC(2000,state.month-1,state.day+diff));setDate(utc.getUTCMonth()+1,utc.getUTCDate());}
function category(e){return CAT[e.category]||'その他';}
/* UX Ver.1.8.2-38: search/filter/display only; source data untouched */
const STATUS_NAMES={historical:'歴史的出来事',recorded:'公演・放送済み',scheduled:'開催予定',postponed:'延期',cancelled:'中止',released:'発売済み',unknown:'状態未設定'};
function normalizedStatus(e){
 const raw=String(e.status||'').toLowerCase().trim();
 if(raw==='historical')return 'historical';
 if(raw.includes('cancel')||raw.includes('中止'))return 'cancelled';
 if(raw.includes('postpon')||raw.includes('延期'))return 'postponed';
 if(raw==='scheduled'||raw==='planned'||raw.includes('予定'))return 'scheduled';
 if(raw==='released'||raw.includes('発売'))return 'released';
 if(raw==='recorded'||raw==='held'||raw==='performed'||raw.includes('実施'))return 'recorded';
 return 'unknown';
}
function verificationLabel(e){return e.verification==='primary'?'一次資料確認済':e.verification==='secondary'?'二次資料確認':'確認状況未設定';}
function recordUrl(e){
 const u=new URL(location.href);u.search='';if(!isYearOnly(e))u.searchParams.set('date',String(e.date).slice(5,7)+'-'+String(e.date).slice(8,10));u.searchParams.set('event',e.id);u.hash='browse';return u.href;
}
function resultCard(e){
 const d=fromDate(e.date), details=[e.prefecture,e.venue].filter(Boolean).join('・');
 const kind=normalizedStatus(e), link=(e.sources||[]).map(sourceLink).join('');
 const yearOnly=isYearOnly(e);
 const works=e.category==='release'&&Array.isArray(e.releaseTitles)?e.releaseTitles.filter(x=>typeof x==='string'&&x.trim()):[];
 const workSummary=works.length?'<p class="ca-release-works"><strong>対象作品：</strong>'+works.map(esc).join(' ／ ')+'</p>':'';
 const datePart=yearOnly?'<span class="y">'+d.year+'</span><span class="md">月日未詳</span>':'<span class="y">'+d.year+'</span><span class="md">'+pad(d.month)+'.'+pad(d.day)+'</span><span class="week">'+dayOfWeek(d.year,d.month,d.day)+'曜日</span>';
 const statusText=yearOnly&&e.category==='milestone'?'年単位の歴史記録':STATUS_NAMES[kind];
 return `<article class="result-card ${yearOnly?'year-precision':''}" data-id="${esc(e.id)}"><div class="result-date">${datePart}</div><div><div class="result-meta"><span class="tag">${esc(category(e))}</span><span class="tag secondary">${esc(e.artist)}</span><span class="tag status-tag status-${kind}">${statusText}</span><span class="tag secondary">${esc(verificationLabel(e))}</span></div><h3>${esc(e.title)}</h3>${details?`<p>${esc(details)}</p>`:''}${workSummary}${e.description?`<p class="record-note">${esc(e.description)}</p>`:''}${e.note?`<details class="ca23-audit"><summary>調査・確認記録（元の備考）</summary><p>${esc(e.note)}</p></details>`:''}<div class="record-actions"><a class="record-permalink" href="${esc(recordUrl(e))}">この記録を開く ↗</a></div><details><summary>出典・確認状況</summary><p>${esc(verificationLabel(e))}${e.performanceNo?' ／ ツアー公演 '+esc(e.performanceNo)+'回目':''}</p>${link?`<div class="source-links">${link}</div>`:''}</details></div></article>`;
}
function searchableText(e){const names=Array.isArray(e.releaseTitles)?e.releaseTitles.filter(x=>typeof x==='string'):[];return [e.id,e.date,e.title,e.artist,e.venue,e.prefecture,e.description,e.note,e.releaseTitle,...names,e.catalogNumber,e.catalogNo,e.format,e.releaseFormat,e.tourId,e.broadcastStation].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ja-JP');}
/* YEAR_ONLY_CONDITIONAL_V221: year-only records are visible only with the relevant filter */
function yearOnlyFiltersActive(){
 return $('year-filter').value!=='all'||$('category-filter').value==='milestone';
}
function caParseQueryTokens(source) {
  const text = String(source ?? '').normalize('NFKC');
  const tokens = [];
  let word = '', phrase = false, closing = '';
  const push = () => {
    const value = word.trim();
    if (value) tokens.push({value, phrase});
    word = ''; phrase = false;
  };
  for (const ch of text) {
    if (closing) {
      if (ch === closing) { push(); closing = ''; }
      else word += ch;
      continue;
    }
    if (ch === '"' || ch === '“' || ch === '「') {
      push(); closing = ch === '“' ? '”' : (ch === '「' ? '」' : '"');
      phrase = true;
    } else if (/\s/.test(ch)) {
      push();
    } else {
      word += ch;
    }
  }
  push();
  return tokens;
}
function getMatches(){
 const terms=caParseQueryTokens(state.keyword).map(t=>t.value.toLocaleLowerCase('ja-JP'));
 const artist=$('artist-filter').value,cat=$('category-filter').value,dec=$('decade-filter').value;
 const year=$('year-filter').value,kind=$('status-filter').value,verification=$('verification-filter').value,sort=$('sort-filter').value;
 return events.filter(e=>{
  if(state.eventId)return e.id===state.eventId;
  if(isYearOnly(e)&&!yearOnlyFiltersActive())return false;
  if(artist!=='all'&&e.artist!==artist)return false;
  if(cat!=='all'&&e.category!==cat)return false;
  if(dec!=='all'&&Math.floor(Number(e.date.slice(0,4))/10)*10!==Number(dec))return false;
  if(year!=='all'&&String(e.date).slice(0,4)!==year)return false;
  if(kind!=='all'&&normalizedStatus(e)!==kind)return false;
  if(verification!=='all'&&(verification==='unknown'?['primary','secondary'].includes(e.verification):e.verification!==verification))return false;
  if(terms.length){const hay=searchableText(e);if(terms.some(t=>!hay.includes(t)))return false;}
  if(state.dayOnly){const d=fromDate(e.date);if(md(d.month,d.day)!==state.dayOnly)return false;}
  return true;
 }).sort((a,b)=>{const n=a.date.localeCompare(b.date)||a.id.localeCompare(b.id);return sort==='desc'?-n:n;});
}
function renderResults(){
 const matches=getMatches(),count=matches.length,display=Math.min(state.limit,count);
 $('results-count').textContent=state.eventId?'個別記録：'+count+'件':('該当 '+count+' 件 ／ 表示 '+display+' 件'+(state.dayOnly?' ／ '+state.month+'月'+state.day+'日の記録':''));
 const visible=matches.slice(0,state.limit);
 $('results').innerHTML=visible.length?visible.map(resultCard).join(''):'<p class="no-matches">該当する記録はありません。検索条件を変更してください。</p>';
 $('load-more').hidden=count<=state.limit;
 $('load-more').textContent='さらに表示する（残り '+(count-state.limit)+'件）';
 $('export-results').disabled=count===0;
 renderYearOnly(matches);
}
function restoreFilters(){
 const names=[['artist','artist-filter'],['category','category-filter'],['decade','decade-filter'],['year','year-filter'],['status','status-filter'],['verification','verification-filter'],['sort','sort-filter']];
 for(const [key,id] of names){const v=initialParams.get(key);if(v&&Array.from($(id).options).some(x=>x.value===v))$(id).value=v;}
}
function populateYears(){
 const years=[...new Set(events.map(e=>String(e.date||'').slice(0,4)).filter(x=>/^\d{4}$/.test(x)))].sort((a,b)=>b.localeCompare(a));
 for(const year of years){const o=document.createElement('option');o.value=year;o.textContent=year+'年';$('year-filter').appendChild(o);}
}
function saveResultsCSV(){
 const records=getMatches();if(!records.length)return;
 const q=v=>{let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const rows=[['ID','日付','名義','分類','タイトル','都道府県','会場','状態','確認区分','説明文','元の備考'].map(q).join(',')];
 for(const e of records)rows.push([e.id,e.date,e.artist,category(e),e.title,e.prefecture,e.venue,STATUS_NAMES[normalizedStatus(e)],verificationLabel(e),e.description,e.note].map(q).join(','));
 const blob=new Blob(['\uFEFF'+rows.join('\r\n')+'\r\n'],{type:'text/csv;charset=utf-8'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='CA_history_search_'+new Date().toISOString().slice(0,10)+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);
}

/* YEAR_ONLY_RECORDS_V2029: selected year is not a fabricated date */
function renderYearOnly(matches){
 const section=$('year-only'),box=$('year-only-list');if(!section||!box)return;
 // Move below the search filters so selecting a condition reveals the section in place.
 const filters=$('browse')?.querySelector('.filters');
 if(filters&&section.previousElementSibling!==filters)filters.insertAdjacentElement('afterend',section);
 const list=yearOnlyFiltersActive()?(matches||getMatches()).filter(isYearOnly):[];
 section.hidden=list.length===0;
 if(!list.length){box.replaceChildren();return;}
 box.innerHTML=list.map(e=>{
  const note=String(e.description||'');const brief=note.length>260?note.slice(0,260)+'…':note;
  return '<article class="year-only-card"><span class="year-only-stamp">'+esc(e.date)+'年／月日未詳</span><span class="tag">'+esc(category(e))+'</span><h3>'+esc(e.title)+'</h3><p>'+esc(brief)+'</p><a href="'+esc(recordUrl(e))+'">記録の詳細・出典を見る ↗</a></article>';
 }).join('');
}
/* /YEAR_ONLY_RECORDS_V2029 */

function renderStats(){const live=events.filter(e=>e.category==='live').length,release=events.filter(e=>e.category==='release').length;$('record-total').textContent=`収録記録 ${events.length}件`;$('total-stat').textContent=events.length;$('live-stat').textContent=live;$('release-stat').textContent=release;}
if(!events.length){$('day-summary').textContent='記録データが見つかりません。data/events.js を確認してください。';$('results').innerHTML='<p class="no-matches">データファイルを読み込めませんでした。</p>';return;}
populateYears();restoreFilters();if(state.eventId&&!events.some(e=>e.id===state.eventId))state.eventId='';$('keyword').value=state.keyword;
$('calendar-cells').addEventListener('click',e=>{const el=e.target.closest('[data-day]');if(el)setDate(state.viewMonth,Number(el.dataset.day));});
$('day-events').addEventListener('click',e=>{const b=e.target.closest('.jump-date');if(b){const [m,d]=b.dataset.md.split('-').map(Number);setDate(m,d);}});
$('month-prev').addEventListener('click',()=>{state.viewMonth=state.viewMonth===1?12:state.viewMonth-1;renderCalendar();});
$('month-next').addEventListener('click',()=>{state.viewMonth=state.viewMonth===12?1:state.viewMonth+1;renderCalendar();});
$('date-prev').addEventListener('click',()=>shiftDate(-1));$('date-next').addEventListener('click',()=>shiftDate(1));
$('today-btn').addEventListener('click',()=>setDate(today.month,today.day));
$('all-day').addEventListener('click',()=>{state.dayOnly=md(state.month,state.day);state.eventId='';state.keyword='';$('keyword').value='';for(const id of ['artist-filter','category-filter','decade-filter','year-filter','status-filter','verification-filter'])$(id).value='all';$('sort-filter').value='asc';state.limit=18;renderResults();syncURL();$('browse').scrollIntoView({behavior:'smooth'});});
$('share-date').addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.set('date',md(state.month,state.day));u.searchParams.delete('q');const txt=`今日はC&Aの何の日？ ${state.month}月${state.day}日の出来事を振り返る`;window.open('https://twitter.com/intent/tweet?'+new URLSearchParams({text:txt,url:u.href}).toString(),'_blank','noopener,noreferrer');});
for(const id of ['artist-filter','category-filter','decade-filter','year-filter','status-filter','verification-filter','sort-filter'])$(id).addEventListener('change',()=>{state.eventId='';state.limit=18;state.dayOnly=null;renderResults();syncURL();});
$('keyword').addEventListener('input',e=>{state.keyword=e.target.value;state.eventId='';state.limit=18;state.dayOnly=null;renderResults();syncURL();});
$('reset-filters').addEventListener('click',()=>{
 for(const id of ['artist-filter','category-filter','decade-filter','year-filter','status-filter','verification-filter'])$(id).value='all';
 $('sort-filter').value='asc';$('keyword').value='';state.keyword='';state.eventId='';state.dayOnly=null;state.limit=18;renderResults();syncURL();
});
$('load-more').addEventListener('click',()=>{state.limit+=18;renderResults();});
$('export-results').addEventListener('click',saveResultsCSV);
renderHero();renderCalendar();renderDay();renderStats();renderResults();syncURL();
})();
