const fm=FileManager.local(),prefix=fm.joinPath(fm.documentsDirectory(),'TU962-Arcade-Test');
const w=new ListWidget();w.setPadding(0,0,0,0);w.backgroundColor=new Color('#0a142e');
async function alert(message){const a=new Alert();a.title='Arcade font test';a.message=message;a.addAction('OK');await a.presentAlert();}
if(config.runsInApp){
  const a=new Alert();a.title='Isolated Arcade test';a.message='This creates separate test images. It does not replace your timetable widget. The sample date is 05/10/2026.';a.addAction('Generate sample images');a.addAction('Import JSON and generate');a.addAction('Preview cached image');a.addCancelAction('Cancel');
  const choice=await a.presentSheet();if(choice<0){Script.complete();return;}
  if(choice!==2){
    let appearance={...defaults,background:'Midnight',font:'8-Bit Arcade',accent:'Mint'},entries=SAMPLE;
    if(choice===1){const imported=validate(JSON.parse(fm.readString(await DocumentPicker.openFile())));appearance={...imported.appearance,font:'8-Bit Arcade'};entries=onDate(imported.entries,'2026-10-05',appearance);}
    const bg=backgrounds[appearance.background]||resolveColor(appearance.background,'#f7f7fa'),light=lightBackground(appearance.background);
    const view=new WebView();
    await view.loadHTML('<!doctype html><style>@font-face{font-family:TU962Arcade;src:url(data:font/ttf;base64,'+FONT_DATA+') format("truetype")}</style><body></body>');
    await view.evaluateJavaScript(RENDERER+'\nnull;',false);
    for(const family of ['medium','large']){
      const model={family,entries,heading:'Monday, 05/10/2026',appearance,background:bg,text:resolveColor(appearance.text,light?'#172334':'#ffffff'),secondary:resolveColor(appearance.secondary,light?'#526075':'#d0daed'),accent:resolveColor(appearance.accent,'#43e6a3'),time:resolveColor(appearance.time,resolveColor(appearance.accent,'#43e6a3'))};
      const result=await view.evaluateJavaScript('renderArcade('+JSON.stringify(model)+').then(r=>completion(r),e=>completion({error:String(e)}));',true);
      if(result.error)throw Error(result.error);if(!result.fontLoaded||result.arcadeWidth===result.fallbackWidth)throw Error('Font loading check failed.');
      fm.writeImage(prefix+'-'+family+'.png',Image.fromData(Data.fromBase64String(result.png.split(',')[1])));
      fm.writeString(prefix+'-'+family+'.json',JSON.stringify({font:'Arcade',date:'05/10/2026',family,background:bg,shown:result.shown,width:result.width,height:result.height}));
    }
    await alert('Generated real Arcade PNGs for medium and large widgets. Add a separate Scriptable widget and select this test script. This test keeps the sample day fixed. Transparent PNGs do not automatically make an iPhone widget transparent.');
  }
}
const family=config.widgetFamily==='large'?'large':'medium',path=prefix+'-'+family+'.png';
if(config.runsInWidget&&config.widgetFamily==='small'){const t=w.addText('Choose medium or large for this font test.');t.textColor=new Color('#ffffff');}
else if(fm.fileExists(path)){const meta=JSON.parse(fm.readString(prefix+'-'+family+'.json'));w.backgroundColor=new Color(meta.background==='transparent'?'#f7f7fa':meta.background);const img=w.addImage(fm.readImage(path));img.resizable=true;img.applyFittingContentMode();img.centerAlignImage();img.tintColor=null;}
else {const t=w.addText('Open TU962 Arcade Test in Scriptable and generate the sample images first.');t.textColor=new Color('#ffffff');}
if(config.runsInWidget)Script.setWidget(w);else await w.presentMedium();Script.complete();

