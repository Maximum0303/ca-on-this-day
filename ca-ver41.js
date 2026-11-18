/* 今日はC&Aの何の日？ Ver.1.8.2-41
 * Display-only status overlay. Never modifies window.CA_EVENT_DATA or its events.
 * Read after app.js, ca-ver39.js, and ca-ver40.js.
 */
(()=>{
'use strict';
const archive=window.CA_EVENT_DATA;
const events=Array.isArray(archive?.events)?archive.events:[];
if(!events.length)return;
const byId=new Map(events.map(e=>[String(e.id),e]));
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function todayISO(){
 const values=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 return `${values.year}-${values.month}-${values.day}`;
}
function state(e,reference=todayISO()){
 const raw=String(e?.status||'').toLowerCase().trim(),date=String(e?.date||'');
 if(raw.includes('cancel')||raw.includes('中止'))return {code:'cancelled',label:'中止'};
 if(raw.includes('postpon')||raw.includes('延期'))return {code:'postponed',label:'延期'};
 if(raw==='scheduled'||raw==='planned'||raw.includes('予定')){
  if(/^\d{4}-\d{2}-\d{2}$/.test(date)){
   if(date<reference)return {code:'review',label:'開催日経過・実施確認待ち'};
   if(date===reference)return {code:'scheduled',label:'本日開催予定（実施未確認）'};
  }
  return {code:'scheduled',label:'開催予定'};
 }
 if(raw==='released'||raw.includes('発売'))return {code:'released',label:'発売済み'};
 if(raw==='recorded'||raw==='held'||raw==='performed'||raw.includes('実施'))return {code:'recorded',label:'公演・放送済み'};
 return {code:'unknown',label:'状態未設定'};
}
function historicalNote(input){
 return String(input||'').replace(/【開催予定[・･・\s]*([0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日)時点】/g,'【確認履歴：$1時点では開催予定】');
}
function writeText(el,v){if(el&&el.textContent!==v){el.textContent=v;return true;}return false;}
function getEventFromLink(el){
 try{const a=el?.querySelector('a[href*="event="]');if(!a)return null;const u=new URL(a.getAttribute('href'),/^https?:/.test(location.href)?location.href:'https://example.org/');return byId.get(u.searchParams.get('event'));}catch(_){return null;}
}
function fixNotes(container){
 if(!container)return;
 const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const t of nodes){const n=historicalNote(t.nodeValue);if(n!==t.nodeValue)t.nodeValue=n;}
}
function patchResult(){
 const root=$('results');if(!root)return;
 root.querySelectorAll('.result-card[data-id]').forEach(card=>{
  const e=byId.get(card.dataset.id);if(!e)return;
  const view=state(e);
  const badge=card.querySelector('.status-tag');
  if(badge){writeText(badge,view.label);badge.classList.toggle('ca41-needs-review',view.code==='review');badge.title=view.code==='review'?'日付が経過したことのみ判定。開催実施を確認した意味ではありません。':'';}
  card.querySelectorAll('.ca39-record-details dl dt').forEach(dt=>{if(dt.textContent?.trim()==='状態')writeText(dt.nextElementSibling,view.label);});
  card.querySelectorAll('.record-note').forEach(fixNotes);
 });
}
function patchDay(){
 const root=$('day-events');if(!root)return;
 root.querySelectorAll('.ca39-day-card[data-event-id]').forEach(card=>{
  const e=byId.get(card.dataset.eventId);if(!e)return;
  const b=card.querySelector('.ca39-day-flags span');
  if(b){const v=state(e);writeText(b,v.label);b.classList.toggle('ca41-needs-review',v.code==='review');}
  card.querySelectorAll('.ca39-day-note,.ca39-note p').forEach(fixNotes);
 });
 // Fallback for early layouts that still display the original simple previews.
 root.querySelectorAll('.event-preview').forEach(fixNotes);
}
function patchMonthly(){
 const root=$('ca40-items');if(!root)return;
 root.querySelectorAll('.ca40-item').forEach(card=>{
  const e=getEventFromLink(card);if(!e)return;
  const b=card.querySelector('.ca40-flags span');
  if(b){const v=state(e);writeText(b,v.label);b.classList.toggle('ca41-needs-review',v.code==='review');}
 });
}
function patchRelated(){
 const root=$('ca39-dialog-items');if(!root)return;
 root.querySelectorAll('.ca39-modal-item').forEach(card=>{
  const e=getEventFromLink(card);if(!e)return;
  const small=card.querySelector('small');if(!small)return;
  const original=small.textContent||'';
  const v=state(e);
  if(String(e.status||'').toLowerCase().includes('sched') && (original.startsWith('開催予定')||original.startsWith('開催日経過・実施確認待ち')||original.startsWith('本日開催予定'))){
   writeText(small,original.replace(/^(開催予定|開催日経過・実施確認待ち|本日開催予定（実施未確認）)/,v.label));
  }
 });
}
function reviewRecords(){return events.filter(e=>state(e).code==='review').sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.id).localeCompare(String(b.id)));}
function eventUrl(e){const u=new URL(location.href);u.search='';u.hash='browse';u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',e.id);return u.href;}
let reviewLimit=15;
function showReview(){
 const panel=$('ca41-review');if(!panel)return;
 const list=reviewRecords();
 $('ca41-review-count').textContent=`${list.length}件（登録分）`;
 const cards=list.slice(0,reviewLimit).map(e=>`<li><a href="${esc(eventUrl(e))}"><time datetime="${esc(e.date)}">${esc(e.date)}</time>　${esc(e.artist)}｜${esc(e.title)}</a><span>${esc([e.prefecture,e.venue].filter(Boolean).join('・'))}</span></li>`).join('');
 $('ca41-review-items').innerHTML=cards||'<li class="ca41-no-review">現在、開催日が経過し実施確認待ちとなっている「開催予定」登録はありません。</li>';
 const more=$('ca41-review-more');more.hidden=list.length<=reviewLimit;more.textContent=`さらに表示（残り${Math.max(0,list.length-reviewLimit)}件）`;
 const label=document.querySelector('label:has(> #status-filter) > span');if(label)label.textContent='登録時の状態';
 const select=$('status-filter');if(select){const option=select.querySelector('option[value="scheduled"]');if(option)option.textContent='開催予定として登録（過去分含む）';}
}
const browse=$('browse');
if(browse&&!$('ca41-review')){
 const section=document.createElement('section');
 section.id='ca41-review';section.className='ca41-review';
 section.setAttribute('aria-label','開催実施の確認待ち');
 section.innerHTML=`<div class="ca41-review-head"><div><span class="kicker">SCHEDULE FOLLOW-UP</span><h3>開催日が過ぎた予定の確認</h3></div><strong id="ca41-review-count"></strong></div>
 <p>日付だけでは実施・延期・中止は判断できません。<strong>元の開催予定記録は残したまま</strong>、現在の表示を「実施確認待ち」に切り替えます。実際の開催状況は公式情報での確認が必要です。</p>
 <details id="ca41-review-details"><summary>実施確認待ちの記録を表示</summary><ol id="ca41-review-items"></ol><button type="button" id="ca41-review-more" class="btn btn-ghost" hidden>さらに表示</button></details>
 <p class="ca41-history-help">備考の「○年○月○日時点」は当時の確認履歴です。日付が進んでも履歴自体は削除せず、現在の表示状態と区別しています。</p>`;
 const head=browse.querySelector('.section-head');if(head)head.insertAdjacentElement('afterend',section);else browse.prepend(section);
 $('ca41-review-more').addEventListener('click',()=>{reviewLimit+=15;showReview();});
}
function refresh(){patchResult();patchDay();patchMonthly();patchRelated();}
for(const id of ['results','day-events','ca40-items','ca39-dialog-items']){
 const el=$(id);if(el)new MutationObserver(refresh).observe(el,{childList:true,subtree:true});
}
const oldToday=todayISO();let lastToday=oldToday;
function refreshDay(){const now=todayISO();if(now!==lastToday){lastToday=now;reviewLimit=15;showReview();refresh();}}
// Active tabs can cross midnight in Japan without requiring re-publishing or editing events.
setInterval(refreshDay,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshDay();});
showReview();refresh();
window.CA41View={state,historicalNote,todayISO};
})();
