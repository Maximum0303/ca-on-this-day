/* 今日はC&Aの何の日？ — Ver.2.2.4 左上メニュー。データ変更なし */
(()=>{'use strict';
const boot=()=>{
 const header=document.querySelector('.site-header');
 const index=document.querySelector('#ca210-index');
 if(!header||!index||document.getElementById('ca224-button'))return;
 const style=document.createElement('style');
 style.textContent=`
 body.ca224-ready .topnav,body.ca224-ready #ca210-index,body.ca224-ready .ca210-float-index{display:none!important}
 body.ca224-ready .site-header{padding-left:58px}
 #ca224-button{position:fixed;top:max(10px,env(safe-area-inset-top));left:max(10px,env(safe-area-inset-left));z-index:91;width:48px;height:48px;border:1px solid #e8bc73;border-radius:11px;background:#203653;color:#f8e2ba;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;box-shadow:0 4px 14px #0006;cursor:pointer}
 #ca224-button .bars{display:grid;gap:4px}#ca224-button .bars i{display:block;width:23px;height:2px;background:currentColor;border-radius:2px}#ca224-button small{font-size:9px;line-height:1}
 #ca224-overlay{position:fixed;inset:0;background:#061022bb;z-index:92}#ca224-panel{position:fixed;top:0;bottom:0;left:0;width:min(380px,92vw);z-index:93;overflow-y:auto;box-sizing:border-box;padding:22px 18px calc(30px + env(safe-area-inset-bottom));border-right:1px solid #e8bc73;background:linear-gradient(145deg,#1b304e,#101c31);box-shadow:15px 0 35px #0007;color:white}
 #ca224-panel[hidden],#ca224-overlay[hidden]{display:none!important}
 .ca224-head{display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #e8bc7355;padding-bottom:14px}.ca224-head strong{font-size:23px;color:#f8e2ba}.ca224-close{width:44px;height:44px;border:1px solid #788ca7;border-radius:9px;background:#2c4667;color:white;font-size:26px;cursor:pointer}
 .ca224-links{display:grid;gap:9px;padding:20px 0}.ca224-links a{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:11px 14px;min-height:50px;box-sizing:border-box;border:1px solid #ffffff38;border-radius:10px;background:#233955;color:white;text-decoration:none;font-size:15px;font-weight:700;overflow-wrap:anywhere}.ca224-links a::after{content:'›';font-size:23px;color:#e8bc73}.ca224-links a:hover{background:#365374;border-color:#e8bc73}
 #ca224-button:focus-visible,#ca224-panel button:focus-visible,#ca224-panel a:focus-visible{outline:3px solid #f8e2ba;outline-offset:3px}body.ca224-open{overflow:hidden}
 @media(max-width:520px){body.ca224-ready .site-header{padding-left:53px}#ca224-button{width:44px;height:44px;left:9px}#ca224-panel{padding:17px 15px}}
 `;
 document.head.append(style);
 const button=document.createElement('button');button.id='ca224-button';button.type='button';button.setAttribute('aria-label','目次を開く');button.setAttribute('aria-controls','ca224-panel');button.setAttribute('aria-expanded','false');button.innerHTML='<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><small aria-hidden="true">目次</small>';
 const overlay=document.createElement('div');overlay.id='ca224-overlay';overlay.hidden=true;
 const panel=document.createElement('aside');panel.id='ca224-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','ページ内の目次');panel.innerHTML='<div class="ca224-head"><strong>ページ内の目次</strong><button type="button" class="ca224-close" aria-label="目次を閉じる">×</button></div><nav class="ca224-links" aria-label="ページ内の目次"></nav>';
 const links=panel.querySelector('nav');const closeButton=panel.querySelector('button');let previous=null;
 const close=()=>{if(panel.hidden)return;panel.hidden=true;overlay.hidden=true;document.body.classList.remove('ca224-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','目次を開く');previous?.focus?.({preventScroll:true});};
 const open=()=>{if(!panel.hidden)return;previous=document.activeElement;buildLinks();panel.hidden=false;overlay.hidden=false;document.body.classList.add('ca224-open');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','目次を閉じる');closeButton.focus({preventScroll:true});};
 const buildLinks=()=>{links.replaceChildren();const src=index.querySelectorAll('.ca210-index-links a[href^="#"]');for(const item of src){const a=document.createElement('a');a.textContent=item.textContent.trim();const u=new URL('./',location.href);u.search='';u.hash=item.hash;a.href=u.href;a.addEventListener('click',close);links.append(a);}};
 button.addEventListener('click',()=>panel.hidden?open():close());closeButton.addEventListener('click',close);overlay.addEventListener('click',close);
 document.addEventListener('keydown',e=>{if(panel.hidden)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key!=='Tab')return;const items=[closeButton,...links.querySelectorAll('a')];if(e.shiftKey&&document.activeElement===items[0]){e.preventDefault();items.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===items.at(-1)){e.preventDefault();items[0].focus();}});
 header.prepend(button);document.body.append(overlay,panel);document.body.classList.add('ca224-ready');buildLinks();
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
