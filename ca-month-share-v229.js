/* 今日はC&Aの何の日？｜画面 Ver.2.3.6
 * 7日間／10日間の記録一覧を共有する。旧ca_view=monthlyリンクとも互換。
 * ca-ver40.js、ca-share-unify-v228.jsより後に読み込む。
 */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const fields=[
    ['year','ca40-year','all','西暦年'],
    ['artist','ca40-artist','all','名義'],
    ['category','ca40-category','all','分類'],
    ['order','ca40-order','asc','並び順']
  ];
  function newShare(){
    const start=$('ca236-range')?.dataset.ca236Start;
    const span=$('ca236-span')?.value;
    if(!/^\d{2}-\d{2}$/.test(start||'')||!['7','10','legacy'].includes(span))return null;
    const range=$('ca236-range')?.textContent?.trim()||'';
    const url=new URL('./',location.href);
    url.search='';
    url.searchParams.set('date',start);
    url.searchParams.set('ca_view','monthly'); // 既存の目次・折りたたみ復元との互換
    // 旧月間共有リンクは ca_m_start / ca_m_span を付けずに保持する。
    if(span!=='legacy'){url.searchParams.set('ca_m_start',start);url.searchParams.set('ca_m_span',span);}
    const conditions=[];
    for(const [name,id,defaultValue,label] of fields){
      const control=$(id);
      if(!control||control.value===defaultValue)continue;
      url.searchParams.set('ca_m_'+name,control.value);
      conditions.push(label+'：'+(control.selectedOptions?.[0]?.textContent?.trim()||control.value));
    }
    url.hash='ca40-monthly';
    const matched=String($('ca40-summary')?.textContent||'').match(/該当\s*([\d,]+)\s*件/);
    const count=matched?'（該当'+matched[1]+'件）':'';
    const desc=conditions.length?'｜'+conditions.join('・'):'';
    return {url:url.href,text:'今日はC&Aの何の日？｜'+range+'の登録記録'+Array.from(desc).slice(0,65).join('')+count};
  }
  function provideStatus(root){
    let status=root.querySelector('.ca-share-quiet-status');
    if(!status){status=document.createElement('span');status.className='ca-share-quiet-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');root.append(status);}
    return status;
  }
  async function copyLink(root){
    const share=newShare(),status=provideStatus(root);
    if(!share){status.textContent='表示中の期間を取得できませんでした。';return;}
    try{
      if(!navigator.clipboard?.writeText)throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(share.url);
      status.textContent='リンクをコピーしました。';return;
    }catch(_){/* フォールバック */}
    const tmp=document.createElement('textarea');tmp.value=share.url;tmp.style.position='fixed';tmp.style.left='-9999px';document.body.append(tmp);tmp.select();
    let success=false;try{success=document.execCommand('copy');}catch(_){}tmp.remove();
    if(success){status.textContent='リンクをコピーしました。';return;}
    status.textContent='下のURLを選択してコピーしてください。';
    let input=root.querySelector('.ca-share-quiet-manual');
    if(!input){input=document.createElement('input');input.className='ca-share-quiet-manual';input.type='text';input.readOnly=true;root.append(input);}
    input.value=share.url;input.focus();input.select();
  }
  function restore(){
    const params=new URLSearchParams(location.search);
    if(params.get('ca_view')!=='monthly')return;
    // 期間/起点日はca-ver40.jsが初期化時に復元済み。
    for(const [name,id] of fields){
      const value=params.get('ca_m_'+name);
      if(value===null||value.length>200)continue;
      const control=$(id);
      if(!control||!Array.from(control.options||[]).some(o=>o.value===value)||control.value===value)continue;
      control.value=value;
      control.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  function boot(){
    if($('ca229-month-share')||!$('ca40-monthly')||!$('ca40-summary'))return;
    const root=document.createElement('div');root.id='ca229-month-share';root.className='ca-share-quiet ca-share-unified ca229-month-share';
    root.setAttribute('role','group');root.setAttribute('aria-label','この期間の登録記録を共有');
    const label=document.createElement('span');label.className='ca-share-quiet-label';label.textContent='この期間の記録を共有';
    const post=document.createElement('a');post.textContent='𝕏 に投稿';post.href='https://twitter.com/intent/tweet';post.target='_blank';post.rel='noopener noreferrer';
    post.setAttribute('aria-label','表示中の期間をXに投稿');
    post.addEventListener('click',event=>{
      const share=newShare();if(!share){event.preventDefault();return;}
      const url=new URL('https://twitter.com/intent/tweet');url.searchParams.set('text',share.text);url.searchParams.set('url',share.url);post.href=url.href;
    });
    const copy=document.createElement('button');copy.type='button';copy.textContent='リンクをコピー';copy.setAttribute('aria-label','表示中の期間のリンクをコピー');
    copy.addEventListener('click',()=>copyLink(root));
    root.append(label,post,copy);
    $('ca40-summary').insertAdjacentElement('afterend',root);
    restore();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
