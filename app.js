(()=>{
'use strict';
const archive=window.CA_EVENT_DATA;
const events=Array.isArray(archive?.events)?archive.events:[];
const $=id=>document.getElementById(id);
const CAT={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',other:'その他'};
const MONTHS=['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
const WEEK=['日','月','火','水','木','金','土'];
const pad=n=>String(n).padStart(2,'0');
const md=(m,d)=>`${pad(m)}-${pad(d)}`;
const fromDate=s=>{const p=String(s||'').split('-').map(Number);return {year:p[0],month:p[1],day:p[2]};};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dayOfWeek=(y,m,d)=>WEEK[new Date(Date.UTC(y,m-1,d)).getUTCDay()];
const todayParts=()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));return {year:Number(p.year),month:Number(p.month),day:Number(p.day)};};
const today=todayParts();
const dateParam=new URLSearchParams(location.search).get('date');
const validParam=dateParam&&/^\d{2}-\d{2}$/.test(dateParam)&&(()=>{let[m,d]=dateParam.split('-').map(Number);return m>=1&&m<=12&&d>=1&&d<=new Date(Date.UTC(2000,m,0)).getUTCDate();})();
const [initMonth,initDay]=validParam?dateParam.split('-').map(Number):[today.month,today.day];
const state={month:initMonth,day:initDay,viewMonth:initMonth,dayOnly:null,limit:18,keyword:new URLSearchParams(location.search).get('q')||''};
const sourceLink=s=>{const u=String(s.url||'');return /^https:\/\//.test(u)?`<a target="_blank" rel="noopener noreferrer" href="${esc(u)}">${esc(s.label||'参考資料')} ↗</a>`:'';};
function syncURL(){const u=new URL(location.href);u.searchParams.set('date',md(state.month,state.day));if(state.keyword)u.searchParams.set('q',state.keyword);else u.searchParams.delete('q');history.replaceState(null,'',u);}
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
function preview(e){const d=fromDate(e.date);const subtitle=[e.prefecture,e.venue].filter(Boolean).join('・');return `<div class="event-preview"><div class="preview-top"><span>${d.year}年</span><span class="tag">${CAT[e.category]||'その他'}</span></div><strong>${esc(e.title)}</strong>${subtitle?`<p>${esc(subtitle)}</p>`:''}${e.note?`<p>${esc(e.note)}</p>`:''}</div>`;}
function renderDay(){
 const matches=events.filter(e=>{const d=fromDate(e.date);return d.month===state.month&&d.day===state.day;}).sort((a,b)=>a.date.localeCompare(b.date));
 $('selected-date').textContent=`${state.month}月${state.day}日`;
 $('day-summary').textContent=matches.length?`${matches.length}件の出来事が登録されています`:'現在、登録されている出来事はありません';
 if(matches.length){$('day-events').innerHTML=matches.map(preview).join('');}
 else {$('day-events').innerHTML=`<div class="empty-state"><strong>この日の記録は、まだ登録されていません。</strong>何も起きなかったという意味ではありません。確認できたものから追加していきます。<p>試験収録の例：<button class="text-button jump-date" data-md="11-19">11月19日</button> ・ <button class="text-button jump-date" data-md="10-10">10月10日</button> ・ <button class="text-button jump-date" data-md="04-10">4月10日</button></p></div>`;}
 $('all-day').textContent=`この日の全${matches.length}件を検索一覧で見る ↓`;
 $('all-day').disabled=matches.length===0;
}
function setDate(month,day){state.month=month;state.day=day;state.viewMonth=month;state.dayOnly=null;state.limit=18;renderHero();renderCalendar();renderDay();renderResults();syncURL();}
function shiftDate(diff){const utc=new Date(Date.UTC(2000,state.month-1,state.day+diff));setDate(utc.getUTCMonth()+1,utc.getUTCDate());}
function category(e){return CAT[e.category]||'その他';}
function resultCard(e){const d=fromDate(e.date),dateText=`${d.year}年${d.month}月${d.day}日`;const details=[e.prefecture,e.venue].filter(Boolean).join('・');const verified=e.verification==='primary'?'一次資料確認済':'参考資料掲載・一次資料照合待ち';const link=(e.sources||[]).map(sourceLink).join('');
 return `<article class="result-card" data-id="${esc(e.id)}"><div class="result-date"><span class="y">${d.year}</span><span class="md">${pad(d.month)}.${pad(d.day)}</span><span class="week">${dayOfWeek(d.year,d.month,d.day)}曜日</span></div><div><div class="result-meta"><span class="tag">${esc(category(e))}</span><span class="tag secondary">${esc(e.artist)}</span>${e.note?'<span class="tag secondary">'+esc(e.note)+'</span>':''}</div><h3>${esc(e.title)}</h3>${details?`<p>${esc(details)}</p>`:''}<details><summary>出典・確認状況</summary><p>${esc(verified)}${e.performanceNo?' ／ ツアー公演 '+esc(e.performanceNo)+'回目':''}</p>${link?`<div class="source-links">${link}</div>`:''}</details></div></article>`;}
function searchableText(e){return [e.id,e.date,e.title,e.artist,e.venue,e.prefecture,e.note,e.releaseTitle,e.tourId].filter(Boolean).join(' ').toLocaleLowerCase('ja-JP');}
function renderResults(){
 const word=state.keyword.trim().toLocaleLowerCase('ja-JP');const artist=$('artist-filter').value,cat=$('category-filter').value,dec=$('decade-filter').value;
 const matches=events.filter(e=>{
 if(artist!=='all'&&e.artist!==artist)return false;
 if(cat!=='all'&&e.category!==cat)return false;
 if(dec!=='all'&&Math.floor(Number(e.date.slice(0,4))/10)*10!==Number(dec))return false;
 if(word&&!searchableText(e).includes(word))return false;
 if(state.dayOnly){const d=fromDate(e.date);if(md(d.month,d.day)!==state.dayOnly)return false;}
 return true;
 }).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
 $('results-count').textContent=`該当 ${matches.length} 件${state.dayOnly?' ／ '+state.month+'月'+state.day+'日の記録':''}`;
 const visible=matches.slice(0,state.limit);$('results').innerHTML=visible.length?visible.map(resultCard).join(''):'<p class="no-matches">該当する記録はありません。検索条件を変更してください。</p>';
 $('load-more').hidden=matches.length<=state.limit;
 $('load-more').textContent=`さらに表示する（残り ${matches.length-state.limit} 件）`;
}
function renderStats(){const live=events.filter(e=>e.category==='live').length,release=events.filter(e=>e.category==='release').length;$('record-total').textContent=`試験収録 ${events.length} 件`;$('total-stat').textContent=events.length;$('live-stat').textContent=live;$('release-stat').textContent=release;}
if(!events.length){$('day-summary').textContent='記録データが見つかりません。data/events.js を確認してください。';$('results').innerHTML='<p class="no-matches">データファイルを読み込めませんでした。</p>';return;}
$('keyword').value=state.keyword;
$('calendar-cells').addEventListener('click',e=>{const el=e.target.closest('[data-day]');if(el)setDate(state.viewMonth,Number(el.dataset.day));});
$('day-events').addEventListener('click',e=>{const b=e.target.closest('.jump-date');if(b){const [m,d]=b.dataset.md.split('-').map(Number);setDate(m,d);}});
$('month-prev').addEventListener('click',()=>{state.viewMonth=state.viewMonth===1?12:state.viewMonth-1;renderCalendar();});
$('month-next').addEventListener('click',()=>{state.viewMonth=state.viewMonth===12?1:state.viewMonth+1;renderCalendar();});
$('date-prev').addEventListener('click',()=>shiftDate(-1));$('date-next').addEventListener('click',()=>shiftDate(1));
$('today-btn').addEventListener('click',()=>setDate(today.month,today.day));
$('all-day').addEventListener('click',()=>{state.dayOnly=md(state.month,state.day);state.limit=18;renderResults();$('browse').scrollIntoView({behavior:'smooth'});});
$('share-date').addEventListener('click',()=>{const u=new URL(location.href);u.searchParams.set('date',md(state.month,state.day));u.searchParams.delete('q');const txt=`今日はC&Aの何の日？ ${state.month}月${state.day}日の出来事を振り返る`;window.open('https://twitter.com/intent/tweet?'+new URLSearchParams({text:txt,url:u.href}).toString(),'_blank','noopener,noreferrer');});
for(const id of ['artist-filter','category-filter','decade-filter'])$(id).addEventListener('change',()=>{state.limit=18;state.dayOnly=null;renderResults();});
$('keyword').addEventListener('input',e=>{state.keyword=e.target.value;state.limit=18;state.dayOnly=null;renderResults();syncURL();});
$('reset-filters').addEventListener('click',()=>{$('artist-filter').value='all';$('category-filter').value='all';$('decade-filter').value='all';$('keyword').value='';state.keyword='';state.dayOnly=null;state.limit=18;renderResults();syncURL();});
$('load-more').addEventListener('click',()=>{state.limit+=18;renderResults();});
renderHero();renderCalendar();renderDay();renderStats();renderResults();syncURL();
})();
