/* Ver.3.3.7 — 索引からの移動・復元。記録データには触れない。 */
(()=>{'use strict';
const names={'ca320-index':'ライブ索引','ca330-index':'音楽・映像作品索引','ca40-monthly':'7日間・10日間の記録一覧','ca42-upcoming':'これからの公演・放送・イベント','day-events':'ON THIS DAY（この日の出来事一覧）','browse':'出来事を探す（検索結果）'}, prefix='ca-index-return-v337:';
const valid=id=>Object.prototype.hasOwnProperty.call(names,id), tokenOK=t=>typeof t==='string'&&/^[a-zA-Z0-9-]{8,100}$/.test(t);
const read=t=>{if(!tokenOK(t))return null;try{return JSON.parse(sessionStorage.getItem(prefix+t)||'null')}catch(_){return null}};
const token=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function save(t,obj){try{sessionStorage.setItem(prefix+t,JSON.stringify(obj));const keys=Object.keys(sessionStorage).filter(k=>k.startsWith(prefix));if(keys.length>40){keys.map(k=>[k,read(k.slice(prefix.length))?.time||0]).sort((a,b)=>a[1]-b[1]).slice(0,keys.length-40).forEach(([k])=>sessionStorage.removeItem(k))}}catch(_){}}
function link(a, id, snapshot){if(!valid(id))return;const t=token(),u=new URL(a.href,location.href);u.searchParams.set('ca_from',id);u.searchParams.set('ca_ix',t);a.href=u.href;
 const remember=()=>{const source=new URL(location.href);source.searchParams.delete('ca_ix');source.searchParams.delete('ca_from');source.searchParams.delete('event');save(t,{id,source:source.href,state:snapshot(),scroll:window.scrollY,innerScroll:id==='day-events'?document.getElementById(id)?.scrollTop:0,record:u.searchParams.get('event'),anchorTop:a.getBoundingClientRect().top,time:Date.now()});source.searchParams.set('ca_ix',t);source.hash=id;try{history.replaceState(history.state,'',source.href)}catch(_){}};
 for(const type of ['click','auxclick','contextmenu'])a.addEventListener(type,remember);
}
function get(id){const p=new URLSearchParams(location.search);if(p.has('event'))return null;const s=read(p.get('ca_ix'));return s?.id===id&&s.state&&typeof s.state==='object'?s:null;}
function finish(s){if(!s||!Number.isFinite(s.scroll))return;const go=()=>{const section=document.getElementById(s.id);const button=section?.querySelector(':scope > .ca231-fold-head > .ca231-fold-toggle');if(button?.getAttribute('aria-expanded')==='false')button.click();requestAnimationFrame(()=>requestAnimationFrame(()=>{
 const inner=s.id==='day-events'?section:null;if(inner&&Number.isFinite(s.innerScroll))inner.scrollTop=Math.max(0,s.innerScroll);
 const target=section&&s.record?[...section.querySelectorAll('a[href]')].find(a=>{try{const u=new URL(a.href,location.href);return u.origin===location.origin&&u.pathname===location.pathname&&u.searchParams.get('event')===s.record&&a.getClientRects().length>0;}catch(_){return false;}}):null;
 if(target&&Number.isFinite(s.anchorTop)&&(s.id==='day-events'||s.id==='browse')){
   if(inner){const ar=target.getBoundingClientRect(),ir=inner.getBoundingClientRect();if(ar.top<ir.top||ar.bottom>ir.bottom)inner.scrollTop+=ar.top-ir.top-Math.min(80,inner.clientHeight/4);}
   const rect=target.getBoundingClientRect();const top=Math.max(12,Math.min(s.anchorTop,window.innerHeight-60));window.scrollTo({top:Math.max(0,window.scrollY+rect.top-top),behavior:'instant'});
 }else window.scrollTo({top:Math.max(0,s.scroll),behavior:'instant'});
}));};if(document.readyState==='complete')go();else window.addEventListener('load',go,{once:true});}
window.addEventListener('pageshow',e=>{if(!e.persisted)return;for(const id of Object.keys(names)){const s=get(id);if(s){finish(s);break;}}});
function returnLink(){const p=new URLSearchParams(location.search),id=p.get('ca_from'),t=p.get('ca_ix');if(!valid(id)||!p.has('event'))return null;const s=read(t);let u=new URL(location.href);u.search='';if(id==='day-events'&&/^\d{2}-\d{2}$/.test(p.get('date')||''))u.searchParams.set('date',p.get('date'));if(id==='browse')u.searchParams.set('sort','desc');if(s?.id===id&&typeof s.source==='string'){try{const src=new URL(s.source);if(src.origin===u.origin&&src.pathname===u.pathname){u=src;u.searchParams.delete('event');u.searchParams.delete('ca_from');u.searchParams.set('ca_ix',t);}}catch(_){}}u.hash=id;const a=document.createElement('a');a.className='ca-detail-back ca337-return';a.textContent='← '+names[id]+'に戻る';a.href=u.href;a.style.cssText='display:flex;align-items:center;width:fit-content;max-width:100%;margin:0 0 4px;';return a;}
// 既存の関連記録リンクにも移動元を引き継ぐ。外部リンク・共有ボタンは対象外。
document.addEventListener('click',e=>{const a=e.target.closest?.('#ca-single-detail a[href]');if(!a||a.classList.contains('ca337-return'))return;const p=new URLSearchParams(location.search),id=p.get('ca_from'),t=p.get('ca_ix');if(!valid(id))return;try{const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname===location.pathname&&u.searchParams.has('event')){u.searchParams.set('ca_from',id);if(tokenOK(t))u.searchParams.set('ca_ix',t);a.href=u.href}}catch(_){}},true);
window.CA_INDEX_RETURN={link,get,finish,returnLink};
})();
