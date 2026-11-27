/* Ver.3.5.2 テレビ・ラジオ出演索引。データは読取専用。 */
(()=>{'use strict';
const $=id=>document.getElementById(id),text=v=>typeof v==='string'?v.trim():'',norm=v=>text(v).normalize('NFKC').toLocaleLowerCase('ja-JP'),cmp=(a,b)=>a.localeCompare(b,'ja');
const ARTISTS=['CHAGE and ASKA','Chage','ASKA','MULTI MAX'];
const TYPES=['テレビ','ラジオ','配信','映画・劇場公開','テレビCM','ゲーム','舞台','媒体確認待ち'];
const prefixPattern=/(?:テレビ|ラジオ|配信|インターネット|FM|AM|BS|CS|NHK|TBS|フジ|日テレ|WOWOW|J-WAVE|TOKYO MX|ニッポン放送|放送|NACK5|JFN|K-mix|α-STATION|AIR-G|HTB|RCC|RKB|KBC|ABC|MBS|MX|TV|チャンネル|ABEMA|LINE LIVE|エフエム|くるめラ|メ[～〜ー]テレ|MTV)/i;
const quote=t=>t.match(/^([^「『]{0,100})(?:「([^」]+)」|『([^』]+)』)/);
const RADIO_NAMES=/^(?:山下泰則のモーニング[・ ]?ディライト|あさスタ♪|モリラジ[!！]|おひるーな|オトナナビゲーションZ|TIPS|ニュースな時間|J-POPシャッフル|上田剛彦のなにわ音楽ハツラツ団|あの頃青春グラフィティ|ザ[★☆]横山雄二ショー|スーパー・ササダンゴ・マシンのセッパン[!！]|今夜はチャゲラッチョ|ノコトラジオ|となりのラジオ)$/i;
const RADIO_ST=/ラジオ|ラヂオ|radio|エフエム|fm|j-wave|ニッポン放送|文化放送|nack5|α-station|air-g|jfn|k-mix|くるめラ/i;
const TV_ST=/テレビ|日テレ|wowow|スカパー|スカチャン|地上波|^bs(?:[-\d\s]|フジ|朝日|日テレ)|^cs(?:[\s\d]|$)|nhk\s*(?:総合|bs|bsp)|^tbs(?:$|系列|チャンネル|（)|^フジ|^htb$|^tokyo mx$|^fbs$|^福岡放送|^メ[～〜ー]テレ|^mtv|チャンネル|^仙台放送|^khb$|^東日本放送/i;
const STREAM_ST=/配信|stream|youtube|ニコニコ|abema|line live|^zaiko$|^mahocast$|^curtain call$|オンデマンド|^rakuten tv$|^fod|^voicy|^ii[vV]\b/i;
function medium(e){const title=text(e.title),m=quote(title),head=text(m?m[1]:title),name=m?text(m[2]||m[3]):'',station=text(e.broadcastStation),desc=text(e.description),note=text(e.note);const a=norm(head),s=norm(station),explicit=norm([e.mediaType,e.broadcastType,e.format].map(text).join(' '));
 if(/テレビ\s*cm|テレビコマーシャル/i.test(title))return ['テレビCM'];
 if(/^(映画|劇場版|短編アニメーション)[『「]/.test(title)&&/公開/.test(title))return ['映画・劇場公開'];
 if(/^ゲーム[『「]/.test(title))return ['ゲーム'];
 if(/^舞台[『「]/.test(title)&&!/テレビ.*放送/.test(title))return ['舞台'];
 if(RADIO_NAMES.test(name))return ['ラジオ'];
 if(e.id==='media-v215-20081011-ohayo-saturday'&&name==='おはようサタデー九州沖縄'&&station==='NHK総合（九州・沖縄）')return ['テレビ'];
 if(/おはようサタデー/.test(name)&&/^NHK/.test(head))return ['媒体確認待ち'];
 if(/^travel tv$/i.test(head))return ['配信'];
 if(/^TTV$/i.test(head)||/スペースシャワーTV/i.test(station)||/^(?:ちちんぷいぷい|歌える！J-POP黄金のベストアルバム30M)$/.test(name))return ['テレビ'];
 if(/ラジオ|radio/i.test(explicit)||/^ラジオ|^NHK[- ]?FM|^YouTubeラジオ/i.test(head))return ['ラジオ'];
 if(/^テレビ$/.test(head))return ['テレビ'];
 if(/配信|streaming/i.test(explicit)||/^インターネット/.test(head)||STREAM_ST.test(a)||STREAM_ST.test(s)||/(?:生配信|アーカイブ配信|オンライン配信|収録映像配信|映像配信|再配信|配信開始|YouTubeライブ映像)/i.test(title))return ['配信'];
 if(/テレビ|television/i.test(explicit)||/^テレビ/.test(head)||/^ドラマ|^単発ドラマ|^新春時代劇/.test(head))return ['テレビ'];
 if(RADIO_ST.test(a)||RADIO_ST.test(s))return ['ラジオ'];
 if(TV_ST.test(a)||TV_ST.test(s))return ['テレビ'];
 // Use existing descriptions only when the medium is explicitly named; ambiguous dual-media stations stay unresolved unless corroborated.
 if(/テレビ番組|ラジオ番組|インターネット配信番組/.test(desc)){
   if(/ラジオ番組/.test(desc))return ['ラジオ'];
   if(/インターネット配信番組/.test(desc))return ['配信'];
   if(/テレビ番組/.test(desc)&&!/^(?:南海放送|RCC|RKB|MRO|BSS|ABC|BSN|NHK(?:$|（)|毎日放送|九州朝日放送)/i.test(head)&&!/^(?:南海放送|RCC|RKB|MRO|BSS|ABC|BSN|毎日放送|九州朝日放送)/i.test(station))return ['テレビ'];
 }
 if(/^NHK/.test(head)&&/うたコン|ニュースウオッチ|えぇトコ|ロクいち|tiny desk|玉置浩二ショー|SONGS|ミュージック・カクテル|50ボイス|54分の衝撃|CHAGE&ASKA LIVE|BSスペシャル/i.test(name))return ['テレビ'];
 if(/味わいぶらり旅|オケハザマってなんですか|タダイマ[!！]|ニュースブリッジ北九州|大阪アジア音楽祭|SUPER BEST 3 MISSION IMPOSSIBLE|ASIAライブ/i.test(name)&&/放送|出演/.test(title))return ['テレビ'];
 if(/テレビ番組/.test(desc)&&!head)return ['テレビ'];
 if(/ラジオ出演|JFN系ラジオ/.test(note))return ['ラジオ'];
 if(/テレビ初放送|テレビ放送/.test(title)||/^NHK.*ドラマ/.test(head))return ['テレビ'];
 return ['媒体確認待ち'];}
function program(e){const explicit=text(e.programName)||text(e.broadcastProgram);if(explicit)return {name:explicit,kind:'登録値'};const title=text(e.title),m=quote(title),types=medium(e),media=types[0],station=text(e.broadcastStation);
 if(m){const head=text(m[1]),name=text(m[2]||m[3]);if(name&&(prefixPattern.test(head)||station||!head||/ドラマ|時代劇|映画|劇場版|アニメーション|ゲーム|舞台/.test(head)||media==='テレビCM'))return {name,kind:['映画・劇場公開','テレビCM','ゲーム','舞台'].includes(media)?'作品・企画名':'タイトルから抽出'};}
 // The current unquoted records contain explicit distribution/broadcast titles. Strip only event-type suffixes, not arbitrary words.
 if(media==='配信'||media==='テレビ'){
 const clean=title.replace(/\s+(?:フジテレビTWO|スペースシャワーTV|スペシャオンデマンド)\s+(?:初回放送|再放送|配信開始)$/,'').replace(/\s+(?:テレビ放送|事後スペシャル番組)$/,'').replace(/\s*(?:[（(](?:生配信|オンライン配信|アーカイブ配信開始|収録映像配信開始|関連配信|メイキング付き映像配信)[）)]|(?:生配信|アーカイブ配信開始|ライブ映像配信開始|収録映像配信|配信開始))$/,'').trim();
 if(clean&&clean!==title)return {name:clean,kind:media==='配信'?'配信タイトル':'タイトルから抽出'};
 if(/^C&A公式YouTubeライブ映像/.test(title))return {name:title,kind:'配信タイトル'};
 }
 return null;}
// Station name is used as registered, or extracted only from an explicit title prefix / first note sentence.
function stationFor(e){const reg=text(e.broadcastStation);if(reg)return reg;const m=quote(text(e.title)),prefix=text(m?.[1]);const isStation=s=>!!s&&s.length<45&&!/^(?:テレビ|ラジオ|ラジオ番組|配信番組|インターネット|ドラマ|映画|CS|BS|ASKA配信ライブ|沖縄ローカル番組)$/i.test(s)&&(RADIO_ST.test(s)||TV_ST.test(s)||STREAM_ST.test(s)||/^(?:NHK|南海放送|RCC|RKB|MRO北陸放送|BSS山陰放送|ABC朝日放送|BSN新潟放送|毎日放送|九州朝日放送|KBC|MBS|RCC中国放送|四国放送|福岡放送|FBS|RKB毎日放送)$/i.test(s));if(isStation(prefix))return prefix;const first=text(e.note).split('。')[0].trim();if(isStation(first)&&!/[「『、。；;：:]/.test(first)&&!/(出演|放送開始|放送日|確認|記録|予定|収録|紹介|放送回|公式|ゲスト|番組)/.test(first))return first;return '';}
function stationKey(s){return norm(s).replace(/\s+/g,'').replace(/(?:（|\()(?:fbs|uhb|kbc|mbs|tku|khb|rccテレビ|資料記載)(?:）|\))/g,'').replace(/^fbs(?:福岡放送)?$/,'福岡放送').replace(/^uhb北海道文化放送$/,'北海道文化放送').replace(/^mtvjapan$/,'mtv').replace(/^フジテレビ(?:系列|系)$/,'フジテレビ系列').replace(/^テレビ東京(?:系列|系)$/,'テレビ東京系列');}
const year=e=>/^\d{4}/.exec(text(e.date))?.[0]||'';
const dateLabel=e=>/^\d{4}$/.test(text(e.date))?e.date+'年（月日未詳）':/^\d{4}-\d{2}-\d{2}$/.test(text(e.date))?e.date.replaceAll('-','/'):text(e.date)||'日付未登録';
const el=(tag,cls='',value='')=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=value;return n;};
function boot(){const root=$('ca350-index'),events=window.CA_EVENT_DATA?.events;if(!root||root.dataset.ready)return;const count=$('ca350-count');if(!Array.isArray(events)){count.textContent='記録データを読み込めませんでした。再読み込みしてください。';return;}root.dataset.ready='1';
const all=events.filter(e=>e.category==='media').map(e=>({e,p:program(e),types:medium(e),artist:text(e.artist)||'名義未設定',station:stationFor(e),decade:year(e)?year(e).slice(0,3)+'0年代':''}));
const details=$('ca350-details'),artist=$('ca350-artist'),type=$('ca350-type'),decade=$('ca350-decade'),station=$('ca350-station'),q=$('ca350-query'),order=$('ca350-order'),list=$('ca350-groups'),records=$('ca350-records'),selectedTitle=$('ca350-selected'),more=$('ca350-more'),recordMore=$('ca350-record-more');
const opts=(control,values)=>{for(const v of values){const o=el('option','',v);o.value=v;control.append(o);}};
opts(artist,[...new Set(all.map(x=>x.artist))].sort((a,b)=>(ARTISTS.indexOf(a)<0?99:ARTISTS.indexOf(a))-(ARTISTS.indexOf(b)<0?99:ARTISTS.indexOf(b))||cmp(a,b)));opts(type,TYPES.filter(t=>all.some(x=>x.types.includes(t))));opts(decade,[...new Set(all.map(x=>x.decade).filter(Boolean))].sort());
let found=[],selected=null,limit=24,rlimit=25,loaded=false;
const snapshot=()=>({artist:artist.value,type:type.value,decade:decade.value,station:station.value,q:q.value,order:order.value,selected:selected?.key||'',limit,rlimit});
function recordUrl(e){const u=new URL(location.href);u.search='';if(/^\d{4}-\d{2}-\d{2}$/.test(text(e.date)))u.searchParams.set('date',e.date.slice(5));u.searchParams.set('event',String(e.id));u.hash='browse';return u.href;}
function drawRecords(){records.replaceChildren();selectedTitle.textContent=selected?selected.name+'（'+selected.items.length+'件）':'';recordMore.hidden=!selected||selected.items.length<=rlimit;if(!selected)return;for(const x of selected.items.slice(0,rlimit)){const {e,p}=x,li=el('li','ca350-record');li.append(el('div','ca350-meta',[dateLabel(e),x.artist,x.types.join('・'),x.station||'放送局未登録'].join(' ／ ')));const a=el('a','',text(e.title)||'タイトル未登録');a.href=recordUrl(e);window.CA_INDEX_RETURN?.link(a,'ca350-index',snapshot);li.append(a);const meta=[p?'番組名：'+p.kind:'名称確認待ち',e.status==='scheduled'?'開催・放送予定':e.status==='cancelled'?'中止':e.status==='postponed'?'延期':'',e.verification==='primary'?'一次資料確認':e.verification==='secondary'?'二次資料確認':'確認区分未設定'].filter(Boolean);li.append(el('div','ca350-meta',meta.join(' ／ ')));records.append(li);}recordMore.textContent='さらに記録を表示（残り'+Math.max(0,selected.items.length-rlimit)+'件）';}
function drawGroups(){list.replaceChildren();if(!found.length)list.append(el('p','','該当する記録はありません。'));for(const g of found.slice(0,limit)){const b=el('button','ca350-group');b.type='button';b.setAttribute('aria-pressed',String(g.key===selected?.key));const artists=[...new Set(g.items.map(x=>x.artist))].sort((a,b)=>ARTISTS.indexOf(a)-ARTISTS.indexOf(b)||cmp(a,b));const years=[...new Set(g.items.map(x=>year(x.e)).filter(Boolean))].sort();const span=years.length>1?years[0]+'〜'+years.at(-1)+'年':years.length?years[0]+'年':'';b.append(el('strong','',g.name),el('span','ca350-meta',[g.unknown?'元資料の名称を確認する必要がある記録':artists.join('・'),span,g.items.length+'件'].filter(Boolean).join(' ／ ')));b.addEventListener('click',()=>{selected=g;rlimit=25;drawGroups();drawRecords();selectedTitle.focus({preventScroll:true});selectedTitle.scrollIntoView({block:'nearest'});});list.append(b);}more.hidden=found.length<=limit;more.textContent='さらに索引を表示（残り'+Math.max(0,found.length-limit)+'件）';}
function refresh(){const terms=norm(q.value).split(/\s+/).filter(Boolean),groups=new Map();for(const x of all){const {e,p}=x;if(artist.value&&artist.value!==x.artist||type.value&&!x.types.includes(type.value)||decade.value&&x.decade!==decade.value||station.value&&!stationKey(x.station).includes(stationKey(station.value)))continue;const hay=norm([p?.name,e.title,x.artist,x.station,e.date,x.types.join(' '),e.description,e.note].join(' '));if(!terms.every(t=>hay.includes(t)))continue;const k=p?'program:'+norm(p.name):'unknown';if(!groups.has(k))groups.set(k,{key:k,name:p?.name||'名称確認待ちの記録',unknown:!p,items:[]});groups.get(k).items.push(x);}
found=[...groups.values()];const direction=order.value==='desc'?-1:1;for(const g of found)g.items.sort((a,b)=>direction*cmp(text(a.e.date),text(b.e.date))||cmp(String(a.e.id),String(b.e.id)));found.sort((a,b)=>Number(a.unknown)-Number(b.unknown)||(order.value==='name'?cmp(a.name,b.name):direction*cmp(text(a.items[0].e.date),text(b.items[0].e.date)))||cmp(a.name,b.name));selected=null;limit=24;rlimit=25;const n=found.reduce((s,g)=>s+g.items.length,0),u=found.find(g=>g.unknown)?.items.length||0;count.textContent='番組・関連作品索引 '+found.filter(g=>!g.unknown).length+'件 ／ 対象記録 '+n+'件'+(u?'（名称確認待ち '+u+'件）':'');drawGroups();drawRecords();loaded=true;}
function restore(){const saved=window.CA_INDEX_RETURN?.get('ca350-index');if(!saved)return false;const s=saved.state;for(const [control,key] of [[artist,'artist'],[type,'type'],[decade,'decade'],[order,'order']])if([...control.options].some(o=>o.value===s[key]))control.value=s[key];if(typeof s.q==='string')q.value=s.q;if(typeof s.station==='string'&&s.station!=='__unknown__')station.value=s.station;details.open=true;refresh();selected=found.find(g=>g.key===s.selected)||null;limit=Number.isInteger(s.limit)?Math.max(24,Math.min(all.length,s.limit)):24;rlimit=Number.isInteger(s.rlimit)?Math.max(25,Math.min(all.length,s.rlimit)):25;drawGroups();drawRecords();window.CA_INDEX_RETURN.finish(saved);return true;}
for(const c of [artist,type,decade,station,order])c.addEventListener('change',refresh);q.addEventListener('input',refresh);station.addEventListener('input',refresh);$('ca350-reset').addEventListener('click',()=>{artist.value=type.value=decade.value=station.value=q.value='';order.value='asc';refresh();});more.addEventListener('click',()=>{limit+=24;drawGroups();});recordMore.addEventListener('click',()=>{rlimit+=25;drawRecords();});details.addEventListener('toggle',()=>{if(details.open&&!loaded)refresh();});const reveal=()=>{if(location.hash==='#ca350-index'){details.open=true;if(!loaded)refresh();}};window.addEventListener('hashchange',reveal);document.addEventListener('click',e=>{if(e.target.closest?.('a[href="#ca350-index"]')){details.open=true;if(!loaded)refresh();}});if(!restore()){if(details.open)refresh();reveal();}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();})();
