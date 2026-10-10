import {test} from 'node:test';import assert from 'node:assert/strict';
import {irishDate,parseIrishDate} from '../date-format.mjs';
import {kustomData,lightBackground} from '../widget-data.mjs';import {defaults} from '../engine.mjs';
test('Irish date entry round trips without changing schedule dates and rejects impossible dates',()=>{
  assert.equal(irishDate('2026-10-05'),'05/10/2026');assert.equal(parseIrishDate('05/10/2026'),'2026-10-05');
  assert.equal(parseIrishDate('29/02/2028'),'2028-02-29');
  for(const s of ['29/02/2027','31/04/2026','10/13/2026','2026-10-05','5/10/2026'])assert.equal(parseIrishDate(s),null);
});
test('pastel backgrounds have dark automatic text and Android transparency remains transparent',()=>{
  for(const background of ['Cream','Blush','Lavender','Pale blue','Sage','Peach']){assert.equal(lightBackground(background),true);assert.equal(kustomData({schemaVersion:2,course:'TU962',entries:[],appearance:{...defaults,background}}).appearance.text,'#172334');}
  assert.equal(lightBackground('Forest'),false);
  assert.equal(kustomData({schemaVersion:2,course:'TU962',entries:[],appearance:{...defaults,background:'Transparent'}}).appearance.background,'transparent');
});

