/* Ver.3.1.0: 検索専用の別名辞書。登録データは変更しない。 */
(()=>{
'use strict';
const norm=s=>String(s??'').normalize('NFKC').toLocaleLowerCase('ja-JP').replace(/[‐‑‒–—−]/g,'-');
const key=s=>norm(s).replace(/[\s・.･()（）\-]/g,'');
const groups=[];
const artist=(...names)=>groups.push({field:'artist',names});
const venue=(...names)=>groups.push({field:'venue',names});
const facility=(names,suffixes)=>groups.push({field:'venue',names,suffixes});
artist('CHAGE and ASKA','CHAGE&ASKA','CHAGE AND ASUKA','CHAGE&ASUKA','チャゲ＆飛鳥','チャゲ＆アスカ','チャゲアス','CHAGE and ASKA（チャゲ＆飛鳥）');
artist('Chage','チャゲ');
artist('ASKA','飛鳥涼','アスカ');
artist('MULTI MAX','MULTI-MAX','マルチマックス','マルチ・マックス');
// 札幌市 https://www.city.sapporo.jp/s362/155519.html
venue('北海道厚生年金会館','札幌厚生年金会館','北海道厚生年金会館ホール','札幌厚生年金会館ホール','北海道厚生年金会館大ホール','札幌厚生年金会館大ホール','北海道厚生年金会館（札幌）','さっぽろ芸術文化の館','ニトリ文化ホール');
// オリックス https://www.orix.co.jp/grp/company/newsroom/newsrelease/110617_ORIXG.html
venue('大阪厚生年金会館','大阪厚生年金会館大ホール','大阪厚生年金会館（大ホール）','オリックス劇場');
// 名古屋市 https://www.city.nagoya.jp/houdou/pressr7/3002888/3003605.html
venue('名古屋市総合体育館レインボーホール','レインボーホール','名古屋レインボーホール','日本ガイシホール','クロコくんホール');
// 名古屋市 https://www.city.nagoya.jp/kankou/bunka/1034457/1016004/1016032.html
facility(['名古屋市民会館','中京大学文化市民会館','日本特殊陶業市民会館','Niterra日本特殊陶業市民会館','Niterra HALL'],['大ホール','中ホール','フォレストホール','ビレッジホール']);
venue('名古屋市民会館大ホール','中京大学文化市民会館大ホール','中京大学文化市民会館フォレストホール','日本特殊陶業市民会館フォレストホール','Niterra日本特殊陶業市民会館フォレストホール');
venue('名古屋市民会館中ホール','中京大学文化市民会館中ホール','中京大学文化市民会館ビレッジホール','日本特殊陶業市民会館ビレッジホール','Niterra日本特殊陶業市民会館ビレッジホール');
// ソフトバンクホークス https://www.softbankhawks.co.jp/news/detail/00002966.html
venue('福岡ドーム','福岡Yahoo! JAPANドーム','福岡Yahoo!ドーム','Yahoo! JAPANドーム','ヤフードーム','福岡ヤフードーム','福岡ヤフオク!ドーム','福岡ヤフオクドーム','ヤフオクドーム','福岡PayPayドーム','PayPayドーム','みずほPayPayドーム福岡','みずほPayPayドーム');
venue('大阪ドーム','京セラドーム大阪','京セラドーム','KYOCERA DOME OSAKA');
// https://www.sapporo-dome.co.jp/information/2024/07/19/14012/
venue('札幌ドーム','大和ハウス プレミストドーム','プレミストドーム','Daiwa House PREMIST DOME');
// 旧渋谷公会堂は現LINE CUBE SHIBUYAと建物が異なる。旧施設の名称だけ登録。
venue('渋谷公会堂','C.C.Lemonホール','CC Lemonホール','C.C.レモンホール');
venue('LINE CUBE SHIBUYA','LINE CUBE渋谷','ラインキューブ渋谷');
venue('国立代々木競技場第一体育館','代々木第一体育館','代々木第一','代々木第1体育館','国立代々木競技場第1体育館');
venue('国立代々木競技場第二体育館','代々木第二体育館','代々木第二','代々木第2体育館','国立代々木競技場第2体育館');
venue('日本武道館','武道館','NIPPON BUDOKAN');
venue('大阪城ホール','城ホール','OSAKA-JO HALL');
venue('大阪フェスティバルホール','フェスティバルホール','大阪・フェスティバルホール');
venue('福岡サンパレス','福岡サンパレス ホテル＆ホール','福岡サンパレスホテル&ホール','福岡サンパレスホール');
venue('札幌文化芸術劇場 hitaru','札幌文化芸術劇場','hitaru');
venue('札幌コンサートホールKitara 大ホール','札幌コンサートホールキタラ大ホール','Kitara大ホール','キタラ大ホール');
venue('東京国際フォーラム ホールA','東京国際フォーラム・ホールA','国際フォーラム ホールA');
venue('東京国際フォーラム ホールC','東京国際フォーラム・ホールC','国際フォーラム ホールC');
venue('神戸国際会館こくさいホール','神戸国際会館・こくさいホール','こくさいホール');
venue('名古屋国際会議場センチュリーホール','名古屋国際会議場 センチュリーホール','センチュリーホール');
venue('広島文化学園HBGホール','広島市文化交流会館ホール','HBGホール');
facility(['鹿児島市民文化ホール','川商ホール'],['第一','第1','第一ホール','第1ホール','第二','第2','第二ホール','第2ホール']);
venue('鹿児島市民文化ホール第一','鹿児島市民文化ホール第1ホール','川商ホール第一','川商ホール第1ホール','川商ホール（鹿児島市民文化ホール）第一');
venue('鹿児島市民文化ホール第二','鹿児島市民文化ホール第2ホール','川商ホール第二','川商ホール第2ホール','川商ホール（鹿児島市民文化ホール）第二');
venue('米子コンベンションセンター','米子コンベンションセンター（BIG SHIP）','BIG SHIP','ビッグシップ');
venue('ビルボードライブ東京','Billboard Live Tokyo');
venue('ビルボードライブ大阪','Billboard Live Osaka');
venue('ビルボードライブ横浜','Billboard Live Yokohama');
venue('横浜アリーナ','横アリ','YOKOHAMA ARENA');
venue('さいたまスーパーアリーナ','SSA','SAITAMA SUPER ARENA');
venue('マリンメッセ福岡','マリンメッセ福岡A館');
venue('府中の森芸術劇場どりーむホール','府中の森芸術劇場 どりーむホール','どりーむホール');
venue('大宮ソニックシティ大ホール','大宮ソニックシティ・大ホール','ソニックシティ大ホール');
venue('富士急ハイランド コニファーフォレスト','富士急ハイランド・コニファーフォレスト','コニファーフォレスト');
const lookup=new Map();
for(const g of groups){g.keys=new Set(g.names.map(key));g.recordKeys=new Set(g.keys);for(const a of g.keys)for(const s of g.suffixes||[])g.recordKeys.add(a+key(s));for(const k of g.keys){if(lookup.has(k)&&lookup.get(k)!==g)throw Error('別名辞書の重複: '+k);lookup.set(k,g);}}
function parse(source){
 const text=String(source??'').normalize('NFKC'),tokens=[];let word='',phrase=false,closing='';
 const push=()=>{const value=word.trim();if(value)tokens.push({value,phrase});word='';phrase=false;};
 for(const ch of text){if(closing){if(ch===closing){push();closing='';}else word+=ch;continue;}if(ch==='"'||ch==='“'||ch==='「'){push();closing=ch==='“'?'”':ch==='「'?'」':'"';phrase=true;}else if(/\s/.test(ch))push();else word+=ch;}push();
 // 登録済みの複数語名称のみ結合。一般のAND検索は従来通り。
 const out=[];for(let i=0;i<tokens.length;){let found=0;for(let j=Math.min(tokens.length,i+8);j>i+1;j--){const part=tokens.slice(i,j);if(part.some(t=>t.phrase))continue;const value=part.map(t=>t.value).join(' ');if(lookup.has(key(value))){out.push({value,phrase:false,alias:true});found=j-i;break;}}if(found)i+=found;else out.push(tokens[i++]);}return out;
}
const recordCache=new WeakMap();
function recordKeys(e){let v=recordCache.get(e);if(!v){v={artist:key(e.artist),venue:key(e.venue)};recordCache.set(e,v);}return v;}
function matches(e,hay,term){
 // 元の全文検索を優先して維持する。
 if(hay.includes(term))return true;
 const k=key(term);if(!k)return false;const g=lookup.get(k),r=recordKeys(e);
 if(g&&g.recordKeys.has(r[g.field]))return true;
 // 辞書未登録でも会場名内の空白・中点などの表記差を吸収する。
 // 記号だけの検索や短すぎる語には適用しない。
 return k.length>=3 && r.venue.includes(k);
}
// 索引用：施設全体と各ホールの混同を避け、完全一致の別名のみ返す。
function venueGroup(name){const k=key(name),g=lookup.get(k);if(!g||g.field!=='venue'||g.suffixes)return null;return {key:key(g.names[0]),label:g.names[0],names:[...g.names]};}
window.CA_SEARCH_ALIASES=Object.freeze({parse,matches,venueGroup,groupCount:groups.length});
})();
