/* Ver.3.7.5: ライブ索引・継続シリーズ階層化。データ変更なし。 */
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
const seriesRecords=Object.freeze({
  "v14-chage-2022-billboard-001": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-billboard-002": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-billboard-003": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-billboard-004": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v15-0052": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v15-0053": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "64 to 65",
    "sub": "",
    "series": true
  },
  "v15-0054": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0055": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0056": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0057": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0116": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0117": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "65 to 66",
    "sub": "",
    "series": true
  },
  "v15-0118": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "通常公演",
    "series": true
  },
  "v15-0119": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "通常公演",
    "series": true
  },
  "v15-0120": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "通常公演",
    "series": true
  },
  "v15-0121": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "通常公演",
    "series": true
  },
  "v15-0196": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "Echoes of Friendship with Yuko Ishikawa",
    "series": true
  },
  "v15-0197": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "Echoes of Friendship with Yuko Ishikawa",
    "series": true
  },
  "v15-0198": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "Echoes of Friendship with Yuko Ishikawa",
    "series": true
  },
  "v15-0199": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "66 to 67",
    "sub": "Echoes of Friendship with Yuko Ishikawa",
    "series": true
  },
  "v15-0200": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2025年 夏公演",
    "series": true
  },
  "v15-0201": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2025年 夏公演",
    "series": true
  },
  "v15-0202": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2025年 夏公演",
    "series": true
  },
  "v15-0203": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2025年 夏公演",
    "series": true
  },
  "v16-0034": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2026年 冬・バースデー公演",
    "series": true
  },
  "v16-0035": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2026年 冬・バースデー公演",
    "series": true
  },
  "v16-0036": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2026年 冬・バースデー公演",
    "series": true
  },
  "v16-0037": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "67 to 68",
    "sub": "2026年 冬・バースデー公演",
    "series": true
  },
  "v16-0071": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "v16-0072": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-billboard-osaka-1st": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-billboard-osaka-2nd": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-billboard-tokyo-1st": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-billboard-tokyo-2nd": {
    "parent": "series-billboard",
    "label": "Chage Billboard Live",
    "section": "68 to 69",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-001": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-002": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-003": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-004": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-005": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-006": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-007": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-008": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-009": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-010": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-011": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-012": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-013": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-014": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-015": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-016": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-017": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-018": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-019": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-020": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-021": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-022": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-023": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-024": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-025": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-026": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-027": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-028": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-029": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-030": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-031": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-032": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-033": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-034": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2009-035": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2009年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-001": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-002": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-003": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-004": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-005": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-006": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-007": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-008": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-009": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-010": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-011": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-012": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-013": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-chage-hosomichi-2010-014": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2010年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-001": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-002": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-003": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-004": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-005": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-006": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-007": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-008": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-009": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-010": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-011": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-012": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-013": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-014": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-015": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-016": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-017": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-018": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-hosomichi-2011-019": {
    "parent": "series-hosomichi-original",
    "label": "Chageの細道",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-001": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-002": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-003": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-004": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-005": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v14-chage-2022-hosomichi-006": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2022年",
    "sub": "",
    "series": true
  },
  "v15-0035": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0036": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0037": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0038": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0039": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0040": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0041": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0042": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0043": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0044": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0045": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0046": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0047": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "live-293-20230527-chage-hawaiians": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2023年",
    "sub": "",
    "series": true
  },
  "v15-0085": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0086": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0087": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0088": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0089": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0090": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0091": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0092": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0093": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0094": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0095": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0096": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0097": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0098": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0099": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0100": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0101": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0102": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0103": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0104": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0105": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0106": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0107": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0108": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0109": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v18223-2024-01-26-chage-091": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v18223-2024-03-05-chage-095": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "live-293-20240420-chage-hawaiians": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "live-293-20240421-chage-hawaiians": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v18223-2024-10-06-chage-108": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2024年",
    "sub": "",
    "series": true
  },
  "v15-0163": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0164": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0165": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0166": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0167": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0168": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0169": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0170": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0171": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0172": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0173": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0174": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0175": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0176": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0177": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0178": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0179": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0180": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0181": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0182": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0183": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0184": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0185": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0186": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v15-0187": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "live-293-20250517-chage-hawaiians": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v18224-2025-08-03-chage-084": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2025年",
    "sub": "",
    "series": true
  },
  "v16-0038": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0039": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0040": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0041": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0042": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0043": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0044": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0045": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0046": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0047": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0048": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0049": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0050": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0051": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0052": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0053": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0054": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0055": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0056": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0057": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0058": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v16-0059": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-hosomichi-001": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2027年",
    "sub": "",
    "series": true
  },
  "v41-2027-chage-hosomichi-002": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2027年",
    "sub": "",
    "series": true
  },
  "v18224-2026-04-29-chage-134": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "live-293-20260530-chage-hawaiians": {
    "parent": "series-hosomichi",
    "label": "Chageのずっと細道",
    "section": "2026年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-001": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-002": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-003": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-004": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-005": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2011-006": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2011年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-001": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-002": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-003": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-004": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-005": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-2012-006": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2012年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-001": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-002": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-003": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-004": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-005": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "live-v11-chage-tea-again-2013-006": {
    "parent": "series-chakai",
    "label": "Chageの茶会",
    "section": "2013年",
    "sub": "",
    "series": true
  },
  "v12-xmas14": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2014年",
    "sub": "Chage Christmas Dinner Show 2014",
    "series": true
  },
  "v12-yearend14": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2014年",
    "sub": "Chage Year End Dinner Show 2014",
    "series": true
  },
  "v12-xmas15-1": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2015年",
    "sub": "Chage X’mas Dinner Show 2015",
    "series": true
  },
  "v12-xmas15-2": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2015年",
    "sub": "Chage X’mas Dinner Show 2015",
    "series": true
  },
  "v12-xmas15-3": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2015年",
    "sub": "Chage X’mas Dinner Show 2015",
    "series": true
  },
  "v12-yearend15": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2015年",
    "sub": "Chage Year End Dinner Show 2015 ～夢の大忘年会～",
    "series": true
  },
  "v12-xmas16-01": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2016年",
    "sub": "Chage X’mas Dinner Show 2016",
    "series": true
  },
  "v12-xmas16-02": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2016年",
    "sub": "Chage X’mas Dinner Show 2016",
    "series": true
  },
  "v12-xmas16-03": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2016年",
    "sub": "Chage X’mas Dinner Show 2016",
    "series": true
  },
  "v12-xmas16-04": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2016年",
    "sub": "Chage X’mas Dinner Show 2016",
    "series": true
  },
  "v13-ch17-xmas-001": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2017年",
    "sub": "Chage Christmas Dinner Show 2017",
    "series": true
  },
  "v13-ch17-xmas-002": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2017年",
    "sub": "Chage Christmas Dinner Show 2017",
    "series": true
  },
  "v13-ch17-xmas-003": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2017年",
    "sub": "Chage Christmas Dinner Show 2017",
    "series": true
  },
  "v13-ch18-xmas": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2018年",
    "sub": "Chage Christmas Dinner Show 2018",
    "series": true
  },
  "v13-ch19-xmas": {
    "parent": "series-chage-dinner",
    "label": "Chage ディナーショー",
    "section": "2019年",
    "sub": "Chage Christmas Dinner Show 2019",
    "series": true
  },
  "v12-fc14-001": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-002": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-003": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-004": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-005": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-006": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-007": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-008": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-009": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-010": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-011": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-012": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-013": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-014": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-015": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-016": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-017": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-018": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-019": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-020": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-021": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-022": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-023": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-024": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-025": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-026": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-027": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-028": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-029": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-030": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc14-031": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2014年",
    "sub": "Chage Fan Meeting Tour 2014 ～青いハンカチーフを・・・～",
    "series": true
  },
  "v12-fc15-date-01": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-02": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-03": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-04": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-05": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-06": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-07": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-08": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc15-date-09": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2015年",
    "sub": "Chage Fan Meeting 2015 ～57歳はじめての・・・～",
    "series": true
  },
  "v12-fc16-01": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-02": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-03": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-04": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-05": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-06": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-07": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-08": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-09": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-10": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v12-fc16-11": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2016年",
    "sub": "Chage Fan Meeting 2016 ～ここがファンミのど真ん中！～",
    "series": true
  },
  "v13-ch17-fan-001": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-002": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-003": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-004": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-005": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-006": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-007": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-008": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-009": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-010": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v13-ch17-fan-011": {
    "parent": "series-chage-fan",
    "label": "Chage ファンミーティング",
    "section": "2017年",
    "sub": "Chage Fan Meeting 2017 ♪ドレミファ ファミリー♪",
    "series": true
  },
  "v18222-2022-12-05-aska-068": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（1st公演）",
    "series": true
  },
  "v18222-2022-12-05-aska-069": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（2nd公演）",
    "series": true
  },
  "v18222-2022-12-20-aska-070": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（1st公演）",
    "series": true
  },
  "v18222-2022-12-20-aska-071": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（2nd公演）",
    "series": true
  },
  "v18222-2022-12-22-aska-072": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（1st公演）",
    "series": true
  },
  "v18222-2022-12-22-aska-073": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（2nd公演）",
    "series": true
  },
  "v18222-2022-12-26-aska-074": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（1st公演）",
    "series": true
  },
  "v18222-2022-12-26-aska-075": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2022年",
    "sub": "ASKA Premium Dinner Show 2022（2nd公演）",
    "series": true
  },
  "v15-0027": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0028": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0029": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0030": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0031": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0032": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0033": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0034": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2023年",
    "sub": "ASKA Dinner Show 2023",
    "series": true
  },
  "v15-0156": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2025年",
    "sub": "ASKA Dinner Show 2025",
    "series": true
  },
  "v15-0157": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2025年",
    "sub": "ASKA Dinner Show 2025",
    "series": true
  },
  "v15-0158": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2025年",
    "sub": "ASKA Dinner Show 2025",
    "series": true
  },
  "v15-0159": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2025年",
    "sub": "ASKA Dinner Show 2025",
    "series": true
  },
  "v15-0160": {
    "parent": "series-aska-dinner",
    "label": "ASKA ディナーショー",
    "section": "2025年",
    "sub": "ASKA Dinner Show 2025",
    "series": true
  }
});
const parentFor=e=>parentTours[rawTourKey(e)]||(Object.prototype.hasOwnProperty.call(seriesRecords,e.id)?seriesRecords[e.id]:null);
const tourKey=e=>{const p=parentFor(e);return p?JSON.stringify([text(e.artist)||'名義未設定','parent:'+p.parent]):rawTourKey(e);};
const sectionFor=e=>parentFor(e)?.section||'other';
const sectionLabel=e=>parentFor(e)?.series?sectionFor(e):sectionNames[sectionFor(e)];
const subLabel=e=>parentFor(e)?.series?parentFor(e).sub||'':'';
function sectionsFor(records){const map=new Map();for(const e of records){const k=sectionFor(e);if(!map.has(k))map.set(k,{key:k,label:sectionLabel(e),records:[]});map.get(k).records.push(e);}const arr=[...map.values()];if(!records.some(e=>parentFor(e)?.series))arr.sort((a,b)=>Object.keys(sectionNames).indexOf(a.key)-Object.keys(sectionNames).indexOf(b.key));return arr;}
function subsectionsFor(records){const m=new Map();for(const e of records){const k=subLabel(e);if(!m.has(k))m.set(k,[]);m.get(k).push(e);}return [...m.entries()];}
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
  g.search=norm([g.label,g.sub,...g.names,...(mode==='tour'?[...g.titles.keys(),...g.records.map(e=>e.tourId),...(g.parent?g.records.map(e=>[sectionLabel(e),subLabel(e)].join(" ")):[])]:mode==='venue'?g.records.map(e=>e.venue):[])].join(' '));
 }
 return [...map.values()].sort((a,b)=>mode==='tour'?(Number(a.noTour)-Number(b.noTour)||cmp(a.startDate,b.startDate)||byArtist(a.sub,b.sub)||cmp(a.label,b.label)||cmp(a.key,b.key)):mode==='venue'?(byPref(a.sub,b.sub)||Number(a.label==='会場未登録')-Number(b.label==='会場未登録')||cmp(a.label,b.label)):byPref(a.label,b.label));
}
const api={groups,live,byArtist,byPref,tourStarts,sectionFor,sectionsFor,subsectionsFor,statusSummary,tourKey};if(typeof module!=='undefined'&&module.exports){module.exports=api;return;}
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
 function makeRecord(e){const li=mk('li','ca320-record'),meta=mk('div','ca320-meta',[text(e.date),text(e.artist),status(e),selected?.parent?[sectionLabel(e),subLabel(e)].filter(Boolean).join(" ／ "):''].filter(Boolean).join(' ／ ')),link=mk('a','',text(e.title)||'公演名未登録');link.href=recordUrl(e);window.CA_INDEX_RETURN?.link(link,'ca320-index',()=>({mode:mode.value,artist:artist.value,pref:pref.value,q:q.value,selected:selected?.key,glimit,rlimit,sectionMode}));li.append(meta,link);const venue=[region(e)==='地域未登録'?'':region(e),text(e.venue)].filter((v,i,a)=>v&&a.indexOf(v)===i).join('・');if(venue)li.append(mk('p','',venue));return li;}
 function drawRecords(){result.replaceChildren();info.replaceChildren();info.hidden=true;title.textContent=selected?`${selected.label}（${selected.records.length}件）`:'';recordMore.hidden=true;if(!selected)return;
  if(selected.parent){info.hidden=false;info.append(mk('p','ca374-status',statusSummary(selected.records)+' ／ 記録件数（実施公演総数とは異なります）'));const controls=mk('div','ca374-tour-controls');for(const [value,label] of [[true,selected.records.some(e=>parentFor(e)?.series)?'年次・企画別':'公演区分別'],[false,'全記録を日付順']]){const b=mk('button','ca320-action',label);b.type='button';b.setAttribute('aria-pressed',String(sectionMode===value));b.addEventListener('click',()=>{sectionMode=value;rlimit=30;drawRecords();});controls.append(b);}info.append(controls);
   if(sectionMode){for(const {key,label,records} of sectionsFor(selected.records)){const li=mk('li','ca374-section'),d=mk('details'),sum=mk('summary','',label+'（'+records.length+'件）'),ul=mk('ul');d.open=!window.matchMedia('(max-width:760px)').matches;d.append(sum,mk('div','ca374-status',statusSummary(records)),ul);for(const [sub,items] of subsectionsFor(records)){if(!sub){for(const e of items)ul.append(makeRecord(e));continue;}const item=mk("li","ca374-section"),nested=mk("details"),su=mk("summary","",sub+"（"+items.length+"件）"),inner=mk("ul");nested.open=!window.matchMedia("(max-width:760px)").matches;nested.append(su,mk("div","ca374-status",statusSummary(items)),inner);for(const e of items)inner.append(makeRecord(e));item.append(nested);ul.append(item);}li.append(d);result.append(li);}return;}
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
