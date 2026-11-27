/* 今日はC&Aの何の日？ — 画面 Ver.2.2.5 / 第56回
 * 検索の詳細条件を折りたたみ、現在の条件を確認・個別解除できるようにする。
 * data/events.*・既存検索処理・URL仕様・履歴には変更しない。
 */
(() => {
  'use strict';
  const boot = () => {
    const browse = document.getElementById('browse');
    const filters = browse?.querySelector('.filters');
    if (!browse || !filters || document.getElementById('ca225-details-toggle')) return;

    const fields = [
      {id:'keyword', name:'キーワード', reset:'', event:'input'},
      {id:'artist-filter', name:'名義', reset:'all'},
      {id:'category-filter', name:'分類', reset:'all'},
      {id:'decade-filter', name:'年代', reset:'all', extra:true},
      {id:'year-filter', name:'西暦年', reset:'all', extra:true},
      {id:'status-filter', name:'記録の状態', reset:'all', extra:true},
      {id:'verification-filter', name:'確認区分', reset:'all', extra:true},
      {id:'sort-filter', name:'表示順', reset:'asc', extra:true},
    ];
    if (fields.some(f => !document.getElementById(f.id))) return;
    for (const f of fields) {
      const control = document.getElementById(f.id);
      if (f.extra) control.closest('label')?.classList.add('ca225-extra');
    }

    const style = document.createElement('style');
    style.id='ca225-search-style';
    style.textContent = `
      .ca225-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:0 0 12px}
      .ca225-details-toggle{display:inline-flex;align-items:center;justify-content:space-between;gap:14px;min-height:44px;padding:9px 16px;background:#243c5e;border:1px solid rgba(232,188,115,.65);border-radius:9px;color:#f8e2ba;font-size:13px;font-weight:700;cursor:pointer}
      .ca225-details-toggle::after{content:'⌄';font-size:19px;line-height:1;transform:rotate(0deg)}
      .ca225-details-toggle[aria-expanded="true"]::after{transform:rotate(180deg)}
      .ca225-details-toggle:hover{background:#355575}
      .ca225-summary{font-size:12px;color:#becce0;line-height:1.5}
      .ca225-active{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px}
      .ca225-active[hidden]{display:none!important}
      .ca225-active-label{font-size:12px;font-weight:700;color:#d3deeb;margin-right:3px}
      .ca225-chip{display:inline-flex;align-items:center;gap:8px;min-height:36px;max-width:100%;padding:7px 11px;border:1px solid rgba(232,188,115,.45);border-radius:20px;background:#213853;color:#ffe7b5;font-size:12px;line-height:1.4;cursor:pointer;text-align:left;overflow-wrap:anywhere;white-space:normal}
      .ca225-chip:hover{background:#335577;border-color:#f8e2ba}
      .ca225-chip-x{font-size:17px;line-height:1;color:#f8e2ba}
      .ca225-details-toggle:focus-visible,.ca225-chip:focus-visible{outline:3px solid #f8e2ba;outline-offset:3px}
      #browse .filters.ca225-compact:not(.ca225-expanded){grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr)}
      #browse .filters.ca225-compact:not(.ca225-expanded) .search-wrap{grid-column:auto}
      #browse .filters.ca225-compact:not(.ca225-expanded) label.ca225-extra{display:none!important}
      @media(max-width:700px){
        #browse .filters.ca225-compact:not(.ca225-expanded){grid-template-columns:repeat(2,minmax(0,1fr))}
        #browse .filters.ca225-compact:not(.ca225-expanded) .search-wrap{grid-column:1 / -1}
      }
      @media(max-width:380px){#browse .filters.ca225-compact:not(.ca225-expanded){grid-template-columns:minmax(0,1fr)} }
    `;
    document.head.appendChild(style);

    const toolbar = document.createElement('div');
    toolbar.className = 'ca225-toolbar';
    const toggle = document.createElement('button');
    toggle.id = 'ca225-details-toggle';
    toggle.className = 'ca225-details-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls','ca225-filters');
    const summary = document.createElement('span');
    summary.className = 'ca225-summary';
    summary.id = 'ca225-summary';
    summary.setAttribute('aria-live','polite');
    toolbar.append(toggle, summary);

    const active = document.createElement('div');
    active.className = 'ca225-active';
    active.id = 'ca225-active';
    active.setAttribute('role','group');
    active.setAttribute('aria-label','選択中の検索条件（押すと解除）');
    active.hidden = true;
    filters.id = 'ca225-filters';
    filters.classList.add('ca225-compact');
    filters.before(toolbar, active);

    const valueOf = f => document.getElementById(f.id).value;
    const nonDefault = f => valueOf(f) !== f.reset;
    const optionText = f => {
      const el = document.getElementById(f.id);
      if (f.id === 'keyword') return el.value.trim();
      return el.selectedOptions[0]?.textContent.trim() || el.value;
    };
    const expandedInitially = fields.some(f => f.extra && nonDefault(f));
    let expanded = expandedInitially;
    const setExpanded = next => {
      expanded = next;
      filters.classList.toggle('ca225-expanded',expanded);
      toggle.setAttribute('aria-expanded',String(expanded));
      toggle.textContent = expanded ? '詳細条件を閉じる' : '詳細条件を表示';
    };
    setExpanded(expandedInitially);
    toggle.addEventListener('click', () => { setExpanded(!expanded); scheduleRender(); });

    let scheduled = false;
    function caParseQueryTokens(source) {
  if(window.CA_SEARCH_ALIASES)return window.CA_SEARCH_ALIASES.parse(source);
      const text = String(source ?? '').normalize('NFKC');
      const tokens = [];
      let word = '', phrase = false, closing = '';
      const push = () => {
        const value = word.trim();
        if (value) tokens.push({value, phrase});
        word = ''; phrase = false;
      };
      for (const ch of text) {
        if (closing) {
          if (ch === closing) { push(); closing = ''; }
          else word += ch;
          continue;
        }
        if (ch === '"' || ch === '“' || ch === '「') {
          push(); closing = ch === '“' ? '”' : (ch === '「' ? '」' : '"');
          phrase = true;
        } else if (/\s/.test(ch)) {
          push();
        } else {
          word += ch;
        }
      }
      push();
      return tokens;
    }
    const render = () => {
      scheduled = false;
      const terms=caParseQueryTokens(document.getElementById('keyword').value);
      const otherFields=fields.slice(1).filter(nonDefault);
      const count=terms.length+otherFields.length;
      active.replaceChildren();
      active.hidden=count===0;
      if(count){
        const label=document.createElement('span');
        label.className='ca225-active-label';
        label.textContent=terms.length>1?'選択中の条件（AND検索）':'選択中の条件';
        active.append(label);
      }
      const appendChip=(desc,remove)=>{
        const btn=document.createElement('button');
        btn.type='button'; btn.className='ca225-chip';
        btn.setAttribute('aria-label',desc+' を解除');
        const label=document.createElement('span');label.textContent=desc;
        const cross=document.createElement('span');
        cross.className='ca225-chip-x';cross.setAttribute('aria-hidden','true');cross.textContent='×';
        btn.append(label,cross);btn.addEventListener('click',remove);active.append(btn);
      };
      terms.forEach((term,i)=>{
        const desc=(term.phrase?'フレーズ：':'キーワード：')+term.value;
        appendChip(desc,()=>{
          const rest=terms.filter((_,j)=>j!==i).map(item=>item.phrase?'"'+item.value+'"':item.value).join(' ');
          const input=document.getElementById('keyword');
          input.value=rest;
          input.dispatchEvent(new Event('input',{bubbles:true}));
          scheduleRender();
        });
      });
      for(const f of otherFields){
        const desc=f.name+'：'+optionText(f);
        appendChip(desc,()=>{
          const el=document.getElementById(f.id);
          el.value=f.reset;
          el.dispatchEvent(new Event(f.event||'change',{bubbles:true}));
          scheduleRender();
        });
      }
      const mode=expanded?'詳細条件を含むすべての検索項目を表示中':'よく使う条件だけを表示中';
      const keywordMode=terms.length>1?'AND検索 '+terms.length+'語 ／ ':terms.some(x=>x.phrase)?'フレーズ検索 ／ ':'';
      summary.textContent=count?keywordMode+'選択中の条件 '+count+'件 ／ '+mode:mode;
    };
    const scheduleRender = () => {
      if (scheduled) return;
      scheduled=true;
      requestAnimationFrame(render);
    };
    fields.forEach(f=>{
      const el=document.getElementById(f.id);
      el.addEventListener(f.event || 'change',scheduleRender);
    });
    // 既存の「条件をクリア」や「同じ日付の記録をすべて見る」は
    // プログラムから値を変更するため、クリック処理の実行後に再読込する。
    ['reset-filters','all-day'].forEach(id=>{
      document.getElementById(id)?.addEventListener('click',scheduleRender);
    });
    render();
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
