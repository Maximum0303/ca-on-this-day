/* 今日はC&Aの何の日？ — 画面 Ver.2.2.15 / 月日への直接移動
 * 月送り・日付選択の既存処理を呼び出す表示専用機能。
 * 登録データ・確認状況・出典・検索条件などの正規データは変更しない。
 * app.js の後に defer で読み込むこと。
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const daysIn = month => new Date(Date.UTC(2000, month, 0)).getUTCDate();
  const selected = () => {
    const m = String($('selected-date')?.textContent || '').match(/(\d{1,2})月\s*(\d{1,2})日/);
    return m ? {month:Number(m[1]),day:Number(m[2])} : null;
  };
  const viewedMonth = () => {
    const m = String($('calendar-title')?.textContent || '').match(/(\d{1,2})月/);
    return m ? Number(m[1]) : null;
  };
  const boot = () => {
    const card = document.querySelector('#calendar .calendar-card');
    const nav = card?.querySelector('.month-nav');
    const cells = $('calendar-cells');
    if (!card || !nav || !cells || !$('month-prev') || !$('month-next') || $('ca2215-jump')) return;

    const css = document.createElement('style');
    css.id = 'ca2215-jump-style';
    css.textContent = `
      #ca2215-jump {margin:12px 0 13px;border:1px solid rgba(166,185,208,.27);border-radius:9px;background:rgba(18,34,57,.3);}
      #ca2215-jump summary {min-height:44px;box-sizing:border-box;padding:11px 13px;cursor:pointer;color:#e7d4a7;font-size:13px;font-weight:700;line-height:1.6;}
      #ca2215-jump .ca2215-form {display:flex;flex-wrap:wrap;gap:10px;align-items:end;padding:2px 13px 14px;border-top:1px solid rgba(166,185,208,.2);}
      #ca2215-jump label {display:grid;gap:5px;color:#d0ddeb;font-size:12px;line-height:1.5;min-width:0;}
      #ca2215-jump select {appearance:auto;width:100%;min-width:100px;min-height:44px;box-sizing:border-box;padding:8px 10px;border-radius:7px;border:1px solid #7187a4;background:#1c304d;color:#fff;font-size:15px;}
      #ca2215-jump .ca2215-submit {min-height:44px;box-sizing:border-box;padding:8px 16px;border:1px solid #dcb77a;border-radius:7px;background:#314969;color:#fbe5bc;font-size:13px;font-weight:700;cursor:pointer;}
      #ca2215-jump .ca2215-submit:hover {background:#405b7d;}
      #ca2215-jump summary:focus-visible,#ca2215-jump select:focus-visible,#ca2215-jump button:focus-visible {outline:2px solid #f7d899;outline-offset:3px;}
      #ca2215-jump .ca2215-message {flex-basis:100%;min-height:0;margin:0!important;color:#c9d6e7;font-size:11px;line-height:1.5;}
      #ca2215-jump .ca2215-message:empty {display:none;}
      @media(max-width:460px){#ca2215-jump .ca2215-form{gap:8px;padding:2px 10px 12px}#ca2215-jump label{flex:1 1 90px}#ca2215-jump select{min-width:0}#ca2215-jump .ca2215-submit{flex:1 1 100%;width:100%}}
    `;
    document.head.append(css);

    const details = document.createElement('details');
    details.id = 'ca2215-jump';
    details.innerHTML = '<summary>月日を直接指定して移動</summary>';
    const form = document.createElement('form');
    form.className = 'ca2215-form';
    const monthLabel = document.createElement('label');
    const dayLabel = document.createElement('label');
    const monthSelect = document.createElement('select');
    const daySelect = document.createElement('select');
    monthSelect.id = 'ca2215-month';
    daySelect.id = 'ca2215-day';
    monthSelect.setAttribute('aria-label','移動する月');
    daySelect.setAttribute('aria-label','移動する日');
    monthLabel.append('月',monthSelect);
    dayLabel.append('日',daySelect);
    for (let m=1;m<=12;m++) {
      const opt=document.createElement('option');opt.value=String(m);opt.textContent=m+'月';monthSelect.append(opt);
    }
    const submit=document.createElement('button');submit.type='submit';submit.className='ca2215-submit';submit.textContent='この日を表示';
    const feedback=document.createElement('p');feedback.className='ca2215-message';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
    form.append(monthLabel,dayLabel,submit,feedback);
    details.append(form);
    nav.insertAdjacentElement('afterend',details);

    const populateDays = (month, targetDay) => {
      const max=daysIn(month);
      if (!(max>=28&&max<=31)) return;
      const day=Math.max(1,Math.min(max,targetDay||1));
      daySelect.replaceChildren();
      for(let d=1;d<=max;d++) {
        const o=document.createElement('option');o.value=String(d);o.textContent=d+'日';daySelect.append(o);
      }
      daySelect.value=String(day);
    };
    const syncInputs = () => {
      const current=selected() || {month:viewedMonth()||1,day:1};
      monthSelect.value=String(current.month);
      populateDays(current.month,current.day);
      feedback.textContent='';
    };
    // toggle イベントは非同期に届くため、選択操作中の値を上書きしないよう開く直前に同期する。
    details.querySelector('summary').addEventListener('click',()=>{if(!details.open)syncInputs();});
    monthSelect.addEventListener('change',()=>populateDays(Number(monthSelect.value),Number(daySelect.value)));
    syncInputs();

    form.addEventListener('submit',event=>{
      event.preventDefault();
      const targetMonth=Number(monthSelect.value),targetDay=Number(daySelect.value);
      if(!Number.isInteger(targetMonth)||targetMonth<1||targetMonth>12||!Number.isInteger(targetDay)||targetDay<1||targetDay>daysIn(targetMonth)){
        feedback.textContent='正しい月日を選択してください。';return;
      }
      let current=viewedMonth();
      if(current===null||current<1||current>12){feedback.textContent='カレンダーを読み込めませんでした。';return;}
      const forward=(targetMonth-current+12)%12;
      const backward=(current-targetMonth+12)%12;
      const arrow=$(forward<=backward?'month-next':'month-prev');
      const steps=Math.min(forward,backward);
      for(let i=0;i<steps;i++) arrow.click();
      current=viewedMonth();
      if(current!==targetMonth){feedback.textContent='月の移動ができませんでした。';return;}
      const button=Array.from(cells.querySelectorAll('button[data-day]')).find(b=>Number(b.dataset.day)===targetDay);
      if(!button){feedback.textContent='指定した日付を表示できませんでした。';return;}
      button.click();
      const now=selected();
      if(!now||now.month!==targetMonth||now.day!==targetDay){feedback.textContent='日付の移動ができませんでした。';return;}
      details.open=false;
      const panel=document.querySelector('#calendar .day-panel');
      if(panel){try{panel.scrollIntoView({behavior:'smooth',block:'start'});}catch(_){}}
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
