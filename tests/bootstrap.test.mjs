import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as engine from '../engine.mjs';import {kustomData} from '../widget-data.mjs';
test('web app boots and shows widget instructions without a saved file',async()=>{
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
  const elements=new Map();
  function element(id){if(!elements.has(id))elements.set(id,{value:'',textContent:'',innerHTML:'',style:{setProperty(){}},elements:{recurrence:{}},remove(){},append(){}});return elements.get(id)}
  const doc={getElementById:element,addEventListener(){},querySelectorAll:()=>[],createElement:()=>({})};
  const run=new Function('document','fetch','localStorage','navigator',...Object.keys(engine),'kustomData','return (async()=>{'+source+'})()');
  await run(doc,async()=>({ok:true,json:async()=>JSON.parse(readFileSync(new URL('../seed.json',import.meta.url)))}),{getItem:()=>null},{},...Object.values(engine),kustomData);
  assert.match(element('days').innerHTML,/No saved classes|class/);
  assert.match(element('options').innerHTML,/Font changes all widget text/);
  assert.equal(element('kwgtFormula').value,`$wg("file:///sdcard/Download/TU962-widget.json", json, ".days['" + df(yyyy-MM-dd) + "']")$`);
  assert.equal(typeof element('exportKWGT').onclick,'function');
});
