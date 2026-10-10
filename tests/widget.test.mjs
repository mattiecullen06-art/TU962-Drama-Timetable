import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {defaults,removeOccurrence} from '../engine.mjs';
import {widgetDay,kustomData} from '../widget-data.mjs';
const entries=JSON.parse(readFileSync(new URL('../seed.json',import.meta.url)));
const state={schemaVersion:2,course:'TU962',entries,appearance:{...defaults}};
test('Android export preserves dated weeks, hidden sessions and deletions',()=>{
  const changed=structuredClone(state);changed.entries=removeOccurrence(changed.entries,changed.entries.find(e=>e.date==='2026-10-05').id,'2026-10-05');
  const data=kustomData(changed);
  assert.notEqual(data.days['2026-10-05'],kustomData(state).days['2026-10-05']);
  assert.match(data.days['2026-11-09'],/22:00/);
  assert.match(data.days['2027-04-19'],/Exam/);
  assert.equal(data.days['2026-12-21'],'No saved classes');
  changed.entries.forEach(e=>e.enabled=false);assert.equal(kustomData(changed).days['2026-10-05'],'No saved classes');
});
test('next classes skip ended sessions and weekends, do not invent extra classes',()=>{
  const next={...state,appearance:{...defaults,next:true}};
  assert.equal(widgetDay(next,'2026-10-05','23:00').date,'2026-10-06');
  assert.equal(widgetDay(next,'2026-10-10').date,'2026-10-12');
  assert.deepEqual(widgetDay({...next,entries:[]},'2026-10-10').entries,[]);
});
// Execute the actual distributed Scriptable script against API mocks to catch import/render failures.
const script=readFileSync(new URL('../widgets/TU962-Scriptable.js',import.meta.url),'utf8');
async function runScript(saved,options={}) {
  const labels=[],files=new Map(saved?[['/docs/TU962-timetable.json',JSON.stringify(saved)]]:[]),imported=options.imported;
  if(imported)files.set('/picked',JSON.stringify(imported));
  class Box {addText(t){labels.push(t);return {}}addStack(){return new Box()}addSpacer(){}setPadding(){}layoutHorizontally(){}layoutVertically(){}topAlignContent(){}async presentMedium(){}}
  const font={systemFont:()=>({}),boldSystemFont:()=>({}),regularMonospacedSystemFont:()=>({})};
  class Alert {addAction(){}addCancelAction(){}async presentSheet(){return imported?0:1}async presentAlert(){throw Error('Unexpected alert')}}
  let finish;const done=new Promise(r=>finish=r);
  vm.runInNewContext(script,{FileManager:{local:()=>({documentsDirectory:()=>'/docs',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),readString:p=>files.get(p),writeString:(p,s)=>files.set(p,s)})},config:{runsInApp:!!imported,runsInWidget:!imported,widgetFamily:options.family||'large'},ListWidget:Box,Color:class{},Size:class{},Font:Object.assign(function(){},font),Alert,DocumentPicker:{openFile:async()=>'/picked'},Script:{setWidget:()=>{},complete:finish},Intl,Date,console});
  await Promise.race([done,new Promise((_,reject)=>setTimeout(()=>reject(Error('Widget did not complete')),1000))]);
  return {labels,files};
}
test('Scriptable uses imported schedule and handles missing setup',async()=>{
  const missing=await runScript();assert.ok(missing.labels.some(t=>t.includes('import your exported timetable')));
  const imported=await runScript(null,{imported:state});assert.equal(JSON.parse(imported.files.get('/docs/TU962-timetable.json')).entries.length,224);
  for(const font of ['Modern','Rounded','Mono','Classic','Handwritten','8-Bit Arcade','Digital Clock'])await runScript({...state,appearance:{...defaults,font,next:true}});
});
