/* Ver.3.2.0: 登録済みライブの索引。データを変更しない。 */
(()=>{'use strict';
const text=x=>String(x??'').trim(), norm=x=>text(x).normalize('NFKC').toLocaleLowerCase('ja-JP');
const cmp=(a,b)=>a.localeCompare(b,'ja',{numeric:true});
const byDate=(a,b)=>String(a.date).localeCompare(String(b.date))||cmp(text(a.id),text(b.id));
const live=events=>events.filter(e=>e&&e.category==='live'&&text(e.id));
const status=e=>({recorded:'実施済み',scheduled:'開催予定',postponed:'延期',cancelled:'中止',canceled:'中止',rescheduled:'振替',historical:'歴史的出来事',released:'発売済み'})[e.status]||'状態未設定';
function groups(events,mode,alias){
 const map=new Map();
 for(const e of events){
  const artist=text(e.artist)||'名義未設定', pref=text(e.prefecture)||'地域未登録', venue=text(e.venue), tour=text(e.tourId);
  let key,label,sub='',names=[];
  if(mode==='tour'){key=JSON.stringify([artist,tour]);label=tour?'': 'ツアーID未登録・単発公演等';sub=artist;}
  else if(mode==='venue'){
   const g=venue&&pref!=='地域未登録'&&alias?alias(venue):null;
   key=JSON.stringify([pref,g?'alias:'+g.key:'name:'+venue]);label=g?g.label:venue||'会場未登録';sub=pref;names=g?g.names:[];
  }else{key=JSON.stringify([pref]);label=pref;}
  if(!map.has(key))map.set(key,{key,label,sub,names,records:[],titles:new Map()});
  const g=map.get(key);g.records.push(e);const title=text(e.title);if(title)g.titles.set(title,(g.titles.get(title)||0)+1);
 }
 for(const g of map.values()){
  g.records.sort(byDate);if(!g.label)g.label=[...g.titles].sort((a,b)=>b[1]-a[1]||cmp(a[0],b[0]))[0]?.[0]||'公演名未登録';
  g.first=text(g.records[0].date).slice(0,4);g.last=text(g.records.at(-1).date).slice(0,4);
  g.search=norm([g.label,g.sub,...g.names,...(mode==='tour'?[...g.titles.keys(),...g.records.map(e=>e.tourId)]:mode==='venue'?g.records.map(e=>e.venue):[])].join(' '));
 }
 return [...map.values()].sort((a,b)=>mode==='tour'?(cmp(a.first,b.first)||cmp(a.label,b.label)||cmp(a.sub,b.sub)):cmp(a.sub,b.sub)||cmp(a.label,b.label));
}
const api={groups,live};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
const $=id=>document.getElementById(id);const mk=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=value;return n;};
function boot(){
 const root=$('ca320-index'), events=window.CA_EVENT_DATA?.events;if(!root||!Array.isArray(events)||root.dataset.ready)return;root.dataset.ready='1';
 const all=live(events), details=$('ca320-details'), mode=$('ca320-mode'), artist=$('ca320-artist'), pref=$('ca320-pref'), q=$('ca320-query'), list=$('ca320-groups'), result=$('ca320-records'), message=$('ca320-count'), groupMore=$('ca320-group-more'), recordMore=$('ca320-record-more'), title=$('ca320-selected'), reset=$('ca320-reset');
 const addOptions=(el,values)=>{for(const v of [...new Set(values)].sort(cmp)){const o=mk('option','',v);o.value=v;el.append(o);}};
 addOptions(artist,all.map(e=>text(e.artist)||'名義未設定'));addOptions(pref,all.map(e=>text(e.prefecture)||'地域未登録'));
 let found=[],selected=null,glimit=30,rlimit=30,loaded=false;
 function recordUrl(e){const u=new URL(location.href);u.search='';if(/^\d{4}-\d{2}-\d{2}$/.test(text(e.date)))u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',e.id);u.hash='browse';return u.href;}
 function drawRecords(){result.replaceChildren();title.textContent=selected?`${selected.label}（${selected.records.length}件）`:'';recordMore.hidden=!selected||selected.records.length<=rlimit;if(!selected)return;
  for(const e of selected.records.slice(0,rlimit)){const li=mk('li','ca320-record'),meta=mk('div','ca320-meta',[text(e.date),text(e.artist),status(e)].filter(Boolean).join(' ／ ')),link=mk('a','',text(e.title)||'公演名未登録');link.href=recordUrl(e);li.append(meta,link);const venue=[text(e.prefecture),text(e.venue)].filter(Boolean).join('・');if(venue)li.append(mk('p','',venue));result.append(li);}
  recordMore.textContent=`さらに公演を表示（残り${Math.max(0,selected.records.length-rlimit)}件）`;
 }
 function drawGroups(){list.replaceChildren();for(const g of found.slice(0,glimit)){const b=mk('button','ca320-group');b.type='button';b.setAttribute('aria-pressed',String(selected?.key===g.key));b.append(mk('strong','',g.label),mk('span','ca320-meta',[g.sub,g.first===g.last?g.first:g.first+'–'+g.last,g.records.length+'件'].filter(Boolean).join(' ／ ')));b.addEventListener('click',()=>{selected=g;rlimit=30;drawGroups();drawRecords();title.focus({preventScroll:true});title.scrollIntoView({block:'nearest'});});list.append(b);}groupMore.hidden=found.length<=glimit;groupMore.textContent=`さらに索引を表示（残り${Math.max(0,found.length-glimit)}件）`;}
 function refresh(){const filtered=all.filter(e=>(!artist.value||(text(e.artist)||'名義未設定')===artist.value)&&(!pref.value||(text(e.prefecture)||'地域未登録')===pref.value));const terms=norm(q.value).split(/\s+/).filter(Boolean);found=groups(filtered,mode.value,window.CA_SEARCH_ALIASES?.venueGroup).filter(g=>terms.every(t=>g.search.includes(t)));selected=null;glimit=rlimit=30;message.textContent=`索引 ${found.length}件 ／ 対象ライブ記録 ${found.reduce((n,g)=>n+g.records.length,0)}件`+(found.length?'':'（条件を変更してください）');drawGroups();drawRecords();loaded=true;}
 for(const el of [mode,artist,pref])el.addEventListener('change',refresh);q.addEventListener('input',refresh);reset.addEventListener('click',()=>{mode.value='tour';artist.value=pref.value=q.value='';refresh();});groupMore.addEventListener('click',()=>{glimit+=30;drawGroups();});recordMore.addEventListener('click',()=>{rlimit+=30;drawRecords();});details.addEventListener('toggle',()=>{if(details.open&&!loaded)refresh();});
 const reveal=()=>{if(location.hash==='#ca320-index'){details.open=true;if(!loaded)refresh();}};window.addEventListener('hashchange',reveal);document.addEventListener('click',e=>{if(e.target.closest('a[href="#ca320-index"]')){details.open=true;if(!loaded)refresh();}});if(details.open)refresh();reveal();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
