/* 今日はC&Aの何の日？ 画面 Ver.2.2.12 / 個別記録の確認経過表示
 * Display-only status overlay. Never modifies window.CA_EVENT_DATA or its events.
 * Read after app.js, ca-ver39.js, ca-ver40.js and data/review-followup.js.
 * 'closed_unverified' means follow-up completed WITHOUT proof of performance.
 */
(()=>{
'use strict';
const archive=window.CA_EVENT_DATA;
const events=Array.isArray(archive?.events)?archive.events:[];
if(!events.length)return;
const byId=new Map(events.map(e=>[String(e.id),e]));
const $=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const followups=window.CA_REVIEW_FOLLOWUP?.entries||{};
function todayISO(){
 const values=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
 return `${values.year}-${values.month}-${values.day}`;
}
function followUp(e){
 const entry=Object.prototype.hasOwnProperty.call(followups,String(e?.id))?followups[String(e.id)]:null;
 return entry?.disposition==='closed_unverified'?entry:null;
}
// CA243_DOCUMENTED_BROADCAST: display only; do not infer actual airing.
function isDocumentedBroadcast(e){
 if(e?.category!=='media'||!['primary','secondary'].includes(e.verification)||!Array.isArray(e.sources)||!e.sources.some(s=>s&&/^https?:\/\//i.test(String(s.url||''))))return false;
 const title=String(e.title||'').normalize('NFKC');
 const note=String(e.note||'').normalize('NFKC');
 // Do not close recording-only dates, streaming-only dates, or known changes.
 if(/公開収録|公開録音|収録日|収録予定|収録観覧|録音日|録音予定|収録参加|配信限定|配信開始|配信終了|アーカイブ配信|オンデマンド配信/.test(title)&&! /(?:再放送|リピート放送)/.test(title))return false;
 if(/放送(?:中止|延期|休止|取りやめ|日変更|日時変更|日未定)|番組(?:中止|休止|変更)|放送(?:が|は)(?:中止|延期|休止)/.test(title+' '+note))return false;
 const station=String(e.broadcastStation||'').trim();
 return Boolean(station)||/放送|テレビ|ラジオ|総集編|特別番組|Billboard Live Selection|(?:^|[^A-Za-z])(?:BS\s*\d+|BS10|BS-TBS|BS朝日|BSフジ|NHK|WOWOW|FM|AM|TV|CS|TBS|J-WAVE|NACK5)(?:[^A-Za-z]|$)/i.test(title);
}
function elapsedDays(date,reference){
 const valid=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return NaN;const n=Date.parse(s+'T00:00:00Z');return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s?n:NaN;};
 return (valid(reference)-valid(date))/86400000;
}
function state(e,reference=todayISO()){
 const raw=String(e?.status||'').toLowerCase().trim(),date=String(e?.date||'');
 if(raw.includes('cancel')||raw.includes('中止'))return {code:'cancelled',label:'中止'};
 if(raw.includes('postpon')||raw.includes('延期'))return {code:'postponed',label:'延期'};
 if(raw==='scheduled'||raw==='planned'||raw.includes('予定')){
  if(/^\d{4}-\d{2}-\d{2}$/.test(date)){
   if(date<reference){
    if(followUp(e))return {code:'review_closed',label:'事後確認終了（実施未確定）'};
    if(isDocumentedBroadcast(e)&&elapsedDays(date,reference)>=7)return {code:'broadcast_schedule',label:'放送日程確認済み'};
    return {code:'review',label:'開催日経過・実施確認待ち'};
   }
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
function styleBadge(b,view){
 if(!b)return;
 writeText(b,view.label);
 b.classList.toggle('ca41-needs-review',view.code==='review');
 b.classList.toggle('ca2211-followup-closed',view.code==='review_closed');
 b.classList.toggle('ca241-broadcast-schedule',view.code==='broadcast_schedule');
 b.title=view.code==='review'?'日付が経過したことのみ判定。開催実施を確認した意味ではありません。':view.code==='review_closed'?'確認作業を終了した区分であり、実際に開催されたことを確認したものではありません。':view.code==='broadcast_schedule'?'資料により放送日程を確認。放送予定日から7日経過したため追加確認待ちの対象外。実際の放送は未確定。':'';
}
function patchResult(){
 const root=$('results');if(!root)return;
 root.querySelectorAll('.result-card[data-id]').forEach(card=>{
  const e=byId.get(card.dataset.id);if(!e)return;
  const view=state(e);
  styleBadge(card.querySelector('.status-tag'),view);
  card.querySelectorAll('.ca39-record-details dl dt').forEach(dt=>{if(dt.textContent?.trim()==='状態')writeText(dt.nextElementSibling,view.label);});
  card.querySelectorAll('.record-note').forEach(fixNotes);
 });
}
function patchDay(){
 const root=$('day-events');if(!root)return;
 root.querySelectorAll('.ca39-day-card[data-event-id]').forEach(card=>{
  const e=byId.get(card.dataset.eventId);if(!e)return;
  styleBadge(card.querySelector('.ca39-day-flags span'),state(e));
  card.querySelectorAll('.ca39-day-note,.ca39-note p').forEach(fixNotes);
 });
 root.querySelectorAll('.event-preview').forEach(fixNotes);
}
function patchMonthly(){
 const root=$('ca40-items');if(!root)return;
 root.querySelectorAll('.ca40-item').forEach(card=>{
  const e=getEventFromLink(card);if(!e)return;
  styleBadge(card.querySelector('.ca40-flags span'),state(e));
 });
}
function patchRelated(){
 const root=$('ca39-dialog-items');if(!root)return;
 root.querySelectorAll('.ca39-modal-item').forEach(card=>{
  const e=getEventFromLink(card);if(!e)return;
  const small=card.querySelector('small');if(!small)return;
  const original=small.textContent||'';
  const view=state(e);
  if((String(e.status||'').toLowerCase().includes('sched')||String(e.status||'').toLowerCase().includes('planned')) && /^(開催予定|開催日経過・実施確認待ち|事後確認終了（実施未確定）|本日開催予定（実施未確認）|放送日程確認済み)/.test(original)){
   writeText(small,original.replace(/^(開催予定|開催日経過・実施確認待ち|事後確認終了（実施未確定）|本日開催予定（実施未確認）|放送日程確認済み)/,view.label));
  }
 });
}
function reviewRecords(){const now=todayISO();return events.filter(e=>state(e,now).code==='review').sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.id).localeCompare(String(b.id)));}
function closedRecords(){const now=todayISO();return events.filter(e=>state(e,now).code==='review_closed').sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.id).localeCompare(String(b.id)));}
function eventUrl(e){const u=new URL(location.href);u.search='';u.hash='browse';u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',e.id);return u.href;}
let reviewLimit=15;
function showReview(){
 const panel=$('ca41-review');if(!panel)return;
 const pending=reviewRecords(),closed=closedRecords(),now=todayISO();
 const broadcastCount=events.filter(e=>state(e,now).code==='broadcast_schedule').length;
 $('ca41-review-count').textContent=`確認待ち ${pending.length}件 ／ 事後確認終了 ${closed.length}件 ／ 放送日程確認済み ${broadcastCount}件`;
 const cards=pending.slice(0,reviewLimit).map(e=>`<li><a href="${esc(eventUrl(e))}"><time datetime="${esc(e.date)}">${esc(e.date)}</time>　${esc(e.artist)}｜${esc(e.title)}</a><span>${esc([e.prefecture,e.venue].filter(Boolean).join('・'))}</span></li>`).join('');
 $('ca41-review-items').innerHTML=cards||'<li class="ca41-no-review">現在、追加の実施確認が必要な「開催予定」の登録はありません。</li>';
 const more=$('ca41-review-more');more.hidden=pending.length<=reviewLimit;more.textContent=`さらに表示（残り${Math.max(0,pending.length-reviewLimit)}件）`;
 $('ca41-closed-count').textContent=`${closed.length}件`;
 $('ca41-closed-items').innerHTML=closed.map(e=>{
  const item=followUp(e);
  const sources=Array.isArray(e.sources)?e.sources:[];
  const links=sources.filter(s=>s&&/^https:\/\//.test(String(s.url||''))).map((s,i)=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">登録済み資料${sources.length>1?' '+(i+1):''}を開く ↗</a>`).join(' ／ ');
  return `<li><a href="${esc(eventUrl(e))}"><time datetime="${esc(e.date)}">${esc(e.date)}</time>　${esc(e.artist)}｜${esc(e.title)}</a><span>${esc([e.prefecture,e.venue].filter(Boolean).join('・'))}</span><span class="ca2211-closed-tag">事後確認終了（実施未確定） ／ 確認日：${esc(item.reviewedAt||'不明')}</span><span class="ca2211-closed-reason">${esc(item.reason||'開催実績の確認は行っていません。')}</span>${links?`<span class="ca2211-closed-sources">${links}</span>`:''}</li>`;
 }).join('')||'<li class="ca41-no-review">事後確認終了に分類された記録はありません。</li>';
 const label=document.querySelector('label:has(> #status-filter) > span');if(label)label.textContent='登録時の状態';
 const select=$('status-filter');if(select){const option=select.querySelector('option[value="scheduled"]');if(option)option.textContent='開催予定として登録（過去分含む）';}
}
const browse=$('browse');
if(browse&&!$('ca41-review')){
 const section=document.createElement('section');
 section.id='ca41-review';section.className='ca41-review';
 section.setAttribute('aria-label','開催実施の確認待ち');
 section.innerHTML=`<div class="ca41-review-head"><div><span class="kicker">SCHEDULE FOLLOW-UP</span><h3>開催日が過ぎた予定の確認</h3></div><strong id="ca41-review-count"></strong></div>
 <p>日付だけでは実施・延期・中止を判断できません。<strong>元の開催予定記録はそのまま維持</strong>し、「追加確認が必要」と「事後確認を終了（実施未確定）」を区別します。後者は、開催したことを意味しません。</p>
 <p class="ca241-broadcast-help">出典のあるテレビ・ラジオ放送（初回・総集編・特別番組・再放送など）は、放送予定日から7日経過すると「放送日程確認済み」として確認待ちから外します。実際の放送は未確定です。元の登録状態・資料・日付は維持します。登録された中止・延期・変更情報があるものや収録日などは個別確認します。</p>
 <details id="ca41-review-details"><summary>実施確認待ちの記録を表示</summary><ol id="ca41-review-items"></ol><button type="button" id="ca41-review-more" class="btn btn-ghost" hidden>さらに表示</button></details>
 <details id="ca41-closed-details" class="ca2211-review-closed"><summary>事後確認を終了した記録（実施未確定） <span id="ca41-closed-count"></span></summary><p>開催後の実施報告が通常出ないイベントなど、追加調査をいったん終了した記録です。開催告知の確認と実際の開催確認は異なります。新しい根拠が見つかれば分類を見直します。</p><ol id="ca41-closed-items"></ol></details>
 <p class="ca41-history-help">備考の「○年○月○日時点」は当時の確認履歴です。日付が進んでも履歴を削除せず、現在の表示状態と区別しています。</p>`;
 const head=browse.querySelector('.section-head');if(head)head.insertAdjacentElement('afterend',section);else browse.prepend(section);
 $('ca41-review-more').addEventListener('click',()=>{reviewLimit+=15;showReview();});
 const style=document.createElement('style');style.id='ca2211-closed-style';
 style.textContent=`
 .ca2211-review-closed{margin-top:12px!important}
 .ca2211-review-closed summary span{color:#b3c4d8;font-size:12px;margin-left:4px}
 .ca2211-closed-tag{color:#ffe4b4!important;font-weight:650}
 .ca2211-closed-reason{font-size:11px!important;line-height:1.65!important;color:#becfe2!important;margin-top:3px}
 .ca2211-closed-sources{margin-top:5px}
 .ca2211-closed-sources a{color:#dce7f4;text-decoration:underline;text-underline-offset:3px}
 .ca241-broadcast-schedule{color:#c3eadf!important;background:rgba(63,150,129,.14)!important;border-color:rgba(111,205,179,.55)!important}
 .ca241-broadcast-help{font-size:12px;line-height:1.8;color:#c7e4dc}
 .ca2211-followup-closed{color:#dce8f6!important;background:rgba(103,140,180,.13)!important;border-color:rgba(150,180,210,.4)!important}
 .ca2212-detail-verification{margin:18px 0 10px;padding:15px 17px;border:1px solid rgba(232,188,115,.36);border-left:3px solid #e8bc73;border-radius:8px;background:rgba(232,188,115,.055);color:#dce7f4;line-height:1.8}
 .ca2212-detail-verification h2{margin:0 0 4px;font-size:16px;color:#ffe3ae;line-height:1.6}
 .ca2212-detail-verification .ca2212-status-heading{margin:0 0 10px;font-size:13px;font-weight:700;color:#ffe1aa}
 .ca2212-detail-verification dl{display:grid;grid-template-columns:minmax(115px,145px) minmax(0,1fr);gap:7px 12px;margin:0;font-size:12px}
 .ca2212-detail-verification dt{color:#b6c7dc;font-weight:600}
 .ca2212-detail-verification dd{margin:0;color:#e3ebf7;overflow-wrap:anywhere;white-space:pre-wrap}
 .ca2212-detail-verification .ca2212-verification-explain{font-size:11px;color:#bacbdc;margin:11px 0 0}
 @media(max-width:560px){.ca2212-detail-verification{padding:12px}.ca2212-detail-verification dl{grid-template-columns:1fr;gap:2px}.ca2212-detail-verification dd{margin:0 0 8px}}
 `;
 document.head.append(style);
}
function patchIndividualDetail(){
 const eventId=new URLSearchParams(location.search).get('event');
 const e=byId.get(eventId),section=$('ca-single-detail');
 if(!e||!section)return;
 const paper=section.querySelector('.ca-detail-paper');
 if(!paper)return; // 詳細ページが組み上がるまでは表示しない
 const view=state(e);
 const previous=paper.querySelector('.ca2212-detail-verification');
 if(!['review','review_closed','broadcast_schedule'].includes(view.code)){if(previous)previous.remove();return;}
 if(previous?.dataset.ca241State===view.code)return;
 // 旧Ver.2.2.11の簡易文言があれば置換し、なければ記録名の下に表示。
 const old=paper.querySelector('.ca2211-detail-note');
 const panel=document.createElement('section');
 panel.className='ca2211-detail-note ca2212-detail-verification';
 panel.dataset.ca241State=view.code;
 panel.setAttribute('aria-label','開催後の実施確認状況');
 const heading=document.createElement('h2');
 heading.textContent=e.category==='media'?'放送後の確認状況':'開催後の確認状況';
 panel.append(heading);
 const summary=document.createElement('p');
 summary.className='ca2212-status-heading';
 summary.textContent=view.label;
 panel.append(summary);
 const dl=document.createElement('dl');
 const add=(label,value)=>{
  const dt=document.createElement('dt');dt.textContent=label;
  const dd=document.createElement('dd');dd.textContent=value;
  dl.append(dt,dd);
 };
 add('元の登録状態',e.category==='media'?'放送予定（元データは変更していません）':'開催予定（公演データは変更していません）');
 add(e.category==='media'?'実際の放送':'実際の開催','実施未確定');
 const follow=view.code==='review_closed'?followUp(e):null;
 if(follow){
  add('確認作業','事後確認終了（追加調査をいったん終了）');
  add('確認日',String(follow.reviewedAt||'未設定'));
  add('終了理由',String(follow.reason||'理由の記録なし'));
 }else if(view.code==='broadcast_schedule'){
  add('確認作業','放送日程確認済み（7日経過により追加確認待ちの対象外）');
 }else{
  add('確認作業','追加の実施確認が必要');
 }
 const v=e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'未確認・未設定';
 add('資料の照合区分',v+'（実際の開催・放送を確認したこととは異なります）');
 panel.append(dl);
 const explanation=document.createElement('p');
 explanation.className='ca2212-verification-explain';
 explanation.textContent=view.code==='broadcast_schedule'?'番組表・出演告知などで放送日程を確認しています。実際の放送実績は未確定です。変更・中止などの新しい情報が見つかれば見直します。':follow
  ? '事後確認の終了は、開催済み・中止・延期を確定した意味ではありません。新しい資料が見つかれば見直します。'
  : '日付の経過だけでは開催済みと判断できません。公式発表や主催者の記録などを確認してから更新します。';
 panel.append(explanation);
 if(old){old.replaceWith(panel);}
 else{
  const after=paper.querySelector('.ca-detail-place')||paper.querySelector('.ca-detail-chips')||paper.querySelector('.ca-detail-title');
  if(after)after.insertAdjacentElement('afterend',panel);
  else paper.prepend(panel);
 }
}
function refresh(){patchResult();patchDay();patchMonthly();patchRelated();patchIndividualDetail();}
for(const id of ['results','day-events','ca40-items','ca39-dialog-items']){
 const el=$(id);if(el)new MutationObserver(refresh).observe(el,{childList:true,subtree:true});
}
// 個別記録は後続のDOMContentLoaded処理でmainへ追加されるため、
// mainの直下に詳細セクションが挿入される時点も監視する。
// 詳細パネル内の変更は監視対象外なので自己再描画ループを起こさない。
const main=document.querySelector('main');
if(main)new MutationObserver(patchIndividualDetail).observe(main,{childList:true});
const oldToday=todayISO();let lastToday=oldToday;
function refreshDay(){const now=todayISO();if(now!==lastToday){lastToday=now;reviewLimit=15;showReview();refresh();}}
setInterval(refreshDay,60000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){refreshDay();patchIndividualDetail();}});
showReview();refresh();
document.addEventListener('DOMContentLoaded',patchIndividualDetail,{once:true});
window.CA41View={state,historicalNote,todayISO,followUp,reviewRecords,closedRecords};
})();
