(()=>{
'use strict';
const $=id=>document.getElementById(id),el=$('event-form');
let archive=structuredClone(window.CA_EVENT_DATA||{schemaVersion:1,events:[]});
let data=archive.events;
let editId=null,dirty=false;
const categories={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',other:'その他'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function field(id){return $(id).value.trim();}
function markDirty(){dirty=true;$('save-hint').textContent='未書き出しの変更があります';$('save-hint').style.color='#e8bc73';}
function markExported(){dirty=false;$('save-hint').textContent='書き出し済み。GitHub上のファイルを置き換えてください';$('save-hint').style.color='#b3c0d2';}
function newForm(){editId=null;el.reset();$('f-category').value='live';$('f-verification').value='secondary';$('f-status').value='recorded';$('form-title').textContent='新しい出来事を追加';$('save-event').textContent='新規登録';}
function edit(x){editId=x.id;const fields={'f-date':x.date,'f-artist':x.artist,'f-category':x.category,'f-title':x.title,'f-prefecture':x.prefecture,'f-venue':x.venue,'f-note':x.note,'f-source':x.sources?.[0]?.url,'f-source-label':x.sources?.[0]?.label,'f-verification':x.verification,'f-status':x.status};for(const [id,val]of Object.entries(fields))$(id).value=val||'';$('form-title').textContent='登録済みの記録を編集';$('save-event').textContent='変更を保存';window.scrollTo({top:0,behavior:'smooth'});}
function itemHTML(x){return `<div class="admin-entry"><div class="admin-entry-head"><span>${esc(x.date)}</span><span>${esc(categories[x.category]||'その他')}</span><span>${esc(x.artist)}</span></div><strong>${esc(x.title)}</strong><p>${esc([x.prefecture,x.venue].filter(Boolean).join(' / '))}</p><div class="admin-entry-actions"><button type="button" data-edit="${esc(x.id)}">編集</button><button type="button" data-delete="${esc(x.id)}">削除</button></div></div>`;}
function render(){const q=field('admin-search').toLocaleLowerCase('ja-JP');const filtered=data.filter(x=>[x.date,x.artist,x.title,x.prefecture,x.venue].join(' ').toLocaleLowerCase('ja-JP').includes(q)).sort((a,b)=>b.date.localeCompare(a.date));$('admin-total').textContent=`${data.length}件`;$('admin-list').innerHTML=filtered.length?filtered.map(itemHTML).join(''):'<p>該当する記録はありません</p>';}
function genId(){return 'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7);}
function prepare(){return {schemaVersion:1,notice:archive.notice||'確認できた記録から追加していきます。',lastUpdated:new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Tokyo'}),events:data.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id))};}
function download(name,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);markExported();}
$('event-form').addEventListener('submit',e=>{e.preventDefault();const source=field('f-source');if(!/^https:\/\//.test(source)){alert('出典URLはhttps://で始まるURLを入力してください。');return;}
 const x={id:editId||genId(),date:field('f-date'),artist:field('f-artist'),category:field('f-category'),title:field('f-title'),status:field('f-status'),verification:field('f-verification'),note:field('f-note'),sources:[{label:field('f-source-label'),url:source}]};
 if(field('f-prefecture'))x.prefecture=field('f-prefecture');if(field('f-venue'))x.venue=field('f-venue');
 const old=editId?data.find(item=>item.id===editId):null;
 if(old)for(const key of ['tourId','performanceNo','country','releaseTitle'])if(old[key]!==undefined)x[key]=old[key];
 const duplicated=data.find(item=>item.id!==x.id&&item.date===x.date&&item.artist===x.artist&&item.category===x.category&&item.title===x.title&&item.venue===x.venue);
 if(duplicated&&!confirm('同一日・同一名義・同一タイトル・同一会場の記録があります。昼夜公演など、別の出来事として登録しますか？'))return;
 const index=data.findIndex(item=>item.id===x.id);if(index>=0)data[index]=x;else data.push(x);markDirty();newForm();render();});
$('admin-list').addEventListener('click',e=>{const target=e.target.closest('[data-edit],[data-delete]');if(!target)return;const id=target.dataset.edit||target.dataset.delete;const item=data.find(x=>x.id===id);if(!item)return;if(target.dataset.edit){edit(item);return;}if(confirm(`${item.date}「${item.title}」を削除しますか？`)){data=data.filter(x=>x.id!==id);archive.events=data;markDirty();if(editId===id)newForm();render();}});
$('admin-search').addEventListener('input',render);
$('new-form').addEventListener('click',newForm);
$('download-js').addEventListener('click',()=>download('events.js','/* C&A HISTORY CALENDAR public dataset */\nwindow.CA_EVENT_DATA = '+JSON.stringify(prepare(),null,2)+';\n','text/javascript;charset=utf-8'));
$('download-json').addEventListener('click',()=>download('events.json',JSON.stringify(prepare(),null,2)+'\n','application/json;charset=utf-8'));
$('import-json').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.events)||parsed.events.some(x=>!x.id||!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!x.artist||!x.title||!x.category||!Array.isArray(x.sources))){throw Error('記録形式が正しくありません。');}
 if(!confirm(`現在の${data.length}件を、読み込んだ${parsed.events.length}件のデータに置き換えますか？`))return;archive=parsed;data=archive.events;newForm();markDirty();render();}catch(err){alert(`JSONを読み込めませんでした：${err.message}`);}finally{e.target.value='';}});
window.addEventListener('beforeunload',e=>{if(dirty){e.preventDefault();e.returnValue='';}});
newForm();render();
})();
