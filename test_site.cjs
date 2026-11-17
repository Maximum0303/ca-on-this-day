const fs=require('fs'); const vm=require('vm'); const assert=require('assert');
const path=require('path');const root=__dirname;
const archive=JSON.parse(fs.readFileSync(path.join(root,'data/events.json'),'utf-8'));
assert.strictEqual(archive.events.length,73);
assert.strictEqual(archive.events.filter(e=>e.category==='live').length,70);
assert.strictEqual(archive.events.filter(e=>e.category==='release').length,3);
assert.strictEqual(new Set(archive.events.map(e=>e.id)).size,73);
assert(archive.events.every(e=>e.sources?.[0]?.url?.startsWith('https://')));
assert.strictEqual(archive.events.filter(e=>e.date==='1993-11-19').length,3);
class Element {
 constructor(id){this.id=id;this.value=['artist-filter','category-filter','decade-filter'].includes(id)?'all':'';this.listeners={};this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.style={};this.dataset={};this.classList={add(){},remove(){}};}
 addEventListener(k,fn){this.listeners[k]=fn;}
 fire(k,data={}){if(!this.listeners[k])throw Error(`No event ${this.id}.${k}`);this.listeners[k]({preventDefault(){},target:this,...data});}
 scrollIntoView(){}
 reset(){}
}
function setup(href){const nodes={};const get=id=>nodes[id]??=new Element(id);const loc={href,search:new URL(href).search};const history={replaceState(a,b,url){loc.href=String(url);loc.search=new URL(loc.href).search;}};
const document={getElementById:get,querySelector:q=>get(q),createElement:()=>new Element('new'),body:{append(){}}};
const window={CA_EVENT_DATA:archive,open(){},addEventListener(){},scrollTo(){}};
const context={window,document,location:loc,history,Intl,Date,URL,URLSearchParams,String,Number,Array,Object,Math,console,alert(){},confirm(){return true;},setTimeout,structuredClone};
vm.createContext(context);return {context,get,nodes};}
const {context,get}=setup('https://example.org/ca-on-this-day/?date=11-19');
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
assert.strictEqual(get('record-total').textContent,'試験収録 73 件');
assert.strictEqual(get('day-summary').textContent,'3件の出来事が登録されています');
assert(get('day-events').innerHTML.includes('岡山市総合文化体育館'));
assert(get('results-count').textContent.startsWith('該当 73 件'));
get('keyword').value='横浜アリーナ';get('keyword').fire('input');
assert(get('results-count').textContent.startsWith('該当 4 件'));
get('reset-filters').fire('click');
get('all-day').fire('click');
assert(get('results-count').textContent.startsWith('該当 3 件'));
get('today-btn').fire('click');assert(/月\d+日/.test(get('hero-date-ja').textContent));
get('category-filter').value='release';get('category-filter').fire('change');
assert(get('results-count').textContent.startsWith('該当 3 件'));
const second=setup('https://example.org/ca-on-this-day/?date=02-29');
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),second.context);
assert.strictEqual(second.get('selected-date').textContent,'2月29日');
assert(second.get('calendar-cells').innerHTML.includes('aria-label="2月29日"'));
console.log('PASS: 73 rows, unique IDs, 70 shows, 3 releases, Nov19 3 records, UI initialization, keyword, day filter, reset, today, category, leap-day');
const editor=setup('https://example.org/ca-on-this-day/admin.html');
vm.runInContext(fs.readFileSync(path.join(root,'admin.js'),'utf8'),editor.context);
assert.strictEqual(editor.get('admin-total').textContent,'73件');
for(const [id,value] of Object.entries({'f-date':'2000-01-01','f-artist':'ASKA','f-category':'milestone','f-title':'登録テスト','f-source':'https://example.org','f-source-label':'テスト資料','f-verification':'secondary','f-status':'recorded'}))editor.get(id).value=value;
editor.get('event-form').fire('submit');
assert.strictEqual(editor.get('admin-total').textContent,'74件');
assert(editor.get('save-hint').textContent.includes('未書き出し'));
console.log('PASS: admin edit tool can add one item and marks unsaved changes');
