/* Ver.3.7.4: 親ツアー・公演区分の索引。元データ変更なし。 */
(()=>{'use strict';
const text=x=>String(x??'').trim(), norm=x=>text(x).normalize('NFKC').toLocaleLowerCase('ja-JP');
const cmp=(a,b)=>a.localeCompare(b,'ja',{numeric:true});
const artistOrder=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
// 都道府県コード順。海外・その他の地域、未登録は国内の後ろへ。
const prefOrder='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split(' ');
const orderCmp=(order,missing)=>(a,b)=>{const rank=v=>v===missing?order.length+1:(order.indexOf(v)<0?order.length:order.indexOf(v));return rank(a)-rank(b)||cmp(a,b);};
const byArtist=orderCmp(artistOrder,'名義未設定');
const region=e=>text(e.venue)==='オンライン配信'?'オンライン配信':text(e.country)&&text(e.country)!=='日本'?text(e.country):text(e.prefecture)||'地域未登録';
const regionRank=v=>v==='地域未登録'?49:v==='オンライン配信'?48:prefOrder.includes(v)?prefOrder.indexOf(v):47;
const byPref=(a,b)=>regionRank(a)-regionRank(b)||cmp(a,b);
const rawTourKey=e=>JSON.stringify([text(e.artist)||'名義未設定',text(e.tourId)]);
const parentTours=Object.freeze({
  "[\"ASKA\",\"aska-who-2024-2025\"]": {
    "parent": "who-is-aska-2024-2025",
    "label": "ASKA CONCERT TOUR 2024≫2025 -Who is ASKA !?-",
    "section": "main"
  },
  "[\"ASKA\",\"aska-who-postponed\"]": {
    "parent": "who-is-aska-2024-2025",
    "label": "ASKA CONCERT TOUR 2024≫2025 -Who is ASKA !?-",
    "section": "reschedule"
  },
  "[\"ASKA\",\"aska-who-asia-2025\"]": {
    "parent": "who-is-aska-2024-2025",
    "label": "ASKA CONCERT TOUR 2024≫2025 -Who is ASKA !?-",
    "section": "overseas"
  },
  "[\"ASKA\",\"aska-who-additional-2025\"]": {
    "parent": "who-is-aska-2024-2025",
    "label": "ASKA CONCERT TOUR 2024≫2025 -Who is ASKA !?-",
    "section": "extra"
  },
  "[\"ASKA\",\"aska-higher-ground-2019-2020\"]": {
    "parent": "higher-ground-2019-2022",
    "label": "higher ground",
    "section": "reschedule"
  },
  "[\"ASKA\",\"aska-higher-encore-2021-2022\"]": {
    "parent": "higher-ground-2019-2022",
    "label": "higher ground",
    "section": "encore"
  },
  "[\"ASKA\",\"aska-made-in-2019\"]": {
    "parent": "made-in-aska-2018-2019",
    "label": "Made in ASKA",
    "section": "main"
  },
  "[\"ASKA\",\"aska-made-in-asia-2019\"]": {
    "parent": "made-in-aska-2018-2019",
    "label": "Made in ASKA",
    "section": "overseas"
  }
});
const sectionNames=Object.freeze({"main":"国内本編","reschedule":"延期・振替・再公演","overseas":"海外・アジア公演","extra":"追加公演","encore":"アンコール公演","other":"その他の関連公演"});
const parentFor=e=>parentTours[rawTourKey(e)];
const tourKey=e=>{const p=parentFor(e);return p?JSON.stringify([text(e.artist)||'名義未設定','parent:'+p.parent]):rawTourKey(e);};
const sectionFor=e=>parentFor(e)?.section||'other';
const statusSummary=records=>{const m=new Map();for(const e of records){const k=status(e);m.set(k,(m.get(k)||0)+1);}return ['実施済み','開催予定','延期','振替','中止','状態未設定',...m.keys()].filter((v,i,a)=>a.indexOf(v)===i&&m.has(v)).map(v=>v+' '+m.get(v)+'件').join(' ／ ');};
function tourStarts(events){const map=new Map();for(const e of events){const k=tourKey(e),d=text(e.date);if(text(e.tourId)&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&(!map.has(k)||d<map.get(k)))map.set(k,d);}return map;}

const byDate=(a,b)=>String(a.date).localeCompare(String(b.date))||cmp(text(a.id),text(b.id));
const live=events=>events.filter(e=>e&&e.category==='live'&&text(e.id));
const status=e=>({recorded:'実施済み',scheduled:'開催予定',postponed:'延期',cancelled:'中止',canceled:'中止',rescheduled:'振替',historical:'歴史的出来事',released:'発売済み'})[e.status]||'状態未設定';
function groups(events,mode,alias,starts=tourStarts(events)){
 const map=new Map();
 for(const e of events){
  const artist=text(e.artist)||'名義未設定', pref=region(e), venue=text(e.venue), tour=text(e.tourId);
  let key,label,sub='',names=[];
  if(mode==='tour'){key=tourKey(e);label=parentFor(e)?.label||(tour?'': 'ツアーID未登録・単発公演等');sub=artist;}
  else if(mode==='venue'){
   const g=venue&&pref!=='地域未登録'&&alias?alias(venue):null;
   key=JSON.stringify([pref,g?'alias:'+g.key:'name:'+venue]);label=g?g.label:venue||'会場未登録';sub=pref;names=g?g.names:[];
  }else{key=JSON.stringify([pref]);label=pref;}
  if(!map.has(key))map.set(key,{key,label,sub,names,records:[],titles:new Map()});
  const g=map.get(key);g.records.push(e);if(mode==='tour'&&parentFor(e))g.parent=true;const title=text(e.title);if(title)g.titles.set(title,(g.titles.get(title)||0)+1);
 }
 for(const g of map.values()){
  g.records.sort(byDate);if(!g.label)g.label=[...g.titles].sort((a,b)=>b[1]-a[1]||cmp(a[0],b[0]))[0]?.[0]||'公演名未登録';
  g.first=text(g.records[0].date).slice(0,4);g.last=text(g.records.at(-1).date).slice(0,4);
  g.startDate=starts.get(g.key)||text(g.records[0].date);g.noTour=mode==='tour'&&!JSON.parse(g.key)[1];
  g.search=norm([g.label,g.sub,...g.names,...(mode==='tour'?[...g.titles.keys(),...g.records.map(e=>e.tourId),...(g.parent?g.records.map(e=>sectionNames[sectionFor(e)]):[])]:mode==='venue'?g.records.map(e=>e.venue):[])].join(' '));
 }
 return [...map.values()].sort((a,b)=>mode==='tour'?(Number(a.noTour)-Number(b.noTour)||cmp(a.startDate,b.startDate)||byArtist(a.sub,b.sub)||cmp(a.label,b.label)||cmp(a.key,b.key)):mode==='venue'?(byPref(a.sub,b.sub)||Number(a.label==='会場未登録')-Number(b.label==='会場未登録')||cmp(a.label,b.label)):byPref(a.label,b.label));
}
const api={groups,live,byArtist,byPref,tourStarts,sectionFor,statusSummary,tourKey};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
const $=id=>document.getElementById(id);const mk=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!=null)n.textContent=value;return n;};
function boot(){
 const root=$('ca320-index'), events=window.CA_EVENT_DATA?.events;if(!root||!Array.isArray(events)||root.dataset.ready)return;root.dataset.ready='1';
 const all=live(events), details=$('ca320-details'), mode=$('ca320-mode'), artist=$('ca320-artist'), pref=$('ca320-pref'), q=$('ca320-query'), list=$('ca320-groups'), result=$('ca320-records'), message=$('ca320-count'), groupMore=$('ca320-group-more'), recordMore=$('ca320-record-more'), title=$('ca320-selected'), reset=$('ca320-reset');
 const addOptions=(el,values,compare)=>{for(const v of [...new Set(values)].sort(compare)){const o=mk('option','',v);o.value=v;el.append(o);}};
 addOptions(artist,all.map(e=>text(e.artist)||'名義未設定'),byArtist);addOptions(pref,all.map(e=>region(e)),byPref);
 const starts=tourStarts(all);
 let found=[],selected=null,glimit=30,rlimit=30,loaded=false,sectionMode=true;
 const info=mk('div','ca374-tour-info');info.hidden=true;title.insertAdjacentElement('afterend',info);
 const style=mk('style');style.textContent='.ca374-tour-info[hidden]{display:none!important}.ca374-tour-info{margin:10px 0 14px}.ca374-tour-controls{display:flex;flex-wrap:wrap;gap:8px;margin:9px 0}.ca374-tour-controls button[aria-pressed=true]{border-color:var(--gold-light,#f8e2ba);color:var(--gold-light,#f8e2ba);font-weight:700}.ca374-section{list-style:none;margin:10px 0;min-width:0}.ca374-section details{border:1px solid rgba(170,185,210,.26);border-radius:10px;padding:9px 12px}.ca374-section summary{cursor:pointer;padding:5px 0;overflow-wrap:anywhere;font-weight:700}.ca374-section ul{padding:0;margin:8px 0 0;list-style:none}.ca374-status{font-size:12px;color:var(--muted,#b3c0d2);line-height:1.65;overflow-wrap:anywhere}';document.head.append(style);
 function recordUrl(e){const u=new URL(location.href);u.search='';if(/^\d{4}-\d{2}-\d{2}$/.test(text(e.date)))u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',e.id);u.hash='browse';return u.href;}
 function makeRecord(e){const li=mk('li','ca320-record'),meta=mk('div','ca320-meta',[text(e.date),text(e.artist),status(e),selected?.parent?sectionNames[sectionFor(e)]:''].filter(Boolean).join(' ／ ')),link=mk('a','',text(e.title)||'公演名未登録');link.href=recordUrl(e);window.CA_INDEX_RETURN?.link(link,'ca320-index',()=>({mode:mode.value,artist:artist.value,pref:pref.value,q:q.value,selected:selected?.key,glimit,rlimit,sectionMode}));li.append(meta,link);const venue=[region(e)==='地域未登録'?'':region(e),text(e.venue)].filter((v,i,a)=>v&&a.indexOf(v)===i).join('・');if(venue)li.append(mk('p','',venue));return li;}
 function drawRecords(){result.replaceChildren();info.replaceChildren();info.hidden=true;title.textContent=selected?`${selected.label}（${selected.records.length}件）`:'';recordMore.hidden=true;if(!selected)return;
  if(selected.parent){info.hidden=false;info.append(mk('p','ca374-status',statusSummary(selected.records)+' ／ 記録件数（実施公演総数とは異なります）'));const controls=mk('div','ca374-tour-controls');for(const [value,label] of [[true,'公演区分別'],[false,'全記録を日付順']]){const b=mk('button','ca320-action',label);b.type='button';b.setAttribute('aria-pressed',String(sectionMode===value));b.addEventListener('click',()=>{sectionMode=value;rlimit=30;drawRecords();});controls.append(b);}info.append(controls);
   if(sectionMode){for(const [key,label] of Object.entries(sectionNames)){const records=selected.records.filter(e=>sectionFor(e)===key);if(!records.length)continue;const li=mk('li','ca374-section'),d=mk('details'),sum=mk('summary','',label+'（'+records.length+'件）'),ul=mk('ul');d.open=!window.matchMedia('(max-width:760px)').matches;d.append(sum,mk('div','ca374-status',statusSummary(records)),ul);for(const e of records)ul.append(makeRecord(e));li.append(d);result.append(li);}return;}
  }
  for(const e of selected.records.slice(0,rlimit))result.append(makeRecord(e));recordMore.hidden=selected.records.length<=rlimit;recordMore.textContent=`さらに公演を表示（残り${Math.max(0,selected.records.length-rlimit)}件）`;
 }
 function drawGroups(){list.replaceChildren();for(const g of found.slice(0,glimit)){const b=mk('button','ca320-group');b.type='button';b.setAttribute('aria-pressed',String(selected?.key===g.key));b.append(mk('strong','',g.label),mk('span','ca320-meta',[g.sub,g.first===g.last?g.first:g.first+'–'+g.last,g.records.length+'件'].filter(Boolean).join(' ／ ')));b.addEventListener('click',()=>{selected=g;rlimit=30;sectionMode=true;drawGroups();drawRecords();title.focus({preventScroll:true});title.scrollIntoView({block:'nearest'});});list.append(b);}groupMore.hidden=found.length<=glimit;groupMore.textContent=`さらに索引を表示（残り${Math.max(0,found.length-glimit)}件）`;}
 function refresh(){const filtered=all.filter(e=>(!artist.value||(text(e.artist)||'名義未設定')===artist.value)&&(!pref.value||(region(e))===pref.value));const terms=norm(q.value).split(/\s+/).filter(Boolean);found=groups(filtered,mode.value,window.CA_SEARCH_ALIASES?.venueGroup,starts).filter(g=>terms.every(t=>g.search.includes(t)));selected=null;glimit=rlimit=30;message.textContent=`索引 ${found.length}件 ／ 対象ライブ記録 ${found.reduce((n,g)=>n+g.records.length,0)}件`+(found.length?'':'（条件を変更してください）');drawGroups();drawRecords();loaded=true;}
 for(const el of [mode,artist,pref])el.addEventListener('change',refresh);q.addEventListener('input',refresh);reset.addEventListener('click',()=>{mode.value='tour';artist.value=pref.value=q.value='';refresh();});groupMore.addEventListener('click',()=>{glimit+=30;drawGroups();});recordMore.addEventListener('click',()=>{rlimit+=30;drawRecords();});details.addEventListener('toggle',()=>{if(details.open&&!loaded)refresh();});
 const reveal=()=>{if(location.hash==='#ca320-index'){details.open=true;if(!loaded)refresh();}};window.addEventListener('hashchange',reveal);document.addEventListener('click',e=>{if(e.target.closest('a[href="#ca320-index"]')){details.open=true;if(!loaded)refresh();}});if(details.open)refresh();reveal();
 const saved=window.CA_INDEX_RETURN?.get('ca320-index');if(saved){const s=saved.state;details.open=true;for(const [el,val] of [[mode,s.mode],[artist,s.artist],[pref,s.pref]])if([...el.options].some(o=>o.value===val))el.value=val;q.value=typeof s.q==='string'?s.q:'';refresh();const restored=parentTours[s.selected];let restoreKey=s.selected;if(restored){try{restoreKey=JSON.stringify([JSON.parse(s.selected)[0],'parent:'+restored.parent]);}catch(_){}}selected=found.find(g=>g.key===restoreKey)||null;sectionMode=s.sectionMode!==false;glimit=Math.max(30,Math.min(found.length,Number(s.glimit)||30));rlimit=Math.max(30,Math.min(selected?.records.length||0,Number(s.rlimit)||30));drawGroups();drawRecords();window.CA_INDEX_RETURN.finish(saved);}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
