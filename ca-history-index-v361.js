/* Ver.3.6.1 歴史・出来事索引。記録データは読み取り専用。 */
(()=>{'use strict';
const $=id=>document.getElementById(id),txt=v=>String(v??'').trim(),norm=v=>txt(v).normalize('NFKC').toLocaleLowerCase('ja-JP'),cmp=(a,b)=>a.localeCompare(b,'ja');
const cats={milestone:'歴史・出来事',amateur:'デビュー前・アマチュア活動'};
const artists=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
const colors={'CHAGE and ASKA':'ca','Chage':'chage','ASKA':'aska','MULTI MAX':'multi'};
const ver=e=>['primary','secondary'].includes(e.verification)?e.verification:'unknown';
const verLabel={primary:'一次資料確認',secondary:'二次資料確認',unknown:'未確認・未設定'};
const statusLabel={scheduled:'予定（実施未確認）',postponed:'延期',cancelled:'中止',recorded:'記録済み',historical:'歴史的出来事',released:'発売済み'};
const year=e=>/^\d{4}/.exec(txt(e.date))?.[0]||'';
const decade=e=>year(e)?year(e).slice(0,3)+'0年代':'';
function dateLabel(e){const s=txt(e.date);if(e.datePrecision==='year'||/^\d{4}$/.test(s))return (year(e)||s)+'年（月日未詳）';if(/^\d{4}-\d{2}$/.test(s))return s.slice(0,4)+'年'+Number(s.slice(5))+'月（日未詳）';if(/^\d{4}-\d{2}-\d{2}$/.test(s))return Number(s.slice(5,7))+'月'+Number(s.slice(8))+'日';return s||'日付未登録';}
const el=(tag,cls='',s='')=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=s;return n;};
function boot(){const root=$('ca360-index'),events=window.CA_EVENT_DATA?.events;if(!root||root.dataset.ready)return;const count=$('ca360-count');if(!Array.isArray(events)){count.textContent='記録データを読み込めませんでした。';return;}root.dataset.ready='1';
 const all=events.filter(e=>Object.hasOwn(cats,e.category));
 const details=$('ca360-details'),artist=$('ca360-artist'),category=$('ca360-category'),dec=$('ca360-decade'),verification=$('ca360-verification'),order=$('ca360-order'),q=$('ca360-query'),list=$('ca360-list'),more=$('ca360-more');
 const fields={artist,category,decade:dec,verification,order,q};
 const opts=(c,values)=>{for(const v of values){const o=el('option','',v);o.value=v;c.append(o);}};
 opts(artist,[...new Set(all.map(e=>txt(e.artist)||'名義未設定'))].sort((a,b)=>(artists.indexOf(a)<0?99:artists.indexOf(a))-(artists.indexOf(b)<0?99:artists.indexOf(b))||cmp(a,b)));
 opts(dec,[...new Set(all.map(decade).filter(Boolean))].sort());
 let found=[],limit=25,loaded=false;
 const snapshot=()=>({...Object.fromEntries(Object.entries(fields).map(([k,c])=>[k,c.value])),limit});
 function recordUrl(e){const u=new URL(location.href);u.search='';if(e.datePrecision!=='year'&&/^\d{4}-\d{2}-\d{2}$/.test(txt(e.date)))u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',String(e.id));u.hash='browse';return u.href;}
 function draw(){list.replaceChildren();if(!found.length)list.append(el('p','','該当する記録はありません。'));let last=null,group=null;for(const e of found.slice(0,limit)){const y=year(e)||'年未詳';if(y!==last){group=el('div','ca360-year-group');group.append(el('h3','ca360-year',y==='年未詳'?y:y+'年'));list.append(group);last=y;}const a=el('a','ca360-title',txt(e.title)||'タイトル未登録');a.href=recordUrl(e);window.CA_INDEX_RETURN?.link(a,'ca360-index',snapshot);const card=el('article','ca360-record ca360-'+(colors[e.artist]||'other'));card.append(el('span','ca360-date',dateLabel(e)));const body=el('div','ca360-record-body');body.append(el('span','ca360-artist',txt(e.artist)||'名義未設定'),a);const meta=[cats[e.category],statusLabel[e.status]||txt(e.status)||'状態未設定',verLabel[ver(e)]];body.append(el('div','ca360-meta',meta.join(' ／ ')));card.append(body);group.append(card);}more.hidden=found.length<=limit;more.textContent='さらに表示（残り'+Math.max(0,found.length-limit)+'件）';count.textContent='対象記録 '+found.length+'件 ／ '+Math.min(limit,found.length)+'件表示';}
 function refresh(){const terms=norm(q.value).split(/\s+/).filter(Boolean);found=all.filter(e=>{if(artist.value&&artist.value!==(txt(e.artist)||'名義未設定')||category.value&&category.value!==e.category||dec.value&&dec.value!==decade(e)||verification.value&&verification.value!==ver(e))return false;const hay=norm([e.title,e.artist,e.date,e.description,e.note,e.venue,e.prefecture,cats[e.category]].map(txt).join(' '));return terms.every(t=>hay.includes(t));});const direction=order.value==='desc'?-1:1;found.sort((a,b)=>direction*cmp(txt(a.date),txt(b.date))||cmp(txt(a.id),txt(b.id)));limit=25;draw();loaded=true;}
 function restore(){const saved=window.CA_INDEX_RETURN?.get('ca360-index');if(!saved)return false;const s=saved.state;for(const [k,c] of Object.entries(fields)){if(k==='q'){if(typeof s.q==='string')c.value=s.q;}else if([...c.options].some(o=>o.value===s[k]))c.value=s[k];}details.open=true;refresh();if(Number.isInteger(s.limit))limit=Math.max(25,Math.min(all.length,s.limit));draw();window.CA_INDEX_RETURN.finish(saved);return true;}
 for(const c of [artist,category,dec,verification,order])c.addEventListener('change',refresh);q.addEventListener('input',refresh);$('ca360-reset').addEventListener('click',()=>{artist.value=category.value=dec.value=verification.value=q.value='';order.value='asc';refresh();});more.addEventListener('click',()=>{limit+=25;draw();});details.addEventListener('toggle',()=>{if(details.open&&!loaded)refresh();});const reveal=()=>{if(location.hash==='#ca360-index'){details.open=true;if(!loaded)refresh();}};window.addEventListener('hashchange',reveal);document.addEventListener('click',e=>{if(e.target.closest?.('a[href="#ca360-index"]')){details.open=true;if(!loaded)refresh();}});if(!restore()){if(details.open)refresh();reveal();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();})();
