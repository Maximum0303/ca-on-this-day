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
// CA245: compact follow-up previews and separate paginated dialog; read-only.
const CA245_PAGE=20,CA245_PREVIEW=5;
const ca245Names={review:'実施確認待ちの記録',review_closed:'事後確認を終了した記録（実施未確定）',broadcast_schedule:'放送日程確認済みの記録'};
function ca245Records(kind){const now=todayISO();return events.filter(e=>state(e,now).code===kind).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.id).localeCompare(String(b.id)));}
function ca245Sources(e){return (Array.isArray(e.sources)?e.sources:[]).filter(s=>s&&/^https?:\/\//i.test(String(s.url||''))).map((s,i)=>`<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">資料${i+1} ↗</a>`).join(' ／ ');}
const ca245Colors={'CHAGE and ASKA':'#e9b261','Chage':'#65deac','ASKA':'#e3a6ff','MULTI MAX':'#f991bc'};
function ca245Card(e,kind,full=false){const item=kind==='review_closed'?followUp(e):null,links=ca245Sources(e),color=ca245Colors[e.artist]||'#aabbd0';return `<li class="ca245-record" style="border-left:3px solid ${color}"><a href="${esc(eventUrl(e))}"><time datetime="${esc(e.date)}">${esc(e.date)}</time>　${esc(e.title||'タイトル未設定')}</a><span class="ca245-artist ca-artist-tag" style="color:${color}">${esc(e.artist||'名義未設定')}</span>${[e.prefecture,e.venue,e.broadcastStation].filter(Boolean).length?`<span>${esc([e.prefecture,e.venue,e.broadcastStation].filter(Boolean).join('・'))}</span>`:''}${item?`<span class="ca2211-closed-tag">事後確認終了（実施未確定） ／ 確認日：${esc(item.reviewedAt||'不明')}</span>${full?`<span class="ca2211-closed-reason">${esc(item.reason||'開催実績の確認は行っていません。')}</span>`:''}`:''}${kind==='broadcast_schedule'?'<span class="ca245-broadcast-label">放送日程確認済み（実施未確定）</span>':''}${links?`<span class="ca245-links">${links}</span>`:''}</li>`;}
function ca245Filter(rows,filters){const norm=x=>String(x||'').normalize('NFKC').toLocaleLowerCase('ja');const words=norm(filters.q).trim().split(/\s+/).filter(Boolean);return rows.filter(e=>(filters.year==='all'||String(e.date).slice(0,4)===filters.year)&&(filters.month==='all'||String(e.date).slice(5,7)===filters.month)&&(filters.artist==='all'||String(e.artist||'')===filters.artist)&&words.every(w=>norm([e.title,e.artist,e.broadcastStation,e.venue].filter(Boolean).join(' ')).includes(w))).sort((a,b)=>(filters.sort==='asc'?String(a.date).localeCompare(String(b.date)):String(b.date).localeCompare(String(a.date)))||String(a.id).localeCompare(String(b.id)));}
let ca245Kind='broadcast_schedule',ca245Page=1,ca245Opener=null;
function ca245Dialog(){let dlg=$('ca245-dialog');if(dlg)return dlg;dlg=document.createElement('dialog');dlg.id='ca245-dialog';dlg.setAttribute('aria-labelledby','ca245-title');dlg.innerHTML=`<div class="ca245-head"><h2 id="ca245-title"></h2><button type="button" id="ca245-close" aria-label="閉じる">閉じる ×</button></div><p id="ca245-description"></p><div class="ca245-filters"><label>年<select id="ca245-year"></select></label><label>月<select id="ca245-month"></select></label><label>名義<select id="ca245-artist"></select></label><label>並び順<select id="ca245-sort"><option value="desc">新しい順</option><option value="asc">古い順</option></select></label><label class="ca245-query">番組名・記録名で検索<input type="search" id="ca245-query" placeholder="番組名など"></label><button type="button" id="ca245-reset">条件をクリア</button></div><p id="ca245-count" role="status" aria-live="polite"></p><ol id="ca245-list"></ol><div class="ca245-pager"><button type="button" id="ca245-prev">← 前のページ</button><span id="ca245-page"></span><button type="button" id="ca245-next">次のページ →</button></div>`;document.body.append(dlg);
 for(const id of ['ca245-year','ca245-month','ca245-artist','ca245-sort'])$(id).addEventListener('change',()=>{ca245Page=1;ca245Render();});$('ca245-query').addEventListener('input',()=>{ca245Page=1;ca245Render();});$('ca245-reset').addEventListener('click',()=>{ca245Reset();ca245Render();});$('ca245-prev').addEventListener('click',()=>{ca245Page--;ca245Render(true);});$('ca245-next').addEventListener('click',()=>{ca245Page++;ca245Render(true);});$('ca245-close').addEventListener('click',()=>dlg.close());dlg.addEventListener('close',()=>ca245Opener?.focus({preventScroll:true}));return dlg;}
function ca245Reset(){for(const id of ['ca245-year','ca245-month','ca245-artist'])$(id).value='all';$('ca245-sort').value='desc';$('ca245-query').value='';ca245Page=1;}
function ca245Options(id,values,label){const s=$(id);s.replaceChildren(new Option('すべて','all'));for(const v of values)s.add(new Option(label(v),v));}
function ca245Open(kind,opener){const dlg=ca245Dialog(),rows=ca245Records(kind);ca245Kind=kind;ca245Opener=opener; $('ca245-title').textContent=ca245Names[kind];$('ca245-description').textContent=kind==='broadcast_schedule'?'放送日程の確認を終えた記録です。実際の放送実績を確定したものではありません。':kind==='review_closed'?'追加調査をいったん終了した記録です。開催済みとは限りません。':'開催・放送の実施を引き続き確認する記録です。';ca245Options('ca245-year',[...new Set(rows.map(e=>String(e.date).slice(0,4)))].sort().reverse(),x=>x+'年');ca245Options('ca245-month',Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')),x=>Number(x)+'月');ca245Options('ca245-artist',[...new Set(rows.map(e=>String(e.artist||'')).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ja')),x=>x);ca245Reset();ca245Render();dlg.showModal();$('ca245-close').focus();}
function ca245Render(scroll=false){const dlg=$('ca245-dialog');if(!dlg)return;const rows=ca245Records(ca245Kind),filters={year:$('ca245-year').value,month:$('ca245-month').value,artist:$('ca245-artist').value,sort:$('ca245-sort').value,q:$('ca245-query').value},matched=ca245Filter(rows,filters),pages=Math.max(1,Math.ceil(matched.length/CA245_PAGE));ca245Page=Math.max(1,Math.min(pages,ca245Page));const start=(ca245Page-1)*CA245_PAGE,visible=matched.slice(start,start+CA245_PAGE);$('ca245-count').textContent=`全${rows.length}件 ／ 条件一致 ${matched.length}件${visible.length?' ／ '+(start+1)+'〜'+(start+visible.length)+'件を表示':''}`;$('ca245-list').innerHTML=visible.length?visible.map(e=>ca245Card(e,ca245Kind,true)).join(''):'<li>条件に一致する記録はありません。</li>';$('ca245-page').textContent=`${ca245Page} / ${pages} ページ`;$('ca245-prev').disabled=ca245Page<=1;$('ca245-next').disabled=ca245Page>=pages;if(scroll)$('ca245-count').scrollIntoView({block:'start',behavior:'auto'});}
function ca245Preview(kind,rows,listId,buttonId,countId){const list=$(listId),button=$(buttonId);if(!list||!button)return;list.innerHTML=rows.length?rows.slice(0,CA245_PREVIEW).map(e=>ca245Card(e,kind)).join(''):'<li class="ca41-no-review">該当する記録はありません。</li>';if(countId&&$(countId))$(countId).textContent=rows.length+'件';button.hidden=rows.length<=CA245_PREVIEW;button.textContent='全'+rows.length+'件を見る ↗';button.onclick=()=>ca245Open(kind,button);}
let reviewLimit=15;
function showReview(){
 if(!$('ca41-review'))return;
 const pending=ca245Records('review'),closed=ca245Records('review_closed'),broadcast=ca245Records('broadcast_schedule');
 $('ca41-review-count').textContent=`確認待ち ${pending.length}件 ／ 事後確認終了 ${closed.length}件 ／ 放送日程確認済み ${broadcast.length}件`;
 ca245Preview('review',pending,'ca41-review-items','ca41-review-more','ca245-pending-count');
 ca245Preview('review_closed',closed,'ca41-closed-items','ca245-closed-more','ca41-closed-count');
 ca245Preview('broadcast_schedule',broadcast,'ca245-broadcast-items','ca245-broadcast-more','ca245-broadcast-count');
 const label=document.querySelector('label:has(> #status-filter) > span');if(label)label.textContent='登録時の状態';
 const select=$('status-filter');if(select){const option=select.querySelector('option[value="scheduled"]');if(option)option.textContent='開催予定として登録（過去分含む）';}
 if($('ca245-dialog')?.open)ca245Render();
}
const browse=$('browse');
if(browse&&!$('ca41-review')){
 const section=document.createElement('section');
 section.id='ca41-review';section.className='ca41-review';
 section.setAttribute('aria-label','開催実施の確認待ち');
 section.innerHTML=`<div class="ca41-review-head"><div><span class="kicker">SCHEDULE FOLLOW-UP</span><h3>開催日が過ぎた予定の確認</h3></div><strong id="ca41-review-count"></strong></div>
 <p>日付だけでは実施・延期・中止を判断できません。<strong>元の開催予定記録はそのまま維持</strong>し、「追加確認が必要」と「事後確認を終了（実施未確定）」を区別します。後者は、開催したことを意味しません。</p>
 <p class="ca241-broadcast-help">出典のあるテレビ・ラジオ放送（初回・総集編・特別番組・再放送など）は、放送予定日から7日経過すると「放送日程確認済み」として確認待ちから外します。実際の放送は未確定です。元の登録状態・資料・日付は維持します。登録された中止・延期・変更情報があるものや収録日などは個別確認します。</p>
 <details id="ca41-review-details"><summary>実施確認待ちの記録を表示 <span id="ca245-pending-count"></span></summary><p class="ca245-preview-note">最新5件まで表示します。</p><ol id="ca41-review-items"></ol><button type="button" id="ca41-review-more" class="btn btn-ghost" hidden>さらに表示</button></details>
 <details id="ca41-closed-details" class="ca2211-review-closed"><summary>事後確認を終了した記録（実施未確定） <span id="ca41-closed-count"></span></summary><p>開催後の実施報告が通常出ないイベントなど、追加調査をいったん終了した記録です。開催告知の確認と実際の開催確認は異なります。新しい根拠が見つかれば分類を見直します。</p><p class="ca245-preview-note">最新5件まで表示します。</p><ol id="ca41-closed-items"></ol><button type="button" id="ca245-closed-more" class="btn btn-ghost" hidden>全件を見る</button></details>
 <details id="ca245-broadcast-details"><summary>放送日程確認済みの記録 <span id="ca245-broadcast-count"></span></summary><p>放送日程の確認を終えた番組です。実際の放送実績を確定したものではありません。</p><p class="ca245-preview-note">最新5件まで表示します。</p><ol id="ca245-broadcast-items"></ol><button type="button" id="ca245-broadcast-more" class="btn btn-ghost" hidden>全件を見る</button></details>
 <p class="ca41-history-help">備考の「○年○月○日時点」は当時の確認履歴です。日付が進んでも履歴を削除せず、現在の表示状態と区別しています。</p>`;
 const head=browse.querySelector('.section-head');if(head)head.insertAdjacentElement('afterend',section);else browse.prepend(section);
 // CA245: preview buttons open the paginated dialog.
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
