/* 今日はC&Aの何の日？ | Safe archive editor Ver.2.0.0
 * Browser-only. Preserves original record properties and dataset metadata.
 * Does not write GitHub, remote resources, storage or cookies.
 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const form=$('event-form');
  const original=structuredClone(window.CA_EVENT_DATA||{});
  if(!Array.isArray(original.events)){
    $('admin-data-status').textContent='記録データを読み込めません。data/events.js を確認してください。';
    for(const b of document.querySelectorAll('button'))b.disabled=true;
    return;
  }
  let archive=structuredClone(original);
  let data=archive.events;
  let editId=null,dirty=false,selectedSources=[],limit=100;
  const names={live:'ライブ',release:'作品発売',media:'テレビ・ラジオ',milestone:'記録・記念日',amateur:'デビュー前・アマチュア活動',other:'その他'};
  const enc=new TextEncoder();
  const csvColumns=['ID','日付','名義','種類','タイトル','都道府県','会場','公演番号','備考','照合状況','出典URL'];
  const fieldConfig={
    'f-date':['date',true], 'f-artist':['artist',true], 'f-category':['category',true], 'f-title':['title',true],
    'f-prefecture':['prefecture',false], 'f-venue':['venue',false], 'f-country':['country',false],
    'f-start-time':['startTime',false], 'f-session':['session',false], 'f-performance-no':['performanceNo',false],
    'f-tour-id':['tourId',false], 'f-release-title':['releaseTitle',false], 'f-station':['broadcastStation',false],
    'f-note':['note',true], 'f-verification':['verification',true], 'f-status':['status',true]
  };
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const jpDate=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const num=n=>Number(n).toLocaleString('ja-JP');
  function markDirty(){dirty=true;$('save-hint').textContent='未書き出しの変更があります';$('save-hint').classList.add('is-dirty');}
  function markExported(){dirty=false;$('save-hint').textContent='書き出し済み（GitHubへの反映は手動です）';$('save-hint').classList.remove('is-dirty');}
  function validateDate(value){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const [y,m,d]=value.split('-').map(Number);
    const obj=new Date(Date.UTC(y,m-1,d));
    return obj.getUTCFullYear()===y&&obj.getUTCMonth()+1===m&&obj.getUTCDate()===d;
  }
  function validateDataset(a){
    if(!Array.isArray(a.events)||!a.events.length)throw Error('記録データがありません');
    const ids=new Set();
    for(const e of a.events){
      if(!e||typeof e!=='object'||!e.id||ids.has(e.id))throw Error('記録IDの空欄・重複：'+String(e?.id));
      ids.add(e.id);
      if(!validateDate(String(e.date))||!e.title||!e.artist||!e.category)throw Error('必須項目の不備：'+e.id);
      if(!Array.isArray(e.sources)||!e.sources.length||e.sources.some(s=>!s||typeof s.label!=='string'||!s.label.trim()||!/^https:\/\//i.test(String(s.url||''))))throw Error('出典の不備：'+e.id);
    }
    return ids.size;
  }
  const idCount=validateDataset(archive);
  function status(){
    const list=data;const total=list.length;
    const sources=list.reduce((n,x)=>n+(x.sources?.length||0),0);
    $('admin-data-status').textContent='画面 Ver.2.0.0 ／ データ Ver.'+(archive.siteVersion||'未設定')+' ／ '+num(total)+'件（ID重複なし） ／ 出典 '+num(sources)+'件 ／ データ更新日 '+(archive.lastUpdated||'未設定')+(dirty?' ／ ブラウザー内に未書き出し変更あり':'');
  }
  function chooseOption(select,v){
    const val=String(v??'');
    if(val && ![...select.options].some(x=>x.value===val))select.add(new Option(val+'（既存値）',val));
    select.value=val||select.options[0].value;
  }
  function snapshotSources(){
    for(const row of $('source-rows').querySelectorAll('.source-item')){
      const i=Number(row.dataset.index),item=selectedSources[i];
      if(item){item.label=row.querySelector('.src-label').value;item.url=row.querySelector('.src-url').value;}
    }
  }
  function renderSources(){
    $('source-rows').innerHTML=selectedSources.map((s,i)=>`<div class="source-item" data-index="${i}"><div class="source-heading"><strong>出典 ${i+1}</strong><button type="button" class="source-remove" data-remove="${i}" aria-label="出典${i+1}を削除">削除</button></div><div class="source-fields"><label>出典名<input class="src-label" value="${esc(s.label||'')}" required></label><label>出典URL<input class="src-url" type="url" value="${esc(s.url||'')}" required></label></div></div>`).join('');
  }
  function newForm(){
    editId=null;form.reset();
    $('f-category').value='live';$('f-verification').value='secondary';$('f-status').value='recorded';
    selectedSources=[{label:'',url:''}];renderSources();
    $('form-title').textContent='新しい出来事を追加';$('save-event').textContent='新規登録';
    $('preservation-note').textContent='新規登録：出典を1件以上登録してください。';
  }
  function edit(x){
    editId=x.id;
    for(const [id,[key]] of Object.entries(fieldConfig)){
      const el=$(id),v=x[key];
      if(el.tagName==='SELECT')chooseOption(el,v);
      else el.value=v??'';
    }
    selectedSources=structuredClone(x.sources||[]);
    renderSources();
    const listed=new Set(['id','sources',...Object.values(fieldConfig).map(v=>v[0])]);
    const extras=Object.keys(x).filter(k=>!listed.has(k));
    $('preservation-note').textContent='編集ID（固定）：'+x.id+'。全'+Object.keys(x).length+'項目を保持して編集します。未表示の追加項目：'+(extras.length?extras.join('、'):'なし')+'。出典'+selectedSources.length+'件。';
    $('form-title').textContent='登録済みの記録を編集';$('save-event').textContent='変更を保存';
    window.scrollTo({top:0,behavior:'smooth'});
  }
  function collectRecord(){
    snapshotSources();
    if(!selectedSources.length)throw Error('出典は1件以上必要です。');
    const x=editId?structuredClone(data.find(e=>e.id===editId)):{};
    if(!x)throw Error('編集元の記録が見つかりません。');
    if(!editId){
      const uuid=typeof crypto?.randomUUID==='function'?crypto.randomUUID().slice(0,20):Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      x.id='custom-'+uuid;
    }
    for(const [id,[key,required]] of Object.entries(fieldConfig)){
      const s=$(id).value.trim();
      if(required||s){x[key]=key==='performanceNo'?Number(s):s;}
      else delete x[key];
    }
    if(!validateDate(x.date))throw Error('日付が正しくありません。');
    if(!x.artist||!x.category||!x.title)throw Error('名義・分類・タイトルは必須です。');
    if(x.performanceNo!==undefined&&(!Number.isSafeInteger(x.performanceNo)||x.performanceNo<1))throw Error('公演番号は1以上の整数で指定してください。');
    if(x.startTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(x.startTime))throw Error('開演時刻は HH:MM 形式で指定してください。');
    if(selectedSources.some(s=>!s.label?.trim()||!/^https:\/\//i.test(String(s.url||'').trim())))throw Error('すべての出典名とhttps:// URLを確認してください。');
    x.sources=structuredClone(selectedSources).map(s=>({...s,label:s.label.trim(),url:s.url.trim()}));
    return x;
  }
  function itemHTML(x){return `<div class="admin-entry"><div class="admin-entry-head"><span>${esc(x.date)}</span><span>${esc(names[x.category]||x.category||'その他')}</span><span>${esc(x.artist)}</span></div><strong>${esc(x.title)}</strong><p>${esc([x.prefecture,x.venue,x.startTime].filter(Boolean).join(' / '))}</p><p>ID：${esc(x.id)} ／ 出典 ${x.sources?.length||0}件</p><div class="admin-entry-actions"><button type="button" data-edit="${esc(x.id)}">編集</button><button type="button" data-delete="${esc(x.id)}">削除</button></div></div>`;}
  function matching(){
    const text=$('admin-search').value.trim().normalize('NFKC').toLocaleLowerCase('ja-JP');
    const terms=text.split(/\s+/).filter(Boolean);
    return data.filter(x=>{
      if(!terms.length)return true;
      const h=[x.id,x.date,x.artist,x.category,x.title,x.prefecture,x.venue,x.broadcastStation,x.tourId,x.releaseTitle,x.note].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase('ja-JP');
      return terms.every(t=>h.includes(t));
    }).sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(a.id).localeCompare(String(b.id)));
  }
  function render(){
    const list=matching();
    $('admin-total').textContent='（'+num(data.length)+'件 ／ 該当'+num(list.length)+'件）';
    $('admin-list').innerHTML=list.slice(0,limit).map(itemHTML).join('')||'<p>該当する記録はありません</p>';
    $('admin-more').hidden=list.length<=limit;
    $('admin-more').textContent='さらに表示（残り'+num(Math.max(0,list.length-limit))+'件）';
    status();
  }
  function prepare(){
    const out=structuredClone(archive);
    out.events=data.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.id).localeCompare(String(b.id)));
    if(dirty)out.lastUpdated=jpDate();
    if(!$('data-version').value.trim())throw Error('データ版が空欄です');
    out.siteVersion=$('data-version').value.trim();
    validateDataset(out);
    // Retain dataset siteVersion exactly: screen version is separate.
    return out;
  }
  function encodeCSV(list){
    const q=v=>{let s=String(v??'');if(/^\s*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    const rows=[csvColumns.map(q).join(',')];
    for(const x of list)rows.push([x.id,x.date,x.artist,x.category,x.title,x.prefecture||'',x.venue||'',x.performanceNo??'',x.note||'',x.verification||'',(x.sources||[]).map(s=>s.url).join(' | ')].map(q).join(','));
    return '\ufeff'+rows.join('\r\n')+'\r\n';
  }
  function exportFiles(a){return {
    'data/events.json':JSON.stringify(a,null,2)+'\n',
    'data/events.js':'/* C&A HISTORY CALENDAR public dataset */\nwindow.CA_EVENT_DATA = '+JSON.stringify(a,null,2)+';\n',
    'data/events.csv':encodeCSV(a.events)
  };}
  function save(name,bytes,type){
    const blob=bytes instanceof Blob?bytes:new Blob([bytes],{type:type||'application/octet-stream'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
  }
  const crcTable=(()=>{const t=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;t[i]=c>>>0;}return t})();
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  function makeZip(entries){
    const local=[],central=[];let offset=0;
    for(const [file,text] of Object.entries(entries)){
      const name=enc.encode(file),bytes=enc.encode(text),crc=crc32(bytes);
      const h=new Uint8Array(30),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x0800,true);v.setUint32(14,crc,true);v.setUint32(18,bytes.length,true);v.setUint32(22,bytes.length,true);v.setUint16(26,name.length,true);local.push(h,name,bytes);
      const ch=new Uint8Array(46),d=new DataView(ch.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x0800,true);d.setUint32(16,crc,true);d.setUint32(20,bytes.length,true);d.setUint32(24,bytes.length,true);d.setUint16(28,name.length,true);d.setUint32(42,offset,true);central.push(ch,name);offset+=h.length+name.length+bytes.length;
    }
    const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,Object.keys(entries).length,true);v.setUint16(10,Object.keys(entries).length,true);v.setUint32(12,central.reduce((n,x)=>n+x.length,0),true);v.setUint32(16,offset,true);
    return new Blob([...local,...central,end],{type:'application/zip'});
  }
  function exportOne(file){try{const entries=exportFiles(prepare());save(file.split('/').pop(),entries[file],file.endsWith('.js')?'text/javascript;charset=utf-8':'text/plain;charset=utf-8');$('save-hint').textContent='単独ファイルを保存しました。GitHub反映時は3ファイルZIPをご使用ください。';render();}catch(e){alert('書き出しを停止しました：'+e.message);}}
  form.addEventListener('submit',ev=>{
    ev.preventDefault();
    try{
      const x=collectRecord();
      const similar=data.find(i=>i.id!==x.id&&i.date===x.date&&i.artist===x.artist&&i.category===x.category&&i.title===x.title&&i.venue===x.venue);
      if(similar&&!confirm('同日・同名義・同名タイトル・同会場の記録があります。昼夜公演など、別の出来事として登録しますか？'))return;
      const at=data.findIndex(i=>i.id===x.id);
      const before=at>=0?JSON.stringify(data[at]):null;
      if(before===JSON.stringify(x)){alert('変更点はありません。');return;}
      if(at<0)data.push(x);else data[at]=x;
      validateDataset({...archive,events:data});
      markDirty();newForm();limit=100;render();
    }catch(e){alert('保存を停止しました：'+e.message);}
  });
  $('source-rows').addEventListener('input',()=>snapshotSources());
  $('source-rows').addEventListener('click',ev=>{
    const btn=ev.target.closest('[data-remove]');if(!btn)return;
    snapshotSources();const i=Number(btn.dataset.remove);
    if(selectedSources.length===1){alert('最後の出典は削除できません。');return;}
    if(!confirm('出典'+(i+1)+'をこの記録から削除しますか？'))return;
    selectedSources.splice(i,1);renderSources();
  });
  $('add-source').addEventListener('click',()=>{snapshotSources();selectedSources.push({label:'',url:''});renderSources();});
  $('admin-list').addEventListener('click',ev=>{
    const t=ev.target.closest('[data-edit],[data-delete]');if(!t)return;
    const id=t.dataset.edit||t.dataset.delete,x=data.find(e=>e.id===id);if(!x)return;
    if(t.dataset.edit){edit(x);return;}
    if(confirm(x.date+'「'+x.title+'」を完全に削除しますか？\n削除してもGitHubの公開データは更新されません。')){
      data=data.filter(e=>e.id!==id);archive.events=data;markDirty();if(editId===id)newForm();render();
    }
  });
  $('admin-search').addEventListener('input',()=>{limit=100;render()});
  $('admin-more').addEventListener('click',()=>{limit+=100;render()});
  $('new-form').addEventListener('click',newForm);
  $('download-json').addEventListener('click',()=>exportOne('data/events.json'));
  $('download-js').addEventListener('click',()=>exportOne('data/events.js'));
  $('download-csv').addEventListener('click',()=>exportOne('data/events.csv'));
  $('download-bundle').addEventListener('click',()=>{
    try{const entries=exportFiles(prepare());save('CA_data_3files_'+jpDate()+'.zip',makeZip(entries));markExported();render();}
    catch(e){alert('3ファイルの書き出しを停止しました：'+e.message);}
  });
  $('backup-original').addEventListener('click',()=>{
    try{const src=exportFiles(original);save('CA_original_backup_'+jpDate()+'.zip',makeZip(src));}
    catch(e){alert('元データの保存に失敗：'+e.message);}
  });
  $('import-json').addEventListener('change',async ev=>{
    const file=ev.target.files?.[0];if(!file)return;
    try{
      const j=JSON.parse(await file.text());const count=validateDataset(j);
      if(!confirm('現在の'+num(data.length)+'件を、読み込んだ'+num(count)+'件に置き換えますか？\n現行データのバックアップを事前に保存してください。'))return;
      archive=structuredClone(j);data=archive.events;$('data-version').value=archive.siteVersion||'';newForm();markDirty();render();
    }catch(e){alert('読み込みを停止しました：'+e.message);}finally{ev.target.value='';}
  });
  $('data-version').value=archive.siteVersion||'';
  $('data-version').addEventListener('change',()=>{const value=$('data-version').value.trim();if(!value){alert('データ版を指定してください');$('data-version').value=archive.siteVersion||'';return;}if(value!==archive.siteVersion){archive.siteVersion=value;markDirty();render();}});
  window.addEventListener('beforeunload',ev=>{if(dirty){ev.preventDefault();ev.returnValue='';}});
  newForm();render();
})();
