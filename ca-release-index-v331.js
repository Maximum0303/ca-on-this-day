/* Ver.3.3.1 — 音楽・映像作品索引。登録済みの記録を参照するだけ。 */
(()=>{'use strict';
const text=x=>typeof x==='string'||typeof x==='number'?String(x).trim():'';
const norm=x=>text(x).normalize('NFKC').trim();
const searchNorm=x=>norm(x).toLocaleLowerCase('ja-JP');
const cmp=(a,b)=>a.localeCompare(b,'ja',{numeric:true});
const artists=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
const artist=e=>text(e.artist)||'名義未設定';
const byArtist=(a,b)=>{const rank=v=>artists.includes(v)?artists.indexOf(v):v==='名義未設定'?99:90;return rank(a)-rank(b)||cmp(a,b);};
const values=x=>Array.isArray(x)?x.flatMap(values):text(x)?[text(x)]:[];
const fieldValues=(e,keys)=>[...new Set(keys.flatMap(k=>values(e[k])))];
const format=e=>fieldValues(e,['format','formats','mediaFormat','releaseFormat','media']);
const kind=e=>fieldValues(e,['releaseType','releaseKind']);
// 索引用のみの分類。原文のフィールドは変更しない。
const KIND_ORDER=['初発売','再発売','リマスター・リミックス','配信','限定・特別仕様','その他','未登録'];
const FORMAT_ORDER=['CD','レコード','カセット','DVD','Blu-ray','VHS','LD','配信','その他','未登録'];
const canon=x=>searchNorm(x).replace(/[‐‑‒–—―−]/g,'-').replace(/\s+/g,' ');
const kinds=[
 ['初発売',/初発売|初出|初リリース|初回発売|新譜|新発売|オリジナル(?:版|盤)?発売|オリジナルリリース|^オリジナル(?:版|盤)?$|^発売$|^通常発売$|^original(?: release)?$|^first release$/],
 ['再発売',/再発売|再発|復刻|再リリース|再プレス|再販|再販売|再刊|re[ -]?issue|re[ -]?release|repress/],
 ['リマスター・リミックス',/リマスタ|リミックス|再ミックス|remaster|remix/],
 ['配信',/配信|ダウンロード|ストリーミング|digital|streaming|download/],
 ['限定・特別仕様',/限定|特別(?:盤|版|仕様|発売)|記念(?:盤|版|発売|仕様)|初回(?:盤|版|仕様|生産)|豪華(?:盤|版|仕様)|特典(?:付|付き)|limited|deluxe|anniversary|special edition/]
];
// 「再配信」は配信に分類する。限定盤は初発売とは限らない。
const formats=[
 ['CD',/(?:^|[^a-z])(?:(?:shm|uhq|hq|bluspec2?|blu-spec2?|hybrid|gold)?[- ]?cd(?:[- ]?(?:r|rw|extra|rom))?|sacd|compact disc)(?![a-z])|cd盤|コンパクトディスク|スーパーオーディオcd|高音質cd/],
 ['レコード',/(?:^|[^a-z])(?:lp|ep|vinyl|analog(?:ue)?)(?![a-z])|アナログ|レコード|[0-9]+\s*インチ|[0-9]+\s*inch|[0-9]+\s*["″]/],
 ['カセット',/(?:^|[^a-z])(?:ct|mc|cassette)(?![a-z])|カセット|ミュージックテープ/],
 ['DVD',/(?:^|[^a-z])(?:dvd(?:[- ]?(?:video|audio|r|rw))?)(?![a-z])/],
 ['Blu-ray',/(?:^|[^a-z])(?:blu[ -]?ray|bd(?:[- ]?(?:r|re))?)(?![a-z])|ブルーレイ/],
 ['VHS',/(?:^|[^a-z])vhs(?![a-z])|ビデオカセット|vhsビデオ/],
 ['LD',/(?:^|[^a-z])(?:ld|laser\s?disc)(?![a-z])|レーザーディスク/],
 ['配信',/配信|ダウンロード|ストリーミング|デジタル(?:音源|リリース)|(?:^|[^a-z])(?:digital|download|streaming|mp3|flac|aac)(?![a-z])/]
];
function classify(raw,rules,order){if(!raw.length)return ['未登録'];const hits=new Set();for(const v of raw){const n=canon(v);let matched=false;for(const [name,re] of rules){if(re.test(n)){hits.add(name);matched=true;}}if(!matched)hits.add('その他');}return order.filter(k=>hits.has(k));}
const formatGroup=e=>classify(format(e),formats,FORMAT_ORDER);
const kindGroup=e=>classify(kind(e),kinds,KIND_ORDER);
const codes=e=>fieldValues(e,['catalogNumber','catalogNo','catalogCode','productNumber','productCodes','catalogNumbers']);
const label=e=>fieldValues(e,['label','recordLabel','publisher','distributor']);
function works(e){const names=new Map();for(const n of fieldValues(e,['releaseTitle','releaseTitles'])){const k=norm(n);if(k&&!names.has(k))names.set(k,n);}return [...names].map(([key,name])=>({key,name}));}
const releases=events=>events.filter(e=>e&&e.category==='release'&&text(e.id));
const byDate=(a,b)=>cmp(text(a.date)||'9999',text(b.date)||'9999')||cmp(text(a.id),text(b.id));
function groups(events){const map=new Map();for(const e of events){const names=works(e);for(const w of names.length?names:[{key:null,name:'作品名未登録'}]){const key=JSON.stringify([artist(e),w.key]);if(!map.has(key))map.set(key,{key,artist:artist(e),name:w.name,missing:w.key===null,records:[]});map.get(key).records.push(e);}}for(const g of map.values()){g.records.sort(byDate);g.first=text(g.records[0]?.date).slice(0,4);g.last=text(g.records.at(-1)?.date).slice(0,4);g.search=searchNorm([g.name,g.artist,...g.records.flatMap(e=>[text(e.title),...format(e),...kind(e),...formatGroup(e),...kindGroup(e),...codes(e),...label(e)])].join(' '));}return [...map.values()];}
function query(all,options={}){const {artist:who='',format:fmt='',kind:typ='',q='',order='date'}=options;const terms=searchNorm(q).split(/\s+/).filter(Boolean);const rows=all.filter(e=>(!who||artist(e)===who)&&(!fmt||formatGroup(e).includes(fmt))&&(!typ||kindGroup(e).includes(typ)));const found=groups(rows).filter(g=>terms.every(t=>g.search.includes(t)));return found.sort((a,b)=>Number(a.missing)-Number(b.missing)||(order==='name'?cmp(a.name,b.name):order==='artist'?byArtist(a.artist,b.artist)||cmp(text(a.records[0].date),text(b.records[0].date)):cmp(text(a.records[0].date)||'9999',text(b.records[0].date)||'9999'))||byArtist(a.artist,b.artist)||cmp(a.name,b.name));}
const uniqueCount=gs=>new Set(gs.flatMap(g=>g.records.map(e=>text(e.id)))).size;
if(typeof module!=='undefined'&&module.exports){module.exports={works,releases,groups,query,uniqueCount,format,kind,codes,formatGroup,kindGroup,KIND_ORDER,FORMAT_ORDER};return;}
const $=id=>document.getElementById(id), mk=(tag,cls,s)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(s!==undefined)n.textContent=s;return n;};
const detailUrl=e=>{const u=new URL(location.href);u.search='';if(/^\d{4}-\d{2}-\d{2}$/.test(text(e.date)))u.searchParams.set('date',text(e.date).slice(5));u.searchParams.set('event',text(e.id));u.hash='browse';return u.href;};
const dates=e=>text(e.date)||'日付未登録';
function boot(){const root=$('ca330-index'), events=window.CA_EVENT_DATA?.events;if(!root||root.dataset.ready)return;const details=$('ca330-details'), who=$('ca330-artist'), fmt=$('ca330-format'), typ=$('ca330-kind'), order=$('ca330-order'), q=$('ca330-query'), message=$('ca330-count'), list=$('ca330-groups'), records=$('ca330-records'), selectedTitle=$('ca330-selected'), gm=$('ca330-group-more'), rm=$('ca330-record-more');if(!Array.isArray(events)){message.textContent='記録データを読み込めませんでした。ページを再読み込みしてください。';return;}root.dataset.ready='1';const all=releases(events);
const options=(el,vals,sort=cmp)=>{for(const v of [...new Set(vals)].sort(sort)){const o=mk('option','',v);o.value=v;el.append(o);}};options(who,all.map(artist),byArtist);options(fmt,all.flatMap(formatGroup),(a,b)=>FORMAT_ORDER.indexOf(a)-FORMAT_ORDER.indexOf(b));options(typ,all.flatMap(kindGroup),(a,b)=>KIND_ORDER.indexOf(a)-KIND_ORDER.indexOf(b));
let found=[],selected=null,glimit=24,rlimit=25,loaded=false;
function drawRecords(){records.replaceChildren();selectedTitle.textContent=selected?`${selected.name}（${selected.artist}・${selected.records.length}件）`:'';rm.hidden=!selected||selected.records.length<=rlimit;if(!selected)return;for(const e of selected.records.slice(0,rlimit)){const li=mk('li','ca330-record');li.append(mk('div','ca330-meta',[dates(e),artist(e),...kind(e)].join(' ／ ')));const a=mk('a','',text(e.title)||'記録タイトル未登録');a.href=detailUrl(e);li.append(a);const meta=[format(e).join('・'),codes(e).length?'品番：'+codes(e).join('・'):'',label(e).join('・')].filter(Boolean).join(' ／ ');if(meta)li.append(mk('p','',meta));const names=works(e);if(names.length>1)li.append(mk('p','ca330-batch','一括記録の対象作品：'+names.map(w=>w.name).join(' ／ ')));records.append(li);}rm.textContent=`さらに発売記録を表示（残り${Math.max(0,selected.records.length-rlimit)}件）`;}
function drawGroups(){list.replaceChildren();for(const g of found.slice(0,glimit)){const b=mk('button','ca330-group');b.type='button';b.setAttribute('aria-pressed',String(g.key===selected?.key));b.append(mk('strong','',g.name),mk('span','ca330-meta',[g.artist,g.first===g.last?g.first:[g.first,g.last].filter(Boolean).join('–'),g.records.length+'件'].filter(Boolean).join(' ／ ')));b.addEventListener('click',()=>{selected=g;rlimit=25;drawGroups();drawRecords();selectedTitle.focus({preventScroll:true});selectedTitle.scrollIntoView({block:'nearest'});});list.append(b);}gm.hidden=found.length<=glimit;gm.textContent=`さらに索引を表示（残り${Math.max(0,found.length-glimit)}件）`;}
function refresh(){found=query(all,{artist:who.value,format:fmt.value,kind:typ.value,q:q.value,order:order.value});selected=null;glimit=24;rlimit=25;const count=found.filter(g=>!g.missing).length;message.textContent=`作品索引 ${count.toLocaleString('ja-JP')}件${found.some(g=>g.missing)?' ＋ 作品名未登録枠':''} ／ 対象の発売記録 ${uniqueCount(found).toLocaleString('ja-JP')}件`+(found.length?'':'（条件を変更してください）');drawGroups();drawRecords();loaded=true;}
for(const el of [who,fmt,typ,order])el.addEventListener('change',refresh);q.addEventListener('input',refresh);$('ca330-reset').addEventListener('click',()=>{who.value=fmt.value=typ.value=q.value='';order.value='date';refresh();});gm.addEventListener('click',()=>{glimit+=24;drawGroups();});rm.addEventListener('click',()=>{rlimit+=25;drawRecords();});details.addEventListener('toggle',()=>{if(details.open&&!loaded)refresh();});const reveal=()=>{if(location.hash==='#ca330-index'){details.open=true;if(!loaded)refresh();}};window.addEventListener('hashchange',reveal);document.addEventListener('click',e=>{if(e.target.closest?.('a[href="#ca330-index"]')){details.open=true;if(!loaded)refresh();}});if(details.open)refresh();reveal();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();})();
