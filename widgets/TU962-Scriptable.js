// TU962 Drama · Scriptable home-screen widget
// Copy all of this script into Scriptable, name it TU962, and run to import.
(async()=>{
const defaults={background:'Light',font:'Modern',accent:'Blue',text:'Automatic',secondary:'Automatic',time:'Accent',scale:1,corners:20,rows:4,showRoom:true,showType:true,showBars:true,compact:false,next:false,semesterStart:'2026-10-05',semesterEnd:'2027-05-31',moduleColors:{}};
const iso=d=>d.toISOString().slice(0,10);
const date=s=>new Date(s+'T12:00:00Z');
const validDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(date(s))&&iso(date(s))===s;
const addDays=(s,n)=>iso(new Date(+date(s)+n*86400000));
const monday=s=>addDays(s,-((date(s).getUTCDay()+6)%7));
const weekNumber=(s,start)=>Math.floor((date(s)-date(monday(start)))/604800000)+1;
function onDate(entries,s,style){return entries.filter(e=>e.enabled&&!e.excludedDates?.includes(s)&&(e.recurrence==='ONE_OFF'?e.date===s:s>=style.semesterStart&&s<=style.semesterEnd&&e.day==((date(s).getUTCDay()+6)%7)+1&&(e.recurrence==='WEEKLY'||e.selectedWeeks.includes(weekNumber(s,style.semesterStart))))).sort((a,b)=>a.start.localeCompare(b.start)||a.id-b.id);}
function validEntry(e){return Number.isSafeInteger(e.id)&&e.id>0&&typeof e.module==='string'&&e.module.trim()&&e.module.length<=200&&typeof e.type==='string'&&e.type.length<=80&&typeof e.location==='string'&&e.location.length<=300&&typeof e.notes==='string'&&e.notes.length<=1000&&[1,2,3,4,5,6,7].includes(e.day)&&[e.start,e.end].every(t=>/^([01]\d|2[0-3]):[0-5]\d$/.test(t))&&e.end>e.start&&typeof e.enabled==='boolean'&&['ONE_OFF','WEEKLY','SELECTED_WEEKS'].includes(e.recurrence)&&(e.recurrence!=='ONE_OFF'||validDate(e.date))&&Array.isArray(e.selectedWeeks)&&e.selectedWeeks.every(n=>Number.isInteger(n)&&n>=1&&n<=53)&&(e.recurrence!=='SELECTED_WEEKS'||e.selectedWeeks.length>0)&&(!e.excludedDates||Array.isArray(e.excludedDates)&&e.excludedDates.every(validDate));}
function validate(data){if(data?.schemaVersion!==2||data.course!=='TU962'||!Array.isArray(data.entries)||data.entries.length>5000||!data.entries.every(validEntry)||new Set(data.entries.map(e=>e.id)).size!==data.entries.length)throw Error('This is not a valid TU962 timetable file.');const a={...defaults,...data.appearance};if(!validDate(a.semesterStart)||!validDate(a.semesterEnd)||a.semesterEnd<a.semesterStart||!Number.isFinite(a.scale)||a.scale<.85||a.scale>1.25||!Number.isInteger(a.rows)||a.rows<3||a.rows>6||!Number.isFinite(a.corners)||a.corners<0||a.corners>40)throw Error('Invalid appearance or teaching dates.');for(const k of ['background','font','accent','text','secondary','time'])if(typeof a[k]!=='string'||a[k].length>80)throw Error('Invalid appearance.');for(const k of ['showRoom','showType','showBars','compact','next'])if(typeof a[k]!=='boolean')throw Error('Invalid display option.');return {...data,appearance:a};}
function removeOccurrence(entries,id,s){return entries.flatMap(e=>e.id!==id?[e]:e.recurrence==='ONE_OFF'?[]:[{...e,excludedDates:[...new Set([...(e.excludedDates||[]),s])]}]);}

const palette={Blue:'#0a4fb5',Mint:'#43e6a3',Sky:'#49d3ff',Purple:'#ae79ff',Amber:'#ffc453',Rose:'#ff6680',White:'#ffffff',Black:'#000000',Grey:'#808080'};
const backgrounds={Light:'#f7f7fa',Midnight:'#0a142e',AMOLED:'#000000',Glass:'#304769',Nord:'#2e3340',Sunset:'#3b1f2b'};
const resolveColor=(s,f)=>palette[s]||(/^#[0-9a-f]{6}$/i.test(s)?s:f);
function widgetDay(state,day,time='00:00') {
  const a=state.appearance;
  let d=day, entries=onDate(state.entries,d,a);
  if(a.next) {
    entries=entries.filter(e=>e.end>time);
    for(let i=1;!entries.length&&i<=366;i++) {d=addDays(day,i);entries=onDate(state.entries,d,a);}
    if(!entries.length)d=day;
  }
  return {date:d,entries};
}
// KWGT reads precomputed dates rather than guessing that every week repeats.
function kustomData(input) {
  const state=validate(input),a=state.appearance;
  const dates=state.entries.filter(e=>e.recurrence==='ONE_OFF').map(e=>e.date);
  const start=[a.semesterStart,...dates].sort()[0],end=[a.semesterEnd,...dates].sort().at(-1);
  if((date(end)-date(start))/86400000>3660)throw Error('Android supports a maximum of ten years. Shorten your teaching dates.');
  const days={};
  for(let d=start;d<=end;d=addDays(d,1)) {
    const es=onDate(state.entries,d,a),visible=es.slice(0,a.rows);
    days[d]=visible.map(e=>`${e.start}–${e.end}  ${e.module}${a.showType||a.showRoom?'\n'+[a.showType?e.type:'',a.showRoom?e.location:''].filter(Boolean).join(' · '):''}`).join(a.compact?'\n':'\n\n')+(es.length>a.rows?`\n+${es.length-a.rows} more`:'')||'No saved classes';
  }
  const light=a.background==='Light';
  return {schemaVersion:1,course:'TU962',timezone:'Europe/Dublin',start,end,days,appearance:{background:backgrounds[a.background]||resolveColor(a.background,'#f7f7fa'),text:resolveColor(a.text,light?'#172334':'#ffffff'),accent:resolveColor(a.accent,'#0a4fb5'),font:a.font,scale:a.scale,corners:a.corners},mode:'today'};
}
// This adapter is bundled after the same timetable engine used by the web app.
const fm=FileManager.local(), saved=fm.joinPath(fm.documentsDirectory(),'TU962-timetable.json');
let state;
if(config.runsInApp) {
  const prompt=new Alert();prompt.title='TU962 timetable';
  prompt.message='Import the timetable & appearance file exported from the web app. Later changes need another import.';
  prompt.addAction('Import timetable file');prompt.addAction('Preview saved timetable');prompt.addCancelAction('Cancel');
  const action=await prompt.presentSheet();
  if(action===-1){Script.complete();return;}
  if(action===0) {
    try {
      const path=await DocumentPicker.openFile();
      const imported=validate(JSON.parse(fm.readString(path)));
      fm.writeString(saved,JSON.stringify(imported));
    } catch(error) {
      const alert=new Alert();alert.title='Could not import';alert.message=String(error.message||error);alert.addAction('OK');await alert.presentAlert();Script.complete();return;
    }
  }
}
const w=new ListWidget();w.setPadding(12,12,12,12);
try {
  if(!fm.fileExists(saved))throw Error('Open TU962 in Scriptable and import your exported timetable file first.');
  state=validate(JSON.parse(fm.readString(saved)));
  const a=state.appearance, now=new Date();
  const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Dublin',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Dublin',hour:'2-digit',minute:'2-digit',hour12:false}).format(now);
  const result=widgetDay(state,day,time), light=a.background==='Light';
  w.backgroundColor=new Color(backgrounds[a.background]||resolveColor(a.background,'#f7f7fa'));
  const text=resolveColor(a.text,light?'#172334':'#ffffff'), secondary=resolveColor(a.secondary,light?'#526075':'#d0daed'), accent=resolveColor(a.accent,'#0a4fb5');
  function font(size,bold=false) {
    size*=a.scale;
    if(a.font==='Mono')return Font.regularMonospacedSystemFont(size);
    const names={Classic:'Georgia',Handwritten:'Noteworthy',Rounded:'AvenirNext-Regular'};
    // Web-only Arcade and Digital fonts use monospaced iOS fonts here.
    if(a.font==='8-Bit Arcade'||a.font==='Digital Clock')return Font.regularMonospacedSystemFont(size);
    return names[a.font]?new Font(names[a.font],size):bold?Font.boldSystemFont(size):Font.systemFont(size);
  }
  const heading=w.addText(date(result.date).toLocaleDateString('en-IE',{weekday:'long',day:'numeric',month:'short',timeZone:'UTC'}));heading.font=font(14,true);heading.textColor=new Color(text);heading.lineLimit=1;
  const subtitle=w.addText('TU962 · Drama');subtitle.font=font(10);subtitle.textColor=new Color(secondary);
  w.addSpacer(a.compact?6:10);
  const family=config.widgetFamily||'medium';
  const count=Math.min(a.rows,family==='small'?2:family==='medium'?3:6);
  const es=result.entries;
  for(const e of es.slice(0,count)) {
    const row=w.addStack();row.layoutHorizontally();row.topAlignContent();
    if(a.showBars){const bar=row.addStack();bar.size=new Size(3,a.compact?28:36);bar.backgroundColor=new Color(accent);row.addSpacer(7);}
    const times=row.addStack();times.layoutVertically();times.size=new Size(42,0);
    const start=times.addText(e.start);start.font=font(12,true);start.textColor=new Color(resolveColor(a.time,accent));
    const end=times.addText(e.end);end.font=font(10);end.textColor=new Color(resolveColor(a.time,accent));
    row.addSpacer(6);
    const body=row.addStack();body.layoutVertically();
    const name=body.addText(e.module);name.font=font(12,true);name.textColor=new Color(text);name.lineLimit=1;name.minimumScaleFactor=.7;
    const detail=[a.showType?e.type:'',a.showRoom?e.location:''].filter(Boolean).join(' · ');
    if(detail){const label=body.addText(detail);label.font=font(10);label.textColor=new Color(secondary);label.lineLimit=1;label.minimumScaleFactor=.7;}
    w.addSpacer(a.compact?4:7);
  }
  if(!es.length){const empty=w.addText('No saved classes');empty.font=font(12);empty.textColor=new Color(secondary);}
  if(es.length>count){const more=w.addText('+'+(es.length-count)+' more');more.font=font(10);more.textColor=new Color(secondary);}
  w.addSpacer();
  // Refresh requests are advisory: iOS controls when widgets actually update.
  w.refreshAfterDate=new Date(Date.now()+15*60*1000);
} catch(error) {
  w.backgroundColor=new Color('#f7f7fa');const title=w.addText('TU962 Drama');title.font=Font.boldSystemFont(16);title.textColor=new Color('#172334');w.addSpacer(8);const hint=w.addText(String(error.message||error));hint.font=Font.systemFont(12);hint.textColor=new Color('#526075');
}
if(config.runsInWidget)Script.setWidget(w);else await w.presentMedium();
Script.complete();

})().catch(async error=>{const a=new Alert();a.title="TU962 error";a.message=String(error);a.addAction("OK");await a.presentAlert();});
