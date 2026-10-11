const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync(__dirname+'/TU962-Arcade-Test.js','utf8');
async function run({app=false,family='medium',cache=false,failure=false}={}){
 const files=new Map();if(cache){files.set('/docs/TU962-Arcade-Test-'+family+'.png','image');files.set('/docs/TU962-Arcade-Test-'+family+'.json',JSON.stringify({background:'#0a142e'}));}
 let webViews=0,selected,completed;const done=new Promise(r=>completed=r),labels=[];
 class Box{setPadding(){}addImage(image){this.image=image;return {applyFittingContentMode(){},centerAlignImage(){}}}addText(t){labels.push(t);return {}}async presentMedium(){selected=this}}
 class Alert{addAction(){}addCancelAction(){}async presentSheet(){return 0}async presentAlert(){}}
 class WebView{constructor(){webViews++}async loadHTML(html){assert.match(html,/data:font\/ttf;base64,/)}async evaluateJavaScript(source,callback){if(!callback){assert.ok(source.endsWith('null;'));return null;}if(failure)return {error:'Font failed'};const model=JSON.parse(source.slice('renderArcade('.length,source.indexOf(').then(')));assert.equal(model.appearance.background,'Midnight');return {png:'data:image/png;base64,aW1hZ2U=',fontLoaded:true,arcadeWidth:108,fallbackWidth:65,width:688,height:model.family==='large'?720:340,shown:2};}}
 vm.runInNewContext(script,{config:{runsInApp:app,runsInWidget:!app,widgetFamily:family},FileManager:{local:()=>({documentsDirectory:()=>'/docs',joinPath:(a,b)=>a+'/'+b,fileExists:p=>files.has(p),writeImage:(p,image)=>files.set(p,image),readImage:p=>files.get(p),writeString:(p,s)=>files.set(p,s),readString:p=>files.get(p)})},WebView,Alert,ListWidget:Box,Color:class{},Data:{fromBase64String:s=>s},Image:{fromData:s=>s},Script:{setWidget:w=>selected=w,complete:completed},console:{error(){}}});
 await done;return {files,webViews,selected,labels};
}
test('generation embeds Arcade and caches two separate test images without touching the current timetable',async()=>{const r=await run({app:true});assert.equal(r.webViews,1);assert.equal(r.files.size,4);assert.ok([...r.files.keys()].every(k=>k.startsWith('/docs/TU962-Arcade-Test-')));assert.equal(r.selected.image,'aW1hZ2U=');});
test('home-screen widget reads its image without starting WebView',async()=>{const r=await run({cache:true,family:'large'});assert.equal(r.webViews,0);assert.equal(r.selected.image,'image');});
test('missing image and font failure give a setup message rather than an empty widget',async()=>{const missing=await run();assert.ok(missing.labels.some(t=>t.includes('generate the sample images')));const failed=await run({app:true,failure:true});assert.equal(failed.files.size,0);});

