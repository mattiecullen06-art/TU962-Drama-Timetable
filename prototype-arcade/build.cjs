const fs=require('node:fs'),root='outputs/tu962-arcade-prototype/';
function strip(s){return s.replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');}
const engine=strip(fs.readFileSync('outputs/tu962-public-repository/engine.mjs','utf8'));
const common=strip(fs.readFileSync('outputs/tu962-public-repository/widget-data.mjs','utf8'));
const sample=JSON.parse(fs.readFileSync('outputs/tu962-public-repository/seed.json','utf8')).filter(e=>e.date==='2026-10-05');
const renderer=fs.readFileSync(root+'render.js','utf8'),font=fs.readFileSync('outputs/tu962-public-repository/arcade.ttf').toString('base64');
const code='// Isolated Arcade font prototype. Create a NEW Scriptable script named TU962 Arcade Test.\n(async()=>{\n'+engine+common+'\nconst SAMPLE='+JSON.stringify(sample)+';\nconst RENDERER='+JSON.stringify(renderer)+';\nconst FONT_DATA='+JSON.stringify(font)+';\n'+fs.readFileSync(root+'adapter.js','utf8')+'\n})().catch(async e=>{console.error(String(e));if(config.runsInApp){const a=new Alert();a.title="Arcade test failed";a.message=String(e);a.addAction("OK");await a.presentAlert();}else{const w=new ListWidget();const t=w.addText("Arcade test failed. Open the test script in Scriptable to diagnose.");Script.setWidget(w);}Script.complete();});\n';
fs.writeFileSync(root+'TU962-Arcade-Test.js',code);fs.copyFileSync('outputs/tu962-public-repository/PressStart2P-OFL.txt',root+'FONT-LICENSE.txt');
console.log('Separate prototype generated, '+Buffer.byteLength(code)+' bytes.');

