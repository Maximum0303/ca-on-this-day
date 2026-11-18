/* 今日はC&Aの何の日？ — 画面 Ver.1.8.2-46
 * 特別記念日（Chage / ASKAの誕生日、8月25日のデビュー周年）を毎年自動表示する。
 * 年齢・周年は表示時の日本時間の暦年に基づく。出来事レコードは生成しない。
 * Ver.44の既存周年バナーは置き換えて重複表示しない。
 */
(() => {
  'use strict';
  const day = document.getElementById('selected-date');
  const cal = document.getElementById('calendar-cells');
  if (!day || !cal || document.getElementById('ca46-special')) return;
  const oldBanner = document.getElementById('ca44-debut-anniversary');
  if (oldBanner) oldBanner.setAttribute('aria-hidden', 'true');
  const banner = document.createElement('aside');
  banner.id = 'ca46-special';
  banner.className = 'ca46-special';
  banner.setAttribute('aria-label', '特別な記念日');
  banner.hidden = true;
  day.insertAdjacentElement('afterend', banner);

  const japanYear = () => Number(new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tokyo', year: 'numeric'
  }).format(new Date()));
  const makeEl = (tag, cls, content) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    el.textContent = content;
    return el;
  };
  function specialFor(month, date, year) {
    if (month === 1 && date === 6) return {
      eyebrow: 'SPECIAL DAY / JANUARY 6',
      title: 'Chageの誕生日',
      number: String(year - 1958) + '歳',
      detail: '1958年1月6日生まれ。' + year + '年の誕生日で' + (year - 1958) + '歳。',
      note: '誕生日は毎年自動表示します。記録データを増やすものではありません。',
      source: 'https://www.universal-music.co.jp/chage-and-aska/biography/',
      major: false
    };
    if (month === 2 && date === 24) return {
      eyebrow: 'SPECIAL DAY / FEBRUARY 24',
      title: 'ASKAの誕生日',
      number: String(year - 1958) + '歳',
      detail: '1958年2月24日生まれ。' + year + '年の誕生日で' + (year - 1958) + '歳。',
      note: '誕生日は毎年自動表示します。記録データを増やすものではありません。',
      source: 'https://www.universal-music.co.jp/chage-and-aska/biography/',
      major: false
    };
    if (month === 8 && date === 25) {
      const anniversary = year - 1979;
      const major = anniversary >= 10 && anniversary % 5 === 0;
      return {
        eyebrow: major ? 'MILESTONE ANNIVERSARY / AUGUST 25' : 'DEBUT ANNIVERSARY / AUGUST 25',
        title: 'CHAGE and ASKA デビュー記念日',
        number: anniversary + '周年',
        detail: '1979年8月25日、シングル「ひとり咲き」でデビュー。' + year + '年はデビュー' + anniversary + '周年です。',
        note: major ? '5年ごとの節目です。記念行事の開催を意味するものではありません。' : '周年は自動計算です。記念公演や作品の記録は別に掲載しています。',
        source: 'https://www.chage-aska.net/history/',
        major
      };
    }
    return null;
  }
  function renderBanner() {
    const found = /^\s*(\d{1,2})月(\d{1,2})日\s*$/.exec(day.textContent || '');
    const special = found ? specialFor(Number(found[1]), Number(found[2]), japanYear()) : null;
    banner.hidden = !special;
    if (!special) {
      banner.replaceChildren();
      banner.classList.remove('ca46-major');
      return;
    }
    banner.classList.toggle('ca46-major', special.major);
    const eyebrow = makeEl('span', 'ca46-eyebrow', special.eyebrow);
    const headline = document.createElement('div');
    headline.className = 'ca46-headline';
    headline.append(makeEl('strong', 'ca46-heading', special.title), makeEl('span', 'ca46-number', special.number));
    const body = makeEl('p', 'ca46-body', special.detail);
    const foot = makeEl('small', 'ca46-note', special.note);
    const source = document.createElement('a');
    source.className = 'ca46-source';
    source.textContent = '公式プロフィール・年表を見る ↗';
    source.href = special.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    banner.replaceChildren(eyebrow, headline, body, foot, source);
  }
  function decorateCalendar() {
    const title = document.getElementById('calendar-title')?.textContent || '';
    const m = /^(\d{1,2})月$/.exec(title.trim());
    if (!m) return;
    const month = Number(m[1]);
    const specials = month === 1 ? {6:'Chageの誕生日'} :
                     month === 2 ? {24:'ASKAの誕生日'} :
                     month === 8 ? {25:'C&Aデビュー記念日'} : {};
    for (const button of cal.querySelectorAll('button[data-day]')) {
      const n = Number(button.dataset.day);
      if (!Object.prototype.hasOwnProperty.call(specials, n)) continue;
      button.classList.add('ca46-special-day');
      button.setAttribute('aria-label', `${month}月${n}日・${specials[n]}`);
      button.title = specials[n];
      if (!button.querySelector('.ca46-day-star')) {
        const mark = makeEl('span', 'ca46-day-star', '★');
        mark.setAttribute('aria-hidden', 'true');
        button.appendChild(mark);
      }
    }
  }
  new MutationObserver(renderBanner).observe(day, {childList:true, characterData:true, subtree:true});
  new MutationObserver(decorateCalendar).observe(cal, {childList:true});
  const legend=document.querySelector('.calendar-legend');
  if (legend && !legend.querySelector('.ca46-legend')) {
    const explain=makeEl('span','ca46-legend','★ 特別記念日');
    legend.append('　',explain);
  }
  renderBanner();
  decorateCalendar();
})();
