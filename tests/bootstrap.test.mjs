import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as engine from '../engine.mjs';import * as widgetData from '../widget-data.mjs';import * as dateFormat from '../date-format.mjs';
test('web app boots and shows widget instructions without a saved file',async()=>{
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
  const elements=new Map();
  function element(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',style:{setProperty(){}},elements:{recurrence:{}},setAttribute(){},remove(){},append(){}});return elements.get(id)}
  const doc={documentElement:{dataset:{}},getElementById:element,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({})};
  const bindings={...engine,...widgetData,...dateFormat},saved=new Map();
  const run=new Function('document','fetch','localStorage','navigator',...Object.keys(bindings),'return (async()=>{'+source+'})()');
  await run(doc,async()=>({ok:true,json:async()=>JSON.parse(readFileSync(new URL('../seed.json',import.meta.url)))}),{getItem:()=>null,setItem:(k,v)=>saved.set(k,v)},{},...Object.values(bindings));
  assert.match(element('days').innerHTML,/No saved classes|class/);
  assert.match(element('options').innerHTML,/Font changes all widget text/);
  assert.equal(element('kwgtFormula').value,`$wg("file:///sdcard/Download/TU962-widget.json", json, ".days['" + df(yyyy-MM-dd) + "']")$`);
  assert.equal(typeof element('exportKWGT').onclick,'function');
  assert.match(element('weekTitle').textContent,/\d{2}\/\d{2}\/\d{4}/);
  element('date').onchange({target:{value:'05/10/2026'}});assert.equal(element('date').value,'05/10/2026');
  element('date').onchange({target:{value:'31/02/2026'}});assert.equal(element('date').value,'05/10/2026');
  const preview=element('widget').innerHTML;element('themeToggle').onclick();assert.equal(doc.documentElement.dataset.theme,'dark');assert.equal(element('widget').innerHTML,preview);assert.equal(saved.get('tu962-theme'),'dark');assert.equal(saved.has('tu962-v2'),false);
});

